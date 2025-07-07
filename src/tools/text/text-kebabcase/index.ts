import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextKebabcase(server: McpServer) {
  server.tool(
    "text-kebabcase",
    "Convert text to kebab-case",
    {
      text: z.string().describe("Text to convert to kebab-case"),
    },
    async ({ text }) => {
      const kebabCase = text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
      return {
        content: [
          {
            type: "text",
            text: `kebab-case: ${kebabCase}`,
          },
        ],
      };
    }
  );
}
