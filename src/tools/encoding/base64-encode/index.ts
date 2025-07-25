import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerBase64Encode(server: McpServer) {
  server.registerTool("base64-encode", {
    description: 'Encode text to Base64 format. Example: "Hello World" → "SGVsbG8gV29ybGQ="',
    inputSchema: {
      text: z.string().min(1).describe("Text to encode to Base64"),
    }
  }, async ({ text }) => {
    try {
      const encoded = Buffer.from(text, 'utf-8').toString('base64');
      return {
        content: [
          {
            type: "text",
            text: `Base64 encoded: ${encoded}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error encoding to Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  });
}
