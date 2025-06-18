#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing IT Tools MCP Server - Comprehensive Test...\n');

// Test cases covering different tool categories
const testCases = [
  {
    name: 'Math Evaluation',
    toolName: 'math-evaluate',
    args: { expression: '2 + 3 * 4' },
    expected: '14'
  },
  {
    name: 'Base64 Encoding',
    toolName: 'base64-encode',
    args: { text: 'Hello World' },
    expected: 'SGVsbG8gV29ybGQ='
  },
  {
    name: 'UUID Generation',
    toolName: 'uuid-generate',
    args: {},
    expected: 'uuid'
  },
  {
    name: 'Text Uppercase',
    toolName: 'text-uppercase',
    args: { text: 'hello world' },
    expected: 'HELLO WORLD'
  },
  {
    name: 'Roman Numeral Conversion',
    toolName: 'roman-numeral-converter',
    args: { input: '42' },
    expected: 'XLII'
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
      console.log(`✅ Response: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
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

console.log('\nComprehensive testing complete!');
