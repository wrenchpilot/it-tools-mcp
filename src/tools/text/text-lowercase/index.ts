import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextLowercase(server: McpServer) {
  server.registerTool("text-lowercase", {
  description: "Convert text to lowercase",
  inputSchema: {
      text: z.string().describe("Text to convert to lowercase"),
    }
}, async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Lowercase: ${text.toLowerCase()}`,
          },
        ],
      };
    }
  );
}
