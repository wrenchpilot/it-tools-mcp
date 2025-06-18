#!/usr/bin/env node

import { spawn } from 'child_process';

// Test QR code generation with the fixed implementation
const testQRGeneration = () => {
    console.log('🧪 Testing QR Code Generation (Fixed Implementation)');
    
    const testRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "qr-generate",
            arguments: {
                text: "Hello, World! This is a test QR code.",
                size: 2
            }
        }
    };

    const dockerProcess = spawn('docker', [
        'exec', '-i', 'it-tools-mcp-server',
        'node', '/app/build/index.js'
    ], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    dockerProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    dockerProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    dockerProcess.on('close', (code) => {
        console.log(`Process exited with code: ${code}`);
        
        if (errorOutput) {
            console.log('❌ Error output:', errorOutput);
        }
        
        try {
            // Parse the JSON response
            const lines = output.trim().split('\n');
            let jsonResponse = null;
            
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.result && parsed.result.content) {
                        jsonResponse = parsed;
                        break;
                    }
                } catch (e) {
                    // Skip non-JSON lines
                }
            }
            
            if (jsonResponse) {
                console.log('✅ QR Code generation successful!');
                console.log('Response structure:', {
                    hasResult: !!jsonResponse.result,
                    hasContent: !!jsonResponse.result?.content,
                    contentType: jsonResponse.result?.content?.[0]?.type,
                    textLength: jsonResponse.result?.content?.[0]?.text?.length
                });
                
                const qrContent = jsonResponse.result.content[0].text;
                
                // Check if it's an image (should start with data:image)
                if (qrContent.startsWith('data:image/')) {
                    console.log('✅ QR code is correctly generated as an image!');
                    console.log('🖼️  Image format:', qrContent.substring(0, 50) + '...');
                } else if (qrContent.includes('█') || qrContent.includes('▀') || qrContent.includes('\x1b[')) {
                    console.log('⚠️  QR code is still ASCII/ANSI format');
                    console.log('First 100 chars:', qrContent.substring(0, 100));
                } else {
                    console.log('❓ Unknown QR code format');
                    console.log('First 100 chars:', qrContent.substring(0, 100));
                }
            } else {
                console.log('❌ No valid JSON response received');
                console.log('Raw output:', output);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            console.log('Raw output:', output);
        }
    });

    // Send the request
    dockerProcess.stdin.write(JSON.stringify(testRequest) + '\n');
    dockerProcess.stdin.end();
};

// Run the test
testQRGeneration();
