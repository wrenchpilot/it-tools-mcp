import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerBase64Encode(server: McpServer) {
  server.tool(
    "base64-encode",
    "Encode text to Base64",
    {
      text: z.string().describe("Text to encode to Base64"),
    },
    async ({ text }) => {
      const encoded = Buffer.from(text, 'utf-8').toString('base64');
      return {
        content: [
          {
            type: "text",
            text: `Base64 encoded: ${encoded}`,
          },
        ],
      };
    }
  );
}
