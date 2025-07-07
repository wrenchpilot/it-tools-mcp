import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextPascalcase(server: McpServer) {
  server.tool(
    "text-pascalcase",
    "Convert text to PascalCase",
    {
      text: z.string().describe("Text to convert to PascalCase"),
    },
    async ({ text }) => {
      const pascalCase = text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '');
      return {
        content: [
          {
            type: "text",
            text: `PascalCase: ${pascalCase}`,
          },
        ],
      };
    }
  );
}
