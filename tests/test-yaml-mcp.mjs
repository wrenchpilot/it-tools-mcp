#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testYAMLFormatter() {
  console.log('🧪 Testing YAML formatter through MCP...\n');
  
  const serverPath = join(__dirname, 'build', 'index.js');
  
  const testYaml = `networks:
  mcp-network:
    driver: bridge

services:
  # MCP Server with IT Tools functionality
  it-tools-mcp:
    build: .
    container_name: it-tools-mcp-server
    environment:
      - NODE_ENV=production
    networks:
      - mcp-network
    restart: unless-stopped
    stdin_open: true
    tty: true
    volumes:
      - /tmp:/tmp`;

  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'yaml-format',
      arguments: { yaml: testYaml }
    }
  };
  
  const child = spawn('node', [serverPath], { 
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
  
  // Send request
  child.stdin.write(JSON.stringify(request) + '\n');
  child.stdin.end();
  
  await new Promise((resolve) => {
    child.on('close', (code) => {
      const lines = output.trim().split('\n');
      const responseLines = lines.filter(line => {
        try {
          const parsed = JSON.parse(line);
          return parsed.id === 1;
        } catch {
          return false;
        }
      });
      
      if (responseLines.length > 0) {
        try {
          const response = JSON.parse(responseLines[0]);
          if (response.result?.content?.[0]?.text) {
            console.log('✅ YAML Formatter Response:');
            console.log(response.result.content[0].text);
          } else if (response.error) {
            console.log('❌ Error:', response.error.message);
          }
        } catch (parseError) {
          console.log('❌ Failed to parse response');
          console.log('Raw output:', output.substring(0, 500));
        }
      } else {
        console.log('❌ No valid response received');
        if (errorOutput) {
          console.log('Errors:', errorOutput.substring(0, 300));
        }
      }
      
      resolve();
    });
  });
  
  console.log('🏁 YAML formatter testing completed!');
}

testYAMLFormatter().catch(console.error);
