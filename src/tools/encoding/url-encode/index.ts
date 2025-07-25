import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUrlEncode(server: McpServer) {
  server.registerTool("url-encode", {
  description: "URL encode text",
  inputSchema: {
      text: z.string().describe("Text to URL encode"),
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
