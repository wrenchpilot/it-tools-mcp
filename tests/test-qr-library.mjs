#!/usr/bin/env node

import QRCode from 'qrcode';

async function testQRLibrary() {
  console.log('🧪 Testing QR code library directly...\n');
  
  try {
    // Test 1: Simple text
    console.log('📝 Test 1: Simple Text');
    const qr1 = await QRCode.toString('Hello World!', { type: 'terminal', small: true });
    console.log(qr1);
    console.log('─'.repeat(50));
    
    // Test 2: URL
    console.log('📝 Test 2: URL');
    const qr2 = await QRCode.toString('https://github.com', { type: 'terminal', small: true });
    console.log(qr2);
    console.log('─'.repeat(50));
    
    // Test 3: WiFi
    console.log('📝 Test 3: WiFi');
    const wifiString = 'WIFI:T:WPA;S:TestNetwork;P:password123;H:false;;';
    const qr3 = await QRCode.toString(wifiString, { type: 'terminal', small: true });
    console.log(qr3);
    console.log('─'.repeat(50));
    
    console.log('✅ QR code library is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing QR library:', error);
  }
}

testQRLibrary();
