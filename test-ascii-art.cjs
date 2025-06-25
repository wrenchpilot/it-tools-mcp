#!/usr/bin/env node

const { spawn } = require('child_process');

async function testAsciiArt() {
  console.log('Testing ASCII art via MCP API...');
  
  // Start the local MCP server
  const server = spawn('docker', ['run', '-i', '--rm', 'it-tools-mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseData = '';
  
  server.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log('Server response:', data.toString());
  });

  server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });

  // Send MCP request for ASCII art
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "ascii-art-text",
      arguments: {
        text: "HELLO",
        font: "standard"
      }
    }
  };

  console.log('Sending request:', JSON.stringify(request, null, 2));
  
  // Send the request
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response
  setTimeout(() => {
    server.kill();
    console.log('Test completed');
  }, 5000);
}

testAsciiArt().catch(console.error);
