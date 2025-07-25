import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";

export function registerGenerateUuid(server: McpServer) {
  server.registerTool("generate_uuid", {
  description: 'Generate a universally unique identifier (UUID). Example: generates "550e8400-e29b-41d4-a716-446655440000"',
  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Generate Uuid",
      description: "Generate a universally unique identifier (UUID)",
      readOnlyHint: false
    }
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
