#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getResourceUsage } from "./security.js";
import fs from 'fs';
import path from 'path';

// Import tool modules
import { registerEncodingTools } from "./tools/encoding.js";
import { registerCryptoTools } from "./tools/crypto.js";
import { registerDataFormatTools } from "./tools/dataFormat.js";
import { registerTextTools } from "./tools/text.js";
import { registerIdGeneratorTools } from "./tools/idGenerators.js";
import { registerNetworkTools } from "./tools/network.js";
import { registerMathTools } from "./tools/math.js";
import { registerUtilityTools } from "./tools/utility.js";
import { registerDevelopmentTools } from "./tools/development.js";
import { registerColorTools } from "./tools/color.js";

// Helper to read version from package.json at runtime
function getPackageVersion() {
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

// Register all tool modules
registerEncodingTools(server);
registerCryptoTools(server);
registerDataFormatTools(server);
registerTextTools(server);
registerIdGeneratorTools(server);
registerNetworkTools(server);
registerMathTools(server);
registerUtilityTools(server);
registerDevelopmentTools(server);
registerColorTools(server);

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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
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
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});