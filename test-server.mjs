#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const testMessages = [
  // Initialize
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: { roots: { listChanged: true }, sampling: {} },
      clientInfo: { name: "test-client", version: "1.0.0" }
    }
  },
  // List tools
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list"
  },
  // Test base64 encode
  {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "base64-encode",
      arguments: { text: "Hello World" }
    }
  },
  // Test JSON format
  {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "json-format",
      arguments: { json: '{"name":"test","value":123}', indent: 2 }
    }
  },
  // Test UUID generation
  {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "uuid-generate",
      arguments: {}
    }
  }
];

async function testServer() {
  console.log('Testing IT Tools MCP Server...\n');
  
  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  
  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });

  // Send test messages
  for (const message of testMessages) {
    server.stdin.write(JSON.stringify(message) + '\n');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  server.stdin.end();

  await new Promise((resolve) => {
    server.on('close', () => {
      console.log('Test Results:');
      console.log('=============');
      
      const responses = output.split('\n').filter(line => line.trim());
      responses.forEach((response, index) => {
        if (response.startsWith('{')) {
          try {
            const parsed = JSON.parse(response);
            console.log(`Response ${index + 1}:`, JSON.stringify(parsed, null, 2));
            console.log('---');
          } catch (e) {
            console.log(`Raw response ${index + 1}:`, response);
            console.log('---');
          }
        }
      });
      
      resolve();
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testServer().catch(console.error);
}
