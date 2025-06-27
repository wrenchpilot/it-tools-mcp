#!/usr/bin/env node

/**
 * Test for the math-evaluate tool in the MCP server using JSON-RPC over stdio
 */
import { spawn } from 'child_process';

console.log('🧮 Testing IT Tools MCP Math Tools\n');

const testMessages = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "math-test", version: "1.0.0" }
    }
  },
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "math-evaluate",
      arguments: { expression: "2 + 3 * 4" }
    }
  },
  {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "math-evaluate",
      arguments: { expression: "sqrt(16)" }
    }
  },
  {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "math-evaluate",
      arguments: { expression: "sin(0.5)" }
    }
  },
  {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "math-evaluate",
      arguments: { expression: "det([[1,2],[3,4]])" }
    }
  },
  {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "math-evaluate",
      arguments: { expression: "thisisnotvalid" }
    }
  }
];

const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});
let output = '';
let responses = [];
const expectedIds = [2, 3, 4, 5, 6];
const receivedIds = new Set();
let done = false;

server.stdout.on('data', (data) => {
  output += data.toString();
  const lines = data.toString().split('\n').filter(line => line.trim());
  for (const line of lines) {
    try {
      const resp = JSON.parse(line);
      if (resp && resp.id && expectedIds.includes(resp.id)) {
        receivedIds.add(resp.id);
      }
    } catch {}
  }
  if (!done && expectedIds.every(id => receivedIds.has(id))) {
    done = true;
    finish();
  }
});
server.stderr.on('data', (data) => {
  // Optionally log server errors
});
for (const message of testMessages) {
  server.stdin.write(JSON.stringify(message) + '\n');
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100); // 100ms pause
}

// Max timeout (30s)
setTimeout(() => {
  if (!done) {
    done = true;
    finish();
  }
}, 30000);

function finish() {
  server.stdin.end();
  responses = output.split('\n').filter(line => line.trim()).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  function getText(id) {
    const resp = responses.find(r => r.id === id);
    return resp && resp.result && resp.result.content && resp.result.content[0] && resp.result.content[0].text;
  }

  console.log('2 + 3 * 4:');
  const r2 = getText(2);
  if (r2 && r2.includes('Result: 14')) {
    console.log('✅', r2);
  } else if (r2) {
    console.log('❌ Unexpected result:', r2);
  } else {
    console.log('❌ No response');
  }

  console.log('\nsqrt(16):');
  const r3 = getText(3);
  if (r3 && r3.includes('Result: 4')) {
    console.log('✅', r3);
  } else if (r3) {
    console.log('❌ Unexpected result:', r3);
  } else {
    console.log('❌ No response');
  }

  console.log('\nsin(0.5):');
  const r4 = getText(4);
  if (r4 && r4.includes('Result: 0.479425')) {
    console.log('✅', r4);
  } else if (r4) {
    console.log('❌ Unexpected result:', r4);
  } else {
    console.log('❌ No response');
  }

  console.log('\ndet([[1,2],[3,4]]):');
  const r5 = getText(5);
  if (r5 && r5.includes('Result: -2')) {
    console.log('✅', r5);
  } else if (r5) {
    console.log('❌ Unexpected result:', r5);
  } else {
    console.log('❌ No response');
  }

  console.log('\ninvalid expression:');
  const r6 = getText(6);
  if (r6 && r6.toLowerCase().includes('error')) {
    console.log('✅ Error correctly returned:', r6);
  } else if (r6) {
    console.log('❌ Expected error, got:', r6);
  } else {
    console.log('❌ No response');
  }

  console.log('\n🎉 Math tool tests completed!');
  server.kill('SIGTERM');
}
