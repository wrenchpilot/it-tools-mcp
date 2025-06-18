#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 Testing Final Tool Upgrades');
console.log('==============================\n');

function testTool(toolName, args) {
  return new Promise((resolve, reject) => {
    console.log(`Testing ${toolName}...`);
    
    const child = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ ${toolName} failed with code ${code}`);
        console.log('Error:', errorOutput);
        reject(new Error(`Process exited with code ${code}`));
        return;
      }

      try {
        // Find the JSON response in the output
        const lines = output.split('\n');
        const responseLine = lines.find(line => line.trim().startsWith('{"jsonrpc"'));
        
        if (!responseLine) {
          console.log(`❌ ${toolName} - No valid JSON response found`);
          console.log('Output:', output);
          reject(new Error('No JSON response found'));
          return;
        }

        const response = JSON.parse(responseLine);
        
        if (response.error) {
          console.log(`❌ ${toolName} error:`, response.error.message);
          reject(new Error(response.error.message));
          return;
        }

        if (response.result && response.result.content && response.result.content[0]) {
          console.log(`✅ ${toolName} - Success!`);
          console.log('Result preview:', response.result.content[0].text.substring(0, 200) + '...\n');
          resolve(response.result);
        } else {
          console.log(`❌ ${toolName} - Invalid response format`);
          console.log('Response:', JSON.stringify(response, null, 2));
          reject(new Error('Invalid response format'));
        }
      } catch (err) {
        console.log(`❌ ${toolName} - JSON parse error:`, err.message);
        console.log('Raw output:', output);
        reject(err);
      }
    });

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
  });
}

async function runTests() {
  const tests = [
    // Test upgraded IBAN validator
    {
      name: 'iban-validate',
      args: { iban: 'GB82 WEST 1234 5698 7654 32' }
    },
    {
      name: 'iban-validate', 
      args: { iban: 'DE89370400440532013000' }
    },
    {
      name: 'iban-validate',
      args: { iban: 'INVALID123' }
    },
    
    // Test upgraded Markdown to HTML
    {
      name: 'markdown-to-html',
      args: { 
        markdown: `# Hello World

This is **bold** text and *italic* text.

## Features
- List item 1
- List item 2

\`\`\`javascript
console.log('Hello World');
\`\`\`

[Link](https://example.com)` 
      }
    },
    
    // Test upgraded HTML to Markdown
    {
      name: 'html-to-markdown',
      args: { 
        html: `<h1>Hello World</h1>
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
<li>Item 1</li>
<li>Item 2</li>
</ul>
<a href="https://example.com">Link</a>` 
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await testTool(test.name, test.args);
      passed++;
    } catch (error) {
      console.error(`Test failed: ${error.message}\n`);
      failed++;
    }
  }

  console.log('\n📊 Final Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All final upgrade tests passed! The tools are ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementations.');
    process.exit(1);
  }
}

runTests().catch(console.error);
