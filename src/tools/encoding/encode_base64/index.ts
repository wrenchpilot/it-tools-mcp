import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEncodeBase64(server: McpServer) {
  server.registerTool("encode_base64", {

    inputSchema: {
      text: z.string().min(1).describe("Text to encode to Base64"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Encode Base64",

      readOnlyHint: false
    }
  }, async ({ text }) => {
    try {
      const encoded = Buffer.from(text, 'utf-8').toString('base64');
      return {
        content: [
          {
            type: "text",
            text: `Base64 encoded: ${encoded}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error encoding to Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  });
}
