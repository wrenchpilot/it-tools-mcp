#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testQRGenerator() {
  console.log('🧪 Testing improved QR code generator...\n');
  
  const serverPath = join(__dirname, 'build', 'index.js');
  
  const tests = [
    {
      name: 'qr-generate', 
      args: { text: 'Hello QR!' },
      description: 'Simple text QR code'
    },
    {
      name: 'qr-generate', 
      args: { text: 'https://github.com', size: 1 },
      description: 'URL QR code'
    },
    {
      name: 'wifi-qr-code-generator', 
      args: { 
        ssid: 'TestNetwork', 
        password: 'password123',
        security: 'WPA'
      },
      description: 'WiFi QR code'
    }
  ];
  
  for (const test of tests) {
    console.log(`📋 Test: ${test.description}`);
    console.log(`🔧 Tool: ${test.name}`);
    console.log(`📝 Args: ${JSON.stringify(test.args)}\n`);
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: test.name,
        arguments: test.args
      }
    };
    
    const child = spawn('node', [serverPath], { 
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Send request
    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
    
    await new Promise((resolve) => {
      child.on('close', (code) => {
        const lines = output.trim().split('\n');
        const responseLines = lines.filter(line => {
          try {
            const parsed = JSON.parse(line);
            return parsed.id === 1;
          } catch {
            return false;
          }
        });
        
        if (responseLines.length > 0) {
          try {
            const response = JSON.parse(responseLines[0]);
            if (response.result?.content?.[0]?.text) {
              console.log('✅ Success! QR Code generated:');
              const text = response.result.content[0].text;
              
              // Extract just the QR code part for display
              const lines = text.split('\n');
              const qrStartIndex = lines.findIndex(line => line.includes('██') || line.includes('  '));
              if (qrStartIndex !== -1) {
                const qrEndIndex = lines.findIndex((line, index) => 
                  index > qrStartIndex && !line.includes('██') && !line.includes('  ') && line.trim() !== ''
                );
                const qrLines = lines.slice(qrStartIndex, qrEndIndex !== -1 ? qrEndIndex : qrStartIndex + 20);
                console.log(qrLines.join('\n'));
                console.log(`\n📏 Size: Detected ${qrLines.length} rows\n`);
              } else {
                console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
              }
            } else if (response.error) {
              console.log('❌ Error:', response.error.message);
            }
          } catch (parseError) {
            console.log('❌ Failed to parse response');
            console.log('Raw output:', output.substring(0, 300));
          }
        } else {
          console.log('❌ No valid response received');
          if (errorOutput) {
            console.log('Errors:', errorOutput.substring(0, 300));
          }
        }
        
        console.log('─'.repeat(60) + '\n');
        resolve();
      });
    });
  }
  
  console.log('🏁 QR code testing completed!');
}

testQRGenerator().catch(console.error);
