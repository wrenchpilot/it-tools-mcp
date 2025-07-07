import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "crypto";

export function registerUuidGenerate(server: McpServer) {
  server.tool(
    "uuid-generate",
    "Generate a random UUID v4",
    {},
    async () => {
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
