#!/usr/bin/env node

/**
 * Test ASCII art functionality
 */

import { spawn } from 'child_process';

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
  // Test ASCII art
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "ascii-art-text",
      arguments: { text: "HELLO", font: "standard" }
    }
  }
];

async function testServer() {
  console.log('🚀 Starting IT Tools MCP Server test...');
  
  // Start the server
  const server = spawn('docker', ['run', '-i', '--rm', 'it-tools-mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let allOutput = '';
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    allOutput += output;
    console.log('📤 Server output:', output.trim());
  });

  server.stderr.on('data', (data) => {
    console.error('❌ Server error:', data.toString());
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send each test message
  for (const [index, message] of testMessages.entries()) {
    console.log(`\n📨 Sending message ${index + 1}:`, JSON.stringify(message, null, 2));
    server.stdin.write(JSON.stringify(message) + '\n');
    
    // Wait between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Wait for responses
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  server.kill();
  console.log('\n✅ Test completed');
  
  return allOutput;
}

testServer().catch(console.error);
