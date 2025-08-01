import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDecodeHtml(server: McpServer) {
  server.registerTool("decode_html", {
  description: "Decode HTML entities",
  inputSchema: {
      text: z.string().describe("HTML encoded text to decode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decode Html",
      description: "Decode HTML entities",
      readOnlyHint: false
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
