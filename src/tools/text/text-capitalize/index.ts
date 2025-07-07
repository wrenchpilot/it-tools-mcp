import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextCapitalize(server: McpServer) {
  server.tool(
    "text-capitalize",
    "Capitalize first letter of each word",
    {
      text: z.string().describe("Text to capitalize"),
    },
    async ({ text }) => {
      const capitalized = text.replace(/\b\w/g, l => l.toUpperCase());
      return {
        content: [
          {
            type: "text",
            text: `Capitalized: ${capitalized}`,
          },
        ],
      };
    }
  );
}
