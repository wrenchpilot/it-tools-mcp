import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlDecode(server: McpServer) {
  server.tool(
    "html-decode",
    "Decode HTML entities",
    {
      text: z.string().describe("HTML encoded text to decode"),
    },
    async ({ text }) => {
      const decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return {
        content: [
          {
            type: "text",
            text: `HTML decoded: ${decoded}`,
          },
        ],
      };
    }
  );
}
