import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "crypto";

export function registerUuidGenerate(server: McpServer) {
  server.registerTool("uuid-generate", {
  description: 'Generate a universally unique identifier (UUID). Example: generates "550e8400-e29b-41d4-a716-446655440000"',
  inputSchema: {}
}, async () => {
      const uuid = randomUUID();
      return {
        content: [
          {
            type: "text",
            text: `Generated UUID: ${uuid}`,
          },
        ],
      };
    }
  );
}
