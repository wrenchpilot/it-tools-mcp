import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlEncode(server: McpServer) {
  server.registerTool("html-encode", {
  description: "Encode HTML entities",
  inputSchema: {
      text: z.string().describe("Text to HTML encode"),
    }
}, async ({ text }) => {
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
