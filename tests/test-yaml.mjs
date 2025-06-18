#!/usr/bin/env node

import * as YAML from 'js-yaml';

const testYaml = `
networks:
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
      - /tmp:/tmp
`;

console.log('Testing YAML library directly...\n');

try {
  const parsed = YAML.load(testYaml);
  console.log('✅ YAML parsed successfully');
  console.log('Parsed object:', JSON.stringify(parsed, null, 2));
  
  const formatted = YAML.dump(parsed, {
    indent: 2,
    lineWidth: 80,
    noRefs: false,
    noCompatMode: false,
    condenseFlow: false,
    quotingType: '"',
    forceQuotes: false,
    sortKeys: false,
  });
  
  console.log('\n📝 Formatted YAML:');
  console.log(formatted);
  
} catch (error) {
  console.error('❌ Error:', error);
}
