#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the refactored MCP server
const serverProcess = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test math evaluation
const testRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "math-evaluate",
    arguments: {
      expression: "2 + 3 * 4"
    }
  }
};

serverProcess.stdin.write(JSON.stringify(testRequest) + '\n');

serverProcess.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  serverProcess.kill();
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
  serverProcess.kill();
});

setTimeout(() => {
  console.log('Test timed out');
  serverProcess.kill();
}, 5000);
