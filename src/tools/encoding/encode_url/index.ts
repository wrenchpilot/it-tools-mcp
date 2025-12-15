import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEncodeUrl(server: McpServer) {
  server.registerTool("encode_url", {

  inputSchema: {
      text: z.string().describe("Text to URL encode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Encode Url",

      readOnlyHint: false
    }
}, async ({ text }) => {
      const encoded = encodeURIComponent(text);
      return {
        content: [
          {
            type: "text",
            text: `URL encoded: ${encoded}`,
          },
        ],
      };
    }
  );
}
