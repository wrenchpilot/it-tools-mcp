import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextUppercase(server: McpServer) {
  server.tool(
    "text-uppercase",
    "Convert text to uppercase",
    {
      text: z.string().describe("Text to convert to uppercase"),
    },
    async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Uppercase: ${text.toUpperCase()}`,
          },
        ],
      };
    }
  );
}
