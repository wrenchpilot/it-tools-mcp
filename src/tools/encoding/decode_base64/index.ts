import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDecodeBase64(server: McpServer) {
  server.registerTool("decode_base64", {
  description: 'Decode Base64 text back to original text. Example: "SGVsbG8gV29ybGQ=" → "Hello World"',

  inputSchema: {
      text: z.string().min(1).regex(/^[A-Za-z0-9+/]*={0,2}$/, "Invalid Base64 format").describe("Base64 text to decode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decode Base64",

      readOnlyHint: false
    }
}, async ({ text }) => {
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf-8');
        return {
          content: [
            {
              type: "text",
              text: `Base64 decoded: ${decoded}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error decoding Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
