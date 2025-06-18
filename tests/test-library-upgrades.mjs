#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testLibraryUpgrades() {
  console.log('🧪 Testing upgraded tools with trusted libraries...\n');
  
  const serverPath = join(__dirname, 'build', 'index.js');
  
  const tests = [
    {
      name: 'Color HEX to RGB',
      tool: 'color-hex-to-rgb',
      args: { hex: '#FF5733' },
    },
    {
      name: 'Color RGB to HEX',
      tool: 'color-rgb-to-hex',
      args: { r: 255, g: 87, b: 51 },
    },
    {
      name: 'Math Evaluation',
      tool: 'math-evaluate',
      args: { expression: '2 + 3 * sqrt(16)' },
    },
    {
      name: 'JSON to CSV',
      tool: 'json-to-csv',
      args: { 
        json: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
        delimiter: ','
      },
    },
    {
      name: 'JSON to TOML',
      tool: 'json-to-toml',
      args: { 
        json: '{"database":{"host":"localhost","port":5432},"app":{"name":"myapp"}}'
      },
    },
    {
      name: 'TOML to JSON',
      tool: 'toml-to-json',
      args: { 
        toml: '[database]\nhost = "localhost"\nport = 5432\n\n[app]\nname = "myapp"'
      },
    },
  ];
  
  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: test.tool,
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
              console.log('✅ Success:');
              console.log(response.result.content[0].text);
            } else if (response.error) {
              console.log('❌ Error:', response.error.message);
            }
          } catch (parseError) {
            console.log('❌ Failed to parse response');
          }
        } else {
          console.log('❌ No valid response received');
          if (errorOutput) {
            console.log('Errors:', errorOutput.substring(0, 200));
          }
        }
        
        console.log('─'.repeat(60) + '\n');
        resolve();
      });
    });
  }
  
  console.log('🏁 Library upgrade testing completed!');
}

testLibraryUpgrades().catch(console.error);
