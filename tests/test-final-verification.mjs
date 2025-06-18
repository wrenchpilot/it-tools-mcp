#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🧪 Testing Final Verification of all upgraded tools...\n');

const serverProcess = spawn('node', ['build/index.js'], {
  cwd: '/Volumes/Source/it-tools-mcp',
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  if (data.toString().includes('MCP Server running')) {
    serverReady = true;
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

// Wait for server to be ready
await new Promise((resolve) => {
  const checkReady = () => {
    if (serverReady) {
      resolve();
    } else {
      setTimeout(checkReady, 100);
    }
  };
  checkReady();
});

console.log('✅ Server is ready, running tests...\n');

async function testTool(toolName, args) {
  console.log(`Testing ${toolName}...`);
  
  return new Promise((resolve) => {
    const testProcess = spawn('node', ['-e', `
      const { spawn } = require('child_process');
      const client = spawn('node', ['build/index.js'], { 
        cwd: '/Volumes/Source/it-tools-mcp',
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "${toolName}",
          arguments: ${JSON.stringify(args)}
        }
      };
      
      client.stdin.write(JSON.stringify(request) + '\\n');
      client.stdin.end();
      
      let output = '';
      client.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      client.on('close', () => {
        console.log(output);
      });
    `], { stdio: 'inherit' });
    
    testProcess.on('close', () => {
      resolve();
    });
  });
}

// Test the upgraded tools
console.log('🔍 Testing IBAN validator with upgraded library...');
await testTool('iban-validate', { iban: "DE89 3704 0044 0532 0130 00" });

console.log('\n🎨 Testing Markdown to HTML converter...');
await testTool('markdown-to-html', { 
  markdown: "# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n```javascript\nconsole.log('Hello');\n```" 
});

console.log('\n📝 Testing HTML to Markdown converter...');
await testTool('html-to-markdown', { 
  html: "<h1>Hello World</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item 1</li><li>Item 2</li></ul><pre><code>console.log('Hello');</code></pre>" 
});

console.log('\n🌈 Testing color conversion (HEX to RGB)...');
await testTool('color-hex-to-rgb', { hex: "#FF5733" });

console.log('\n🔢 Testing math evaluation...');
await testTool('math-eval', { expression: "2 * pi * 5^2" });

console.log('\n📊 Testing JSON to CSV conversion...');
await testTool('json-to-csv', { 
  json: JSON.stringify([
    { name: "John", age: 30, city: "New York" },
    { name: "Jane", age: 25, city: "Los Angeles" }
  ])
});

console.log('\n📦 Testing TOML to JSON conversion...');
await testTool('toml-to-json', { 
  toml: `title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00`
});

console.log('\n📱 Testing phone number formatting...');
await testTool('phone-format', { 
  phoneNumber: "+1-555-123-4567",
  countryCode: "US"
});

console.log('\n📄 Testing YAML formatting...');
await testTool('yaml-format', { 
  yaml: `name: John Doe
age: 30
hobbies:
- reading
- swimming
- coding`
});

console.log('\n📋 Testing QR code generation...');
await testTool('qr-generate', { 
  text: "Hello, World!",
  size: 1
});

console.log('\n🎯 Testing regex tester...');
await testTool('regex-tester', { 
  pattern: "\\b\\w+@\\w+\\.\\w+\\b",
  text: "Contact us at support@example.com or sales@test.org",
  flags: "g"
});

console.log('\n✅ All tests completed!');

// Cleanup
serverProcess.kill();
process.exit(0);
