import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDecodeUrl(server: McpServer) {
  server.registerTool("decode_url", {

  inputSchema: {
      text: z.string().describe("URL encoded text to decode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decode Url",

      readOnlyHint: false
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
