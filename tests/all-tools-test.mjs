#!/usr/bin/env node

/**
 * Integration test for all MCP tools via stdio (JSON-RPC)
 * This test file is auto-generated to cover every tool in the server.
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import os from 'os';
import fs from 'fs';

const tempFile = 'testfile.txt';
const sshPrivateKey = fs.existsSync(os.homedir() + '/.ssh/id_rsa') ? fs.readFileSync(os.homedir() + '/.ssh/id_rsa', 'utf8') : undefined;
const sshUser = process.env.USER || process.env.LOGNAME || os.userInfo().username;

// Minimal test messages for every tool (one per tool, grouped by category)
const testMessages = [
  // Initialize
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "all-tools-test", version: "1.0.0" }
    }
  },
  // Encoding & Decoding
  { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "base64-encode", arguments: { text: "hello" } } },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "base64-decode", arguments: { text: "aGVsbG8=" } } },
  { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "url-encode", arguments: { text: "hello world" } } },
  { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "url-decode", arguments: { text: "hello%20world" } } },
  { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "html-encode", arguments: { text: "<b>hi</b>" } } },
  { jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "html-decode", arguments: { text: "&lt;b&gt;hi&lt;/b&gt;" } } },
  { jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "html-entities-extended", arguments: { text: "©", operation: "encode" } } },
  { jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "text-to-binary", arguments: { input: "hi", operation: "encode" } } },
  { jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "text-to-unicode", arguments: { input: "hi", operation: "encode" } } },
  // Data Format
  { jsonrpc: "2.0", id: 11, method: "tools/call", params: { name: "json-format", arguments: { json: '{"a":1}' } } },
  { jsonrpc: "2.0", id: 12, method: "tools/call", params: { name: "json-minify", arguments: { json: '{ "a" : 1 }' } } },
  { jsonrpc: "2.0", id: 13, method: "tools/call", params: { name: "json-to-csv", arguments: { json: '[{"a":1}]' } } },
  { jsonrpc: "2.0", id: 14, method: "tools/call", params: { name: "json-to-toml", arguments: { json: '{"a":1}' } } },
  { jsonrpc: "2.0", id: 15, method: "tools/call", params: { name: "json-diff", arguments: { json1: '{"a":1}', json2: '{"a":2}' } } },
  { jsonrpc: "2.0", id: 16, method: "tools/call", params: { name: "xml-format", arguments: { xml: '<a>1</a>' } } },
  { jsonrpc: "2.0", id: 17, method: "tools/call", params: { name: "yaml-format", arguments: { yaml: 'a: 1' } } },
  { jsonrpc: "2.0", id: 18, method: "tools/call", params: { name: "sql-format", arguments: { sql: 'SELECT 1' } } },
  { jsonrpc: "2.0", id: 19, method: "tools/call", params: { name: "toml-to-json", arguments: { toml: 'a = 1' } } },
  { jsonrpc: "2.0", id: 20, method: "tools/call", params: { name: "markdown-to-html", arguments: { markdown: '# hi' } } },
  { jsonrpc: "2.0", id: 21, method: "tools/call", params: { name: "html-to-markdown", arguments: { html: '<h1>hi</h1>' } } },
  { jsonrpc: "2.0", id: 22, method: "tools/call", params: { name: "phone-format", arguments: { phoneNumber: '+15551234567' } } },
  // Security & Crypto
  { jsonrpc: "2.0", id: 23, method: "tools/call", params: { name: "hash-md5", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 24, method: "tools/call", params: { name: "hash-sha1", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 25, method: "tools/call", params: { name: "hash-sha256", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 26, method: "tools/call", params: { name: "hash-sha512", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 27, method: "tools/call", params: { name: "hmac-generator", arguments: { message: 'hi', key: 'secret' } } },
  { jsonrpc: "2.0", id: 28, method: "tools/call", params: { name: "jwt-decode", arguments: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' } } },
  { jsonrpc: "2.0", id: 29, method: "tools/call", params: { name: "basic-auth-generator", arguments: { username: 'user', password: 'pass' } } },
  { jsonrpc: "2.0", id: 30, method: "tools/call", params: { name: "bcrypt-hash", arguments: { password: 'hi' } } },
  { jsonrpc: "2.0", id: 31, method: "tools/call", params: { name: "bip39-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 32, method: "tools/call", params: { name: "password-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 33, method: "tools/call", params: { name: "token-generator", arguments: {} } },
  { jsonrpc: "2.0", id: 34, method: "tools/call", params: { name: "otp-code-generator", arguments: { secret: 'JBSWY3DPEHPK3PXP' } } },
  // Text Processing
  { jsonrpc: "2.0", id: 35, method: "tools/call", params: { name: "text-uppercase", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 36, method: "tools/call", params: { name: "text-lowercase", arguments: { text: 'HI' } } },
  { jsonrpc: "2.0", id: 37, method: "tools/call", params: { name: "text-capitalize", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 38, method: "tools/call", params: { name: "text-camelcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 39, method: "tools/call", params: { name: "text-pascalcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 40, method: "tools/call", params: { name: "text-kebabcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 41, method: "tools/call", params: { name: "text-snakecase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 42, method: "tools/call", params: { name: "text-stats", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 43, method: "tools/call", params: { name: "text-diff", arguments: { text1: 'a', text2: 'b' } } },
  { jsonrpc: "2.0", id: 44, method: "tools/call", params: { name: "ascii-art-text", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 45, method: "tools/call", params: { name: "text-to-nato-alphabet", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 46, method: "tools/call", params: { name: "string-obfuscator", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 47, method: "tools/call", params: { name: "slugify-string", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 48, method: "tools/call", params: { name: "lorem-ipsum-generator", arguments: {} } },
  { jsonrpc: "2.0", id: 49, method: "tools/call", params: { name: "numeronym-generator", arguments: { text: 'internationalization' } } },
  { jsonrpc: "2.0", id: 50, method: "tools/call", params: { name: "emoji-search", arguments: { query: 'smile' } } },
  // Network & System (file-based tools use tempFile)
  { jsonrpc: "2.0", id: 51, method: "tools/call", params: { name: "ps", arguments: {} } },
  { jsonrpc: "2.0", id: 52, method: "tools/call", params: { name: "top", arguments: {} } },
  { jsonrpc: "2.0", id: 53, method: "tools/call", params: { name: "cat", arguments: { file: tempFile } } },
  { jsonrpc: "2.0", id: 54, method: "tools/call", params: { name: "head", arguments: { file: tempFile, lines: 2 } } },
  { jsonrpc: "2.0", id: 55, method: "tools/call", params: { name: "tail", arguments: { file: tempFile, lines: 2 } } },
  { jsonrpc: "2.0", id: 56, method: "tools/call", params: { name: "grep", arguments: { file: tempFile, pattern: 'line2' } } },
  { jsonrpc: "2.0", id: 57, method: "tools/call", params: { name: "ping", arguments: { target: "127.0.0.1", count: 1 } } },
  { jsonrpc: "2.0", id: 58, method: "tools/call", params: { name: "nslookup", arguments: { target: "localhost" } } },
  { jsonrpc: "2.0", id: 59, method: "tools/call", params: { name: "telnet", arguments: { target: "localhost", port: 22 } } },
  { jsonrpc: "2.0", id: 60, method: "tools/call", params: { name: "dig", arguments: { target: "localhost", type: "A" } } },
  { jsonrpc: "2.0", id: 61, method: "tools/call", params: { name: "ssh", arguments: sshPrivateKey ? { target: "localhost", user: sshUser, command: "echo hi", privateKey: sshPrivateKey } : { target: "localhost", user: sshUser, command: "echo hi" } } },
  { jsonrpc: "2.0", id: 62, method: "tools/call", params: { name: "ip-subnet-calculator", arguments: { ip: "192.168.1.1", cidr: 24 } } },
  { jsonrpc: "2.0", id: 63, method: "tools/call", params: { name: "ipv4-subnet-calc", arguments: { cidr: "192.168.1.0/24" } } },
  { jsonrpc: "2.0", id: 64, method: "tools/call", params: { name: "ipv6-ula-generator", arguments: {} } },
  { jsonrpc: "2.0", id: 65, method: "tools/call", params: { name: "url-parse", arguments: { url: "https://example.com" } } },
  { jsonrpc: "2.0", id: 66, method: "tools/call", params: { name: "random-port", arguments: {} } },
  { jsonrpc: "2.0", id: 67, method: "tools/call", params: { name: "mac-address-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 68, method: "tools/call", params: { name: "iban-validate", arguments: { iban: 'GB82WEST12345698765432' } } },
  // Math & Calculations
  { jsonrpc: "2.0", id: 69, method: "tools/call", params: { name: "math-evaluate", arguments: { expression: '2+2' } } },
  { jsonrpc: "2.0", id: 70, method: "tools/call", params: { name: "number-base-converter", arguments: { number: '10', fromBase: 10, toBase: 2 } } },
  { jsonrpc: "2.0", id: 71, method: "tools/call", params: { name: "roman-numeral-converter", arguments: { input: '10' } } },
  { jsonrpc: "2.0", id: 72, method: "tools/call", params: { name: "temperature-converter", arguments: { temperature: 0, from: 'celsius', to: 'fahrenheit' } } },
  { jsonrpc: "2.0", id: 73, method: "tools/call", params: { name: "percentage-calculator", arguments: { operation: 'percentage-of', value1: 50, value2: 200 } } },
  { jsonrpc: "2.0", id: 74, method: "tools/call", params: { name: "unix-timestamp-converter", arguments: { input: '1650000000' } } },
  // ID & Code Generators
  { jsonrpc: "2.0", id: 75, method: "tools/call", params: { name: "uuid-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 76, method: "tools/call", params: { name: "ulid-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 77, method: "tools/call", params: { name: "qr-generate", arguments: { text: 'hello' } } },
  { jsonrpc: "2.0", id: 78, method: "tools/call", params: { name: "svg-placeholder-generator", arguments: { width: 100, height: 50 } } },
  // Development Tools
  { jsonrpc: "2.0", id: 79, method: "tools/call", params: { name: "regex-tester", arguments: { pattern: 'a', text: 'abc' } } },
  { jsonrpc: "2.0", id: 80, method: "tools/call", params: { name: "crontab-generate", arguments: {} } },
  { jsonrpc: "2.0", id: 81, method: "tools/call", params: { name: "list-converter", arguments: { list: 'a,b', inputFormat: 'comma', outputFormat: 'json' } } },
  // Utility Tools
  { jsonrpc: "2.0", id: 82, method: "tools/call", params: { name: "color-hex-to-rgb", arguments: { hex: '#ff0000' } } },
  { jsonrpc: "2.0", id: 83, method: "tools/call", params: { name: "color-rgb-to-hex", arguments: { r: 255, g: 0, b: 0 } } },
  { jsonrpc: "2.0", id: 84, method: "tools/call", params: { name: "curl", arguments: { url: "https://httpbin.org/status/200", method: "GET" } } },
  { jsonrpc: "2.0", id: 85, method: "tools/call", params: { name: "email-normalizer", arguments: { email: 'foo.bar+test@gmail.com' } } },
  { jsonrpc: "2.0", id: 86, method: "tools/call", params: { name: "mime-types", arguments: { input: 'txt' } } },
  { jsonrpc: "2.0", id: 87, method: "tools/call", params: { name: "device-info", arguments: {} } },
  { jsonrpc: "2.0", id: 88, method: "tools/call", params: { name: "http-status-codes", arguments: { code: 200 } } },
  // SCP test: only run if sshPrivateKey is available and SSH server is accessible
  ...((sshPrivateKey && fs.existsSync('/usr/sbin/sshd')) ? [{
    jsonrpc: "2.0",
    id: 89,
    method: "tools/call",
    params: {
      name: "scp",
      arguments: {
        target: "localhost",
        user: sshUser,
        direction: "upload",
        localPath: tempFile, // tempFile is created before tests run
        remotePath: "/tmp/testfile_scp.txt",
        privateKey: sshPrivateKey
      }
    }
  }] : [])
];

function checkResult(result, toolName) {
  if (!result || !result.content || result.content.length === 0) return false;
  
  // For curl, check that we have status, headers, and body content
  if (toolName === 'curl') {
    const contentStr = result.content.map(x => (x.text || x).toLowerCase()).join(' ');
    if (contentStr.includes('status:') && (contentStr.includes('200') || contentStr.includes('ok'))) {
      return true;
    }
    if (contentStr.includes('curl failed') || contentStr.includes('timeout')) {
      return false;
    }
    return contentStr.length > 0; // At least some content
  }
  
  // For ssh, fail if any error is present in the content
  if (toolName === 'ssh') {
    const contentStr = result.content.join(' ').toLowerCase();
    if (contentStr.includes('error') || contentStr.includes('failed')) return false;
  }
  // For telnet, fail if result contains 'failed' or 'cannot connect'
  if (toolName === 'telnet') {
    const contentStr = result.content.map(x => (x.text || x).toLowerCase()).join(' ');
    if (contentStr.includes('failed') || contentStr.includes('cannot connect')) return false;
  }
  return true;
}

async function testAllTools() {
  console.log('🧪 Testing ALL IT Tools MCP tools (integration)\n');
  // Create temp file for file-based tools
  writeFileSync(tempFile, 'line1\nline2\nline3');

  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'test' }
  });

  let output = '';
  let testCompleted = false;
  const responses = [];

  server.stdout.on('data', (data) => {
    output += data.toString();
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(line);
          responses.push(parsed);
        } catch (e) {
        }
      } else {
      }
    }
  });

  server.stderr.on('data', (data) => {
  });

  // Timeout to kill server if it hangs
  const timeout = setTimeout(() => {
    if (!testCompleted) {
      console.log('Test timeout - killing server...');
      server.kill('SIGTERM');
      setTimeout(() => {
        if (!server.killed) server.kill('SIGKILL');
      }, 1000);
    }
  }, 60000); // Reduced from 120000 to 60000ms (1 minute)

  // Send test messages
  for (const message of testMessages) {
    server.stdin.write(JSON.stringify(message) + '\n');
    // Give more time for network-related tools (curl, ssh, etc.)
    const isNetworkTool = message.params?.name && ['curl', 'ssh', 'ping', 'nslookup', 'telnet', 'dig', 'scp'].includes(message.params.name);
    const delay = isNetworkTool ? 500 : 100; // 500ms for network tools, 100ms for others
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Wait for responses or until timeout
  let lastResponseCount = 0;
  let debugInterval = setInterval(() => {
  }, 2000);

  // Promise that resolves when all responses are received
  const allResponsesReceived = new Promise(resolve => {
    const checkAll = () => {
      if (responses.length >= testMessages.length - 1) { // skip init
        resolve();
      } else {
        setTimeout(checkAll, 100);
      }
    };
    checkAll();
  });

  // Wait for either all responses or timeout
  await Promise.race([
    allResponsesReceived,
    new Promise(resolve => setTimeout(resolve, 60000))
  ]);
  clearInterval(debugInterval);
  server.stdin.end();

  // Clean up temp file
  if (existsSync(tempFile)) unlinkSync(tempFile);

  // Analyze responses and print summary, then force exit
  let passed = 0, failed = 0;
  for (const msg of testMessages) {
    if (!msg.id || msg.id === 1) continue; // skip init
    // Match response by id using loose equality to handle string/number mismatch
    const resp = responses.find(r => r.id == msg.id);
    // Always print the tool's result content for debugging
    if (resp && resp.result && resp.result.content) {
      console.log(`[DEBUG] ${msg.params?.name || msg.method} result content:`, JSON.stringify(resp.result.content));
    } else if (resp && resp.result) {
      console.log(`[DEBUG] ${msg.params?.name || msg.method} result:`, JSON.stringify(resp.result));
    } else {
      console.log(`[DEBUG] ${msg.params?.name || msg.method} response:`, JSON.stringify(resp));
    }
    if (!resp) {
      console.log(`❌ Tool ${msg.params?.name || msg.method} (id ${msg.id}): No response`);
      failed++;
      continue;
    }
    if (checkResult(resp.result, msg.params?.name)) {
      console.log(`✅ Tool ${msg.params?.name || msg.method} (id ${msg.id}): PASS`);
      passed++;
    } else {
      // Print the actual result content for debugging
      console.log(`❌ Tool ${msg.params?.name || msg.method} (id ${msg.id}): FAIL`);
      if (resp.result && resp.result.content) {
        console.log(`    Result content:`, JSON.stringify(resp.result.content));
      } else {
        console.log(`    Result:`, JSON.stringify(resp.result));
      }
      failed++;
    }
  }
  console.log(`\nTest summary: ${passed} passed, ${failed} failed, ${testMessages.length - 1} total.`);
  testCompleted = true;
  clearTimeout(timeout);
  if (!server.killed) server.kill('SIGKILL');
  process.exit(failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testAllTools().catch(e => { console.error('Test runner error:', e); process.exit(1); });
}
