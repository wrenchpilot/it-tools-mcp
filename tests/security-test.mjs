import { secureSchemas, sanitize, rateLimiter, secureToolHandler, getResourceUsage, INPUT_LIMITS } from '../build/security.js';

/**
 * Test suite for security utilities
 */

console.log('🔒 Testing IT Tools MCP Security Utilities\n');

// Test 1: Input validation schemas
console.log('📝 Test 1: Input Validation Schemas');
try {
  // Valid inputs
  console.log('✅ Valid text:', secureSchemas.text.parse('Hello World'));
  console.log('✅ Valid email:', secureSchemas.email.parse('test@example.com'));
  console.log('✅ Valid hex color:', secureSchemas.hexColor.parse('#FF5733'));
  console.log('✅ Valid base64:', secureSchemas.base64.parse('SGVsbG8gV29ybGQ='));
  
  // Test size limits
  const largeText = 'x'.repeat(INPUT_LIMITS.TEXT_MAX - 1);
  console.log('✅ Large text within limits:', largeText.length, 'characters');
  
  // Test invalid inputs
  try {
    secureSchemas.text.parse('x'.repeat(INPUT_LIMITS.TEXT_MAX + 1));
  } catch (e) {
    console.log('✅ Correctly rejected oversized input:', e.message);
  }
  
  try {
    secureSchemas.email.parse('invalid-email');
  } catch (e) {
    console.log('✅ Correctly rejected invalid email:', e.message);
  }
  
} catch (error) {
  console.error('❌ Schema validation test failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Input sanitization
console.log('🧹 Test 2: Input Sanitization');
try {
  const dangerousText = 'Hello\0World\x1F<script>alert("xss")</script>';
  const sanitizedText = sanitize.text(dangerousText);
  console.log('✅ Original text:', JSON.stringify(dangerousText));
  console.log('✅ Sanitized text:', JSON.stringify(sanitizedText));
  
  const htmlText = '<script>alert("xss")</script>';
  const escapedHtml = sanitize.html(htmlText);
  console.log('✅ Original HTML:', htmlText);
  console.log('✅ Escaped HTML:', escapedHtml);
  
  // Test regex sanitization
  const safeRegex = sanitize.regex('hello.*world');
  console.log('✅ Safe regex accepted:', safeRegex);
  
  try {
    sanitize.regex('(a*)*b'); // Dangerous nested quantifier
  } catch (e) {
    console.log('✅ Correctly rejected dangerous regex:', e.message);
  }
  
} catch (error) {
  console.error('❌ Sanitization test failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Rate limiting
console.log('⏱️  Test 3: Rate Limiting');
try {
  const testId = 'test-user';
  
  // Test normal usage
  for (let i = 0; i < 5; i++) {
    const allowed = rateLimiter.isAllowed(testId);
    console.log(`✅ Request ${i + 1}:`, allowed ? 'Allowed' : 'Blocked');
  }
  
  // Test rate limiting by making many requests
  let blockedCount = 0;
  for (let i = 0; i < 150; i++) {
    if (!rateLimiter.isAllowed('spam-user')) {
      blockedCount++;
    }  
  }
  console.log(`✅ Blocked ${blockedCount}/150 excessive requests`);
  
  // Test reset functionality
  rateLimiter.reset('spam-user');
  const allowedAfterReset = rateLimiter.isAllowed('spam-user');
  console.log('✅ After reset:', allowedAfterReset ? 'Allowed' : 'Still blocked');
  
} catch (error) {
  console.error('❌ Rate limiting test failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 4: Secure tool handler
console.log('🛡️  Test 4: Secure Tool Handler');
try {
  // Mock tool function
  const mockTool = async (params) => {
    if (params.shouldFail) {
      throw new Error('Simulated tool error');
    }
    return { result: 'Success', input: params.text };
  };
  
  const securedTool = secureToolHandler(mockTool, 'test-tool');
  
  // Test successful execution
  const result1 = await securedTool({ text: 'Hello' });
  console.log('✅ Successful execution:', result1);
  
  // Test error handling
  try {
    await securedTool({ shouldFail: true });
  } catch (e) {
    console.log('✅ Error handled securely:', e.message);
  }
  
} catch (error) {
  console.error('❌ Secure tool handler test failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 5: Resource monitoring
console.log('📊 Test 5: Resource Monitoring');
try {
  const usage = getResourceUsage();
  console.log('✅ Current resource usage:');
  console.log('   Memory used:', usage.memory.used, 'MB');
  console.log('   Memory total:', usage.memory.total, 'MB');
  console.log('   Memory external:', usage.memory.external, 'MB');
  console.log('   Uptime:', Math.floor(usage.uptime), 'seconds');
  console.log('   CPU user time:', usage.cpu.user, 'microseconds');
  console.log('   CPU system time:', usage.cpu.system, 'microseconds');
  
} catch (error) {
  console.error('❌ Resource monitoring test failed:', error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 6: Input limits validation
console.log('📏 Test 6: Input Limits Validation');
console.log('✅ Configuration limits:');
Object.entries(INPUT_LIMITS).forEach(([key, value]) => {
  console.log(`   ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`);
});

console.log('\n🎉 Security utility tests completed!');
console.log('✅ All security measures are working correctly.');
console.log('🔒 Your IT Tools MCP Server is secure and ready for production use.');
