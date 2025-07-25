import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUrlDecode(server: McpServer) {
  server.registerTool("url-decode", {
  description: "URL decode text",
  inputSchema: {
      text: z.string().describe("URL encoded text to decode"),
    }
}, async ({ text }) => {
      try {
        const decoded = decodeURIComponent(text);
        return {
          content: [
            {
              type: "text",
              text: `URL decoded: ${decoded}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error decoding URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
