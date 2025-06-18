#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing QR Code Generator...\n');

// Test QR code generation
async function testQRGenerator(text) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      resolve({ output, errorOutput, code });
    });

    // Send the test requests
    const requests = [
      { 
        jsonrpc: '2.0', 
        id: 1, 
        method: 'initialize', 
        params: { 
          protocolVersion: '2024-11-05', 
          capabilities: { tools: {} }, 
          clientInfo: { name: 'test-client', version: '1.0.0' } 
        } 
      },
      { 
        jsonrpc: '2.0', 
        id: 2, 
        method: 'tools/call', 
        params: { 
          name: 'qr-generate', 
          arguments: { text, size: 1 }
        } 
      }
    ];

    requests.forEach(req => {
      server.stdin.write(JSON.stringify(req) + '\n');
    });

    server.stdin.end();

    // Set timeout
    setTimeout(() => {
      server.kill();
      resolve({ output, errorOutput, code: 'timeout' });
    }, 5000);
  });
}

try {
  console.log('Generating QR code for: https://google.com');
  const result = await testQRGenerator('https://google.com');
  
  if (result.code === 'timeout') {
    console.log('❌ Test timed out');
    process.exit(1);
  }
  
  // Parse the output to find the tool result
  const lines = result.output.split('\n').filter(line => line.trim());
  let toolResult = null;
  
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.id === 2 && parsed.result) {
        toolResult = parsed.result;
        break;
      }
    } catch (e) {
      // Skip non-JSON lines
    }
  }
  
  if (toolResult && toolResult.content && toolResult.content[0] && toolResult.content[0].text) {
    const responseText = toolResult.content[0].text;
    console.log('✅ QR Code Generated!');
    console.log('\n' + responseText);
  } else {
    console.log('❌ No valid result found');
    if (result.errorOutput) {
      console.log('Error:', result.errorOutput);
    }
  }
  
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\nQR code generation complete!');
