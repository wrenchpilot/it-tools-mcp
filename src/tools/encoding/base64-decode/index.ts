import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerBase64Decode(server: McpServer) {
  server.tool(
    "base64-decode",
    "Decode Base64 text",
    {
      text: z.string().describe("Base64 text to decode"),
    },
    async ({ text }) => {
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf-8');
        return {
          content: [
            {
              type: "text",
              text: `Base64 decoded: ${decoded}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error decoding Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
