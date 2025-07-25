import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlDecode(server: McpServer) {
  server.registerTool("html-decode", {
  description: "Decode HTML entities",
  inputSchema: {
      text: z.string().describe("HTML encoded text to decode"),
    }
}, async ({ text }) => {
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
