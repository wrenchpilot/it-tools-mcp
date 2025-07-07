import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlEncode(server: McpServer) {
  server.tool(
    "html-encode",
    "Encode HTML entities",
    {
      text: z.string().describe("Text to HTML encode"),
    },
    async ({ text }) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return {
        content: [
          {
            type: "text",
            text: `HTML encoded: ${encoded}`,
          },
        ],
      };
    }
  );
}
