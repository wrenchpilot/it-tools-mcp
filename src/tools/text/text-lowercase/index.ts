import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextLowercase(server: McpServer) {
  server.tool(
    "text-lowercase",
    "Convert text to lowercase",
    {
      text: z.string().describe("Text to convert to lowercase"),
    },
    async ({ text }) => {
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
