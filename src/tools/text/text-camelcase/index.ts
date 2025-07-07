import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextCamelcase(server: McpServer) {
  server.tool(
    "text-camelcase",
    "Convert text to camelCase",
    {
      text: z.string().describe("Text to convert to camelCase"),
    },
    async ({ text }) => {
      const camelCase = text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
      return {
        content: [
          {
            type: "text",
            text: `camelCase: ${camelCase}`,
          },
        ],
      };
    }
  );
}
