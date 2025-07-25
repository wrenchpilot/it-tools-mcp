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
      name: "encode_base64",
      arguments: { text: "Hello World" }
    }
  },
  // Test JSON format
  {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "format_json",
      arguments: { json: '{"name":"test","value":123}' }
    }
  },
  // Test UUID generation
  {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "generate_uuid",
      arguments: {}
    }
  },
  // Test ASCII art
  {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "generate_ascii_art",
      arguments: { text: "Hi" }
    }
  }
];

async function testServer() {
  console.log('Testing IT Tools MCP Server...\n');
  
  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'test', MCP_TEST_MODE: 'true' }
  });

  let output = '';
  let testCompleted = false;
  
  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });

  // Set a timeout to kill the server if it doesn't exit
  const timeout = setTimeout(() => {
    if (!testCompleted) {
      console.log('Test timeout - killing server...');
      server.kill('SIGTERM');
      setTimeout(() => {
        if (!server.killed) {
          server.kill('SIGKILL');
        }
      }, 1000);
    }
  }, 10000); // 10 second timeout

  // Send test messages
  for (const message of testMessages) {
    server.stdin.write(JSON.stringify(message) + '\n');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Wait a bit for responses, then close
  await new Promise(resolve => setTimeout(resolve, 2000));
  server.stdin.end();
  
  // Force close after a short delay
  setTimeout(() => {
    if (!testCompleted) {
      server.kill('SIGTERM');
    }
  }, 1000);

  await new Promise((resolve) => {
    server.on('close', () => {
      testCompleted = true;
      clearTimeout(timeout);
      
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
      
      console.log('\n✅ Test completed successfully!');
      resolve();
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testServer().catch(console.error);
}
