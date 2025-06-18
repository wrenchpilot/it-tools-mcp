#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the math evaluator with various expressions
const testExpressions = [
  '2*sqrt(6)',
  'sin(pi/2)',
  'cos(0)',
  'sqrt(16)',
  '2**3',
  'log(e)',
  'abs(-5)',
  'min(10, 5, 8)',
  'max(10, 5, 8)',
  'ceil(4.3)',
  'floor(4.7)',
  'round(4.6)',
  'tan(pi/4)',
  '3 + 4 * 2',
  'sqrt(25) + sin(pi/6)',
  'pow(2, 3)',
  'exp(1)'
];

console.log('Testing IT Tools MCP Server Math Evaluator...\n');

// Create a function to test individual expressions
async function testMathExpression(expression) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
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
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}: ${errorOutput}`));
      } else {
        resolve(output);
      }
    });

    // Send the test requests
    const requests = [
      { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, clientInfo: { name: 'test-client', version: '1.0.0' } } },
      { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'math-evaluate', arguments: { expression } } }
    ];

    requests.forEach(req => {
      server.stdin.write(JSON.stringify(req) + '\n');
    });

    server.stdin.end();
  });
}

// Test all expressions
for (const expression of testExpressions) {
  try {
    console.log(`Testing: ${expression}`);
    const result = await testMathExpression(expression);
    
    // Parse the output to find the math-eval result
    const lines = result.split('\n').filter(line => line.trim());
    let mathResult = null;
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id === 2 && parsed.result) {
          mathResult = parsed.result;
          break;
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }
    
    if (mathResult && mathResult.content && mathResult.content[0] && mathResult.content[0].text) {
      console.log(`✅ Result: ${mathResult.content[0].text.split('\n')[1]}`);
    } else {
      console.log(`❌ No valid result found`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('---');
}

console.log('\nMath evaluator testing complete!');
