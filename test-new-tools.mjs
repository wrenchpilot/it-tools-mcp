#!/usr/bin/env node

import { spawn } from 'child_process';

const testCases = [
  // Test NATO alphabet tool
  {
    method: 'tools/call',
    params: {
      name: 'text-to-nato-alphabet',
      arguments: { text: 'Hello' }
    }
  },
  // Test string obfuscator
  {
    method: 'tools/call',
    params: {
      name: 'string-obfuscator',
      arguments: { text: 'Test', method: 'html-entities' }
    }
  },
  // Test token generator
  {
    method: 'tools/call',
    params: {
      name: 'token-generator',
      arguments: { length: 16, charset: 'hex' }
    }
  },
  // Test HMAC generator
  {
    method: 'tools/call',
    params: {
      name: 'hmac-generator',
      arguments: { message: 'Hello World', key: 'secret', algorithm: 'sha256' }
    }
  },
  // Test JSON diff
  {
    method: 'tools/call',
    params: {
      name: 'json-diff',
      arguments: { 
        json1: '{"name": "John", "age": 30}', 
        json2: '{"name": "John", "age": 31}' 
      }
    }
  }
];

async function runTest(testCase, index) {
  return new Promise((resolve) => {
    const child = spawn('node', ['build/index.js'], {
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

    child.on('close', () => {
      resolve({ output, errorOutput, testCase, index });
    });

    // Send initialization message
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    // Send test message
    const testMessage = {
      jsonrpc: '2.0',
      id: index + 2,
      ...testCase
    };

    child.stdin.write(JSON.stringify(initMessage) + '\n');
    child.stdin.write(JSON.stringify(testMessage) + '\n');
    child.stdin.end();
  });
}

console.log('Testing new IT Tools MCP Server features...\n');

// Run tests sequentially
for (let i = 0; i < testCases.length; i++) {
  const result = await runTest(testCases[i], i);
  
  console.log(`Test ${i + 1}: ${result.testCase.params.name}`);
  
  // Try to parse the last JSON response from output
  const lines = result.output.trim().split('\n');
  let lastResponse = null;
  
  for (const line of lines.reverse()) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.result && parsed.result.content) {
        lastResponse = parsed;
        break;
      }
    } catch (e) {
      // Continue looking
    }
  }
  
  if (lastResponse && lastResponse.result.content[0]) {
    const content = lastResponse.result.content[0].text;
    console.log(`✅ Result: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  } else {
    console.log(`❌ Failed to get response`);
    if (result.errorOutput) {
      console.log(`Error: ${result.errorOutput.substring(0, 200)}`);
    }
  }
  console.log('---');
}

console.log('\nAll tests completed!');
