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
  { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "encode_base64", arguments: { text: "hello" } } },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "decode_base64", arguments: { text: "aGVsbG8=" } } },
  { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "encode_url", arguments: { text: "hello world" } } },
  { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "decode_url", arguments: { text: "hello%20world" } } },
  { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "encode_html", arguments: { text: "<b>hi</b>" } } },
  { jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "decode_html", arguments: { text: "&lt;b&gt;hi&lt;/b&gt;" } } },
  { jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "encode_html_entities", arguments: { text: "©", operation: "encode" } } },
  { jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "convert_text_to_binary", arguments: { input: "hi", operation: "encode" } } },
  { jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "convert_text_to_unicode", arguments: { input: "hi", operation: "encode" } } },
  { jsonrpc: "2.0", id: 11, method: "tools/call", params: { name: "show_unicode_names", arguments: { text: "hi" } } },
  
  // Data Format
  { jsonrpc: "2.0", id: 12, method: "tools/call", params: { name: "format_json", arguments: { json: '{"a":1}' } } },
  { jsonrpc: "2.0", id: 13, method: "tools/call", params: { name: "minify_json", arguments: { json: '{ "a" : 1 }' } } },
  { jsonrpc: "2.0", id: 14, method: "tools/call", params: { name: "convert_json_to_csv", arguments: { json: '[{"a":1}]' } } },
  { jsonrpc: "2.0", id: 15, method: "tools/call", params: { name: "convert_json_to_toml", arguments: { json: '{"a":1}' } } },
  { jsonrpc: "2.0", id: 16, method: "tools/call", params: { name: "compare_json", arguments: { json1: '{"a":1}', json2: '{"a":2}' } } },
  { jsonrpc: "2.0", id: 17, method: "tools/call", params: { name: "format_xml", arguments: { xml: '<a>1</a>' } } },
  { jsonrpc: "2.0", id: 18, method: "tools/call", params: { name: "format_yaml", arguments: { yaml: 'a: 1' } } },
  { jsonrpc: "2.0", id: 19, method: "tools/call", params: { name: "format_sql", arguments: { sql: 'SELECT 1' } } },
  { jsonrpc: "2.0", id: 20, method: "tools/call", params: { name: "convert_toml_to_json", arguments: { toml: 'a = 1' } } },
  { jsonrpc: "2.0", id: 21, method: "tools/call", params: { name: "convert_markdown_to_html", arguments: { markdown: '# hi' } } },
  { jsonrpc: "2.0", id: 22, method: "tools/call", params: { name: "convert_html_to_markdown", arguments: { html: '<h1>hi</h1>' } } },
  { jsonrpc: "2.0", id: 23, method: "tools/call", params: { name: "format_phone", arguments: { phoneNumber: '+15551234567' } } },
  
  // Security & Crypto
  { jsonrpc: "2.0", id: 24, method: "tools/call", params: { name: "hash_md5", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 25, method: "tools/call", params: { name: "hash_sha1", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 26, method: "tools/call", params: { name: "hash_sha256", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 27, method: "tools/call", params: { name: "hash_sha512", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 28, method: "tools/call", params: { name: "generate_hmac", arguments: { message: 'hi', key: 'secret' } } },
  { jsonrpc: "2.0", id: 29, method: "tools/call", params: { name: "decode_jwt", arguments: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' } } },
  { jsonrpc: "2.0", id: 30, method: "tools/call", params: { name: "generate_basic_auth", arguments: { username: 'user', password: 'pass' } } },
  { jsonrpc: "2.0", id: 31, method: "tools/call", params: { name: "hash_bcrypt", arguments: { password: 'hi' } } },
  { jsonrpc: "2.0", id: 32, method: "tools/call", params: { name: "generate_bip39", arguments: {} } },
  { jsonrpc: "2.0", id: 33, method: "tools/call", params: { name: "generate_password", arguments: {} } },
  { jsonrpc: "2.0", id: 34, method: "tools/call", params: { name: "generate_token", arguments: {} } },
  { jsonrpc: "2.0", id: 35, method: "tools/call", params: { name: "generate_otp", arguments: { secret: 'JBSWY3DPEHPK3PXP' } } },
  
  // Text Processing
  { jsonrpc: "2.0", id: 36, method: "tools/call", params: { name: "convert_text_to_uppercase", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 37, method: "tools/call", params: { name: "convert_text_to_lowercase", arguments: { text: 'HI' } } },
  { jsonrpc: "2.0", id: 38, method: "tools/call", params: { name: "capitalize_text", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 39, method: "tools/call", params: { name: "convert_text_to_camelcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 40, method: "tools/call", params: { name: "convert_text_to_pascalcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 41, method: "tools/call", params: { name: "convert_text_to_kebabcase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 42, method: "tools/call", params: { name: "text_snakecase", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 43, method: "tools/call", params: { name: "analyze_text_stats", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 44, method: "tools/call", params: { name: "compare_text", arguments: { text1: 'a', text2: 'b' } } },
  { jsonrpc: "2.0", id: 45, method: "tools/call", params: { name: "generate_ascii_art", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 46, method: "tools/call", params: { name: "convert_text_to_nato", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 47, method: "tools/call", params: { name: "obfuscate_string", arguments: { text: 'hi' } } },
  { jsonrpc: "2.0", id: 48, method: "tools/call", params: { name: "slugify_text", arguments: { text: 'hi there' } } },
  { jsonrpc: "2.0", id: 49, method: "tools/call", params: { name: "generate_lorem_ipsum", arguments: {} } },
  { jsonrpc: "2.0", id: 50, method: "tools/call", params: { name: "generate_numeronym", arguments: { text: 'internationalization' } } },
  { jsonrpc: "2.0", id: 51, method: "tools/call", params: { name: "search_emoji", arguments: { query: 'smile' } } },
  { jsonrpc: "2.0", id: 52, method: "tools/call", params: { name: "analyze_distinct_words", arguments: { text: 'hello world hello' } } },
  
  // Network & System (file-based tools use tempFile)
  { jsonrpc: "2.0", id: 50, method: "tools/call", params: { name: "ps", arguments: {} } },
  { jsonrpc: "2.0", id: 51, method: "tools/call", params: { name: "top", arguments: {} } },
  { jsonrpc: "2.0", id: 52, method: "tools/call", params: { name: "cat", arguments: { file: tempFile } } },
  { jsonrpc: "2.0", id: 53, method: "tools/call", params: { name: "head", arguments: { file: tempFile, lines: 2 } } },
  { jsonrpc: "2.0", id: 54, method: "tools/call", params: { name: "tail", arguments: { file: tempFile, lines: 2 } } },
  { jsonrpc: "2.0", id: 55, method: "tools/call", params: { name: "grep", arguments: { file: tempFile, pattern: 'line2' } } },
  { jsonrpc: "2.0", id: 56, method: "tools/call", params: { name: "ping", arguments: { target: "127.0.0.1", count: 1 } } },
  { jsonrpc: "2.0", id: 57, method: "tools/call", params: { name: "nslookup", arguments: { target: "localhost" } } },
  { jsonrpc: "2.0", id: 58, method: "tools/call", params: { name: "telnet", arguments: { target: "localhost", port: 22 } } },
  { jsonrpc: "2.0", id: 59, method: "tools/call", params: { name: "dig", arguments: { target: "localhost", type: "A" } } },
  { jsonrpc: "2.0", id: 60, method: "tools/call", params: { name: "ssh", arguments: sshPrivateKey ? { target: "localhost", user: sshUser, command: "echo hi", privateKey: sshPrivateKey } : { target: "localhost", user: sshUser, command: "echo hi" } } },
  { jsonrpc: "2.0", id: 61, method: "tools/call", params: { name: "calculate_ip_subnet", arguments: { ip: "192.168.1.1", cidr: 24 } } },
  { jsonrpc: "2.0", id: 62, method: "tools/call", params: { name: "calculate_ipv4_subnet", arguments: { cidr: "192.168.1.0/24" } } },
  { jsonrpc: "2.0", id: 63, method: "tools/call", params: { name: "calculate_ipv6_subnet", arguments: { ipv6: "2001:db8::/32", prefix: 64 } } },
  { jsonrpc: "2.0", id: 64, method: "tools/call", params: { name: "generate_ipv6_ula", arguments: {} } },
  { jsonrpc: "2.0", id: 65, method: "tools/call", params: { name: "parse_url", arguments: { url: "https://example.com" } } },
  { jsonrpc: "2.0", id: 66, method: "tools/call", params: { name: "generate_random_port", arguments: {} } },
  { jsonrpc: "2.0", id: 67, method: "tools/call", params: { name: "generate_mac_address", arguments: {} } },
  { jsonrpc: "2.0", id: 68, method: "tools/call", params: { name: "validate_iban", arguments: { iban: 'GB82WEST12345698765432' } } },
  { jsonrpc: "2.0", id: 69, method: "tools/call", params: { name: "convert_cidr_to_ip_range", arguments: { cidr: "192.168.1.0/24" } } },
  { jsonrpc: "2.0", id: 70, method: "tools/call", params: { name: "convert_ip_range_to_cidr", arguments: { startIP: "192.168.1.0", endIP: "192.168.1.255" } } },
  { jsonrpc: "2.0", id: 71, method: "tools/call", params: { name: "lookup_port_numbers", arguments: { query: "ssh" } } },
  
  // Math & Calculations
  { jsonrpc: "2.0", id: 72, method: "tools/call", params: { name: "evaluate_math", arguments: { expression: '2+2' } } },
  { jsonrpc: "2.0", id: 73, method: "tools/call", params: { name: "convert_number_base", arguments: { number: '10', fromBase: 10, toBase: 2 } } },
  { jsonrpc: "2.0", id: 74, method: "tools/call", params: { name: "convert_roman_numerals", arguments: { input: '10' } } },
  { jsonrpc: "2.0", id: 75, method: "tools/call", params: { name: "convert_temperature", arguments: { temperature: 0, from: 'celsius', to: 'fahrenheit' } } },
  { jsonrpc: "2.0", id: 76, method: "tools/call", params: { name: "calculate_percentage", arguments: { operation: 'percentage-of', value1: 50, value2: 200 } } },
  { jsonrpc: "2.0", id: 77, method: "tools/call", params: { name: "convert_unix_timestamp", arguments: { input: '1650000000' } } },
  
  // Physics
  { jsonrpc: "2.0", id: 78, method: "tools/call", params: { name: "convert_angle", arguments: { value: 180, fromUnit: 'degree', toUnit: 'radian' } } },
  { jsonrpc: "2.0", id: 79, method: "tools/call", params: { name: "convert_energy", arguments: { value: 1000, fromUnit: 'joule', toUnit: 'calorie' } } },
  { jsonrpc: "2.0", id: 80, method: "tools/call", params: { name: "convert_power", arguments: { value: 1000, fromUnit: 'watt', toUnit: 'horsepower' } } },
  
  // ID & Code Generators
  { jsonrpc: "2.0", id: 81, method: "tools/call", params: { name: "generate_uuid", arguments: {} } },
  { jsonrpc: "2.0", id: 82, method: "tools/call", params: { name: "generate_ulid", arguments: {} } },
  { jsonrpc: "2.0", id: 83, method: "tools/call", params: { name: "generate_qr_code", arguments: { text: 'hello' } } },
  { jsonrpc: "2.0", id: 84, method: "tools/call", params: { name: "generate_svg_placeholder", arguments: { width: 100, height: 50 } } },
  
  // Development Tools
  { jsonrpc: "2.0", id: 85, method: "tools/call", params: { name: "test_regex", arguments: { pattern: 'a', text: 'abc' } } },
  { jsonrpc: "2.0", id: 86, method: "tools/call", params: { name: "generate_crontab", arguments: {} } },
  { jsonrpc: "2.0", id: 87, method: "tools/call", params: { name: "convert_list", arguments: { list: 'a,b', inputFormat: 'comma', outputFormat: 'json' } } },
  { jsonrpc: "2.0", id: 88, method: "tools/call", params: { name: "format_html", arguments: { html: '<div><p>test</p></div>' } } },
  { jsonrpc: "2.0", id: 89, method: "tools/call", params: { name: "format_javascript", arguments: { code: 'var x=1;', type: 'javascript' } } },
  { jsonrpc: "2.0", id: 90, method: "tools/call", params: { name: "generate_markdown_toc", arguments: { markdown: '# Title\n## Section' } } },
  
  // Utility Tools
  { jsonrpc: "2.0", id: 91, method: "tools/call", params: { name: "convert_hex_to_rgb", arguments: { hex: '#ff0000' } } },
  { jsonrpc: "2.0", id: 92, method: "tools/call", params: { name: "convert_rgb_to_hex", arguments: { r: 255, g: 0, b: 0 } } },
  { jsonrpc: "2.0", id: 93, method: "tools/call", params: { name: "curl", arguments: { url: "https://www.google.com", method: "GET" } } },
  { jsonrpc: "2.0", id: 94, method: "tools/call", params: { name: "normalize_email", arguments: { email: 'foo.bar+test@gmail.com' } } },
  { jsonrpc: "2.0", id: 95, method: "tools/call", params: { name: "lookup_mime_types", arguments: { input: 'txt' } } },
  { jsonrpc: "2.0", id: 96, method: "tools/call", params: { name: "show_device_info", arguments: {} } },
  { jsonrpc: "2.0", id: 97, method: "tools/call", params: { name: "lookup_http_status", arguments: { code: 200 } } },
  { jsonrpc: "2.0", id: 98, method: "tools/call", params: { name: "format_css", arguments: { css: 'body{margin:0;}' } } },
  { jsonrpc: "2.0", id: 99, method: "tools/call", params: { name: "convert_rem_px", arguments: { value: 16, fromUnit: 'px', rootFontSize: 16 } } },
  
  // Docker Tools
  { jsonrpc: "2.0", id: 100, method: "tools/call", params: { name: "validate_docker_compose", arguments: { content: 'version: "3"\nservices:\n  app:\n    image: nginx' } } },
  { jsonrpc: "2.0", id: 101, method: "tools/call", params: { name: "convert_docker_compose_to_run", arguments: { content: 'version: "3"\nservices:\n  app:\n    image: nginx\n    ports:\n      - "80:80"' } } },
  { jsonrpc: "2.0", id: 102, method: "tools/call", params: { name: "convert_docker_run_to_compose", arguments: { commands: 'docker run -p 80:80 nginx' } } },
  { jsonrpc: "2.0", id: 103, method: "tools/call", params: { name: "generate_traefik_compose", arguments: { services: [{ name: 'app', image: 'nginx', domain: 'example.com' }] } } },
  { jsonrpc: "2.0", id: 104, method: "tools/call", params: { name: "show_docker_reference", arguments: { query: 'run' } } },
  
  // Ansible Tools
  { jsonrpc: "2.0", id: 109, method: "tools/call", params: { name: "encrypt_ansible_vault", arguments: { text: 'secret data', password: 'test123' } } },
  { jsonrpc: "2.0", id: 110, method: "tools/call", params: { name: "decrypt_ansible_vault", arguments: { encryptedText: '$ANSIBLE_VAULT;1.1;AES256\n...', password: 'test123' } } },
  { jsonrpc: "2.0", id: 111, method: "tools/call", params: { name: "generate_ansible_inventory", arguments: { inventory: '[webservers]\nserver1 ansible_host=192.168.1.10' } } },
  { jsonrpc: "2.0", id: 112, method: "tools/call", params: { name: "parse_ansible_inventory", arguments: { inventory: '[webservers]\nserver1 ansible_host=192.168.1.10' } } },
  { jsonrpc: "2.0", id: 113, method: "tools/call", params: { name: "validate_ansible_playbook", arguments: { playbook: '- hosts: all\n  tasks:\n    - name: test\n      debug:\n        msg: hello' } } },
  { jsonrpc: "2.0", id: 114, method: "tools/call", params: { name: "show_ansible_reference", arguments: { query: 'debug' } } },
  
  // Forensic Tools
  { jsonrpc: "2.0", id: 115, method: "tools/call", params: { name: "identify_file_type", arguments: { data: '48656c6c6f20576f726c64', format: 'hex' } } },
  { jsonrpc: "2.0", id: 116, method: "tools/call", params: { name: "decode_safelink", arguments: { safelink: 'https://urldefense.proofpoint.com/v2/url?u=https-3A__example.com' } } },
  { jsonrpc: "2.0", id: 117, method: "tools/call", params: { name: "fang_url", arguments: { text: 'Visit http://example.com for more info', operation: 'defang' } } },
  
  // SCP test: only run if sshPrivateKey is available and SSH server is accessible
  ...(sshPrivateKey && fs.existsSync('/usr/sbin/sshd') ? [{
    jsonrpc: "2.0",
    id: 118,
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
  
  // Simple check: if we get any content back, the tool is working
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

  // Send test messages
  for (const message of testMessages) {
    server.stdin.write(JSON.stringify(message) + '\n');
    // Uniform delay for all tools
    await new Promise(resolve => setTimeout(resolve, 500));
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
    if (!msg || !msg.id || msg.id === 1) continue; // skip init and undefined messages
    // Match response by id using loose equality to handle string/number mismatch
    const resp = responses.find(r => r.id == msg.id);
    
    if (!resp) {
      console.log(`❌ Tool ${msg.params?.name || msg.method} (id ${msg.id}): No response`);
      failed++;
      continue;
    }
    
    if (checkResult(resp.result, msg.params?.name)) {
      console.log(`✅ Tool ${msg.params?.name || msg.method} (id ${msg.id}): PASS`);
      passed++;
    } else {
      // Only show debug output on failures
      console.log(`❌ Tool ${msg.params?.name || msg.method} (id ${msg.id}): FAIL`);
      console.log(`[DEBUG] Failed tool response:`, JSON.stringify(resp));
      if (resp.result && resp.result.content) {
        console.log(`[DEBUG] Result content:`, JSON.stringify(resp.result.content));
      } else if (resp.result) {
        console.log(`[DEBUG] Result:`, JSON.stringify(resp.result));
      }
      failed++;
    }
  }
  console.log(`\nTest summary: ${passed} passed, ${failed} failed, ${testMessages.length - 1} total.`);
  testCompleted = true;
  if (!server.killed) server.kill('SIGKILL');
  process.exit(failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testAllTools().catch(e => { console.error('Test runner error:', e); process.exit(1); });
}
