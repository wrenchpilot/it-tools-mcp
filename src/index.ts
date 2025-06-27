#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getResourceUsage } from "./security.js";
import fs from 'fs';
import path from 'path';

// Helper to read version from package.json at runtime (ESM compatible)
function getPackageVersion() {
  // Use import.meta.url to get the directory in ESM
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkgRaw = fs.readFileSync(pkgPath, 'utf-8');
  return JSON.parse(pkgRaw).version;
}

// Create server instance
const server = new McpServer({
  name: "it-tools-mcp",
  version: getPackageVersion(),
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register all tool modules (dynamically for faster startup, with per-module timing)
async function registerAllTools(server: McpServer) {
  const modules = [
    { name: 'encoding', fn: () => import('./tools/encoding.js').then(m => m.registerEncodingTools(server)) },
    { name: 'crypto', fn: () => import('./tools/crypto.js').then(m => m.registerCryptoTools(server)) },
    { name: 'dataFormat', fn: () => import('./tools/dataFormat.js').then(m => m.registerDataFormatTools(server)) },
    { name: 'text', fn: () => import('./tools/text.js').then(m => m.registerTextTools(server)) },
    { name: 'idGenerators', fn: () => import('./tools/idGenerators.js').then(m => m.registerIdGeneratorTools(server)) },
    { name: 'network', fn: () => import('./tools/network.js').then(m => m.registerNetworkTools(server)) },
    { name: 'math', fn: () => import('./tools/math.js').then(m => m.registerMathTools(server)) },
    { name: 'utility', fn: () => import('./tools/utility.js').then(m => m.registerUtilityTools(server)) },
    { name: 'development', fn: () => import('./tools/development.js').then(m => m.registerDevelopmentTools(server)) },
    { name: 'color', fn: () => import('./tools/color.js').then(m => m.registerColorTools(server)) },
  ];
  for (const mod of modules) {
    console.time(`register:${mod.name}`);
    await mod.fn();
    console.timeEnd(`register:${mod.name}`);
  }
}

// Add resource monitoring tool
server.tool(
  "system-info",
  "Get system resource usage and server information",
  {},
  async () => {
    const usage = getResourceUsage();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            server: "IT Tools MCP Server",
            version: getPackageVersion(),
            uptime: `${Math.floor(usage.uptimeSeconds)} seconds`,
            memory: usage.memory,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }
);

// Run the server
async function main() {
  console.time("Tool registration");
  await registerAllTools(server);
  console.timeEnd("Tool registration");

  const transport = new StdioServerTransport();
  console.time("Server connect");
  await server.connect(transport);
  console.timeEnd("Server connect");

  // Log startup with resource info
  console.error("IT Tools MCP Server running on stdio");
  console.error("Resource usage:", JSON.stringify(getResourceUsage(), null, 2));
  
  // Only start periodic monitoring in production, not in tests
  if (process.env.NODE_ENV !== 'test') {
    // Periodic resource monitoring (every 5 minutes)
    setInterval(() => {
      const usage = getResourceUsage();
      if (usage.memory.heapUsedBytes > 200 * 1024 * 1024) { // Alert if using more than 200MB
        console.error("High memory usage detected:", usage.memory);
      }
    }, 5 * 60 * 1000);
  }
  console.timeEnd("Total startup");
}

console.time("Total startup");
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});