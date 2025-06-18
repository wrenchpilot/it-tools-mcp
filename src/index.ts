#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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

// Create server instance
const server = new McpServer({
  name: "it-tools-mcp",
  version: "3.0.0",
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

// Run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IT Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});