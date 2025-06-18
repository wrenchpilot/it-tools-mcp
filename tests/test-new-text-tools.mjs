#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing New Text Tools...\n');

// Test new text tools
const testCases = [
  {
    name: 'ASCII Art Generator',
    toolName: 'ascii-art-text',
    args: { text: 'HELLO', font: 'standard' },
    expected: 'ASCII art'
  },
  {
    name: 'Lorem Ipsum Generator',
    toolName: 'lorem-ipsum-generator',
    args: { count: 3, type: 'sentences' },
    expected: 'lorem ipsum'
  },
  {
    name: 'Numeronym Generator',
    toolName: 'numeronym-generator',
    args: { text: 'internationalization' },
    expected: 'i18n'
  },
  {
    name: 'Text to Binary',
    toolName: 'text-to-binary',
    args: { input: 'Hi', operation: 'encode' },
    expected: 'binary'
  },
  {
    name: 'Regex Tester',
    toolName: 'regex-tester',
    args: { pattern: '\\d+', text: 'abc123def', flags: 'g' },
    expected: 'match'
  }
];

// Function to test a single tool
async function testTool(testCase) {
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
          name: testCase.toolName, 
          arguments: testCase.args 
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

// Run all tests
for (const testCase of testCases) {
  try {
    console.log(`Testing: ${testCase.name}`);
    const result = await testTool(testCase);
    
    if (result.code === 'timeout') {
      console.log(`❌ Test timed out`);
      continue;
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
      console.log(`✅ Success!`);
      console.log(`Response preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    } else {
      console.log(`❌ No valid result found`);
      if (result.errorOutput) {
        console.log(`Error: ${result.errorOutput.substring(0, 200)}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('---');
}

console.log('\nNew text tools testing complete!');
