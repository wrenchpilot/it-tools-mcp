import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEncodeHtml(server: McpServer) {
  server.registerTool("encode_html", {

  inputSchema: {
      text: z.string().describe("Text to HTML encode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Encode Html",

      readOnlyHint: false
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
