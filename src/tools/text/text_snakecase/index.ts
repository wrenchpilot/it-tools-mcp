import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextSnakecase(server: McpServer) {
  server.registerTool("text_snakecase", {
    description: "Convert text to snake_case",
    inputSchema: {
      text: z.string().describe("Text to convert to snake_case"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Snake Case",
      description: "Convert text to snake_case",
      readOnlyHint: false
    }
  }, async ({ text }) => {
    const snakeCase = text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase()
      .replace(/^_+|_+$/g, '');
    return {
      content: [
        {
          type: "text",
          text: `snake_case: ${snakeCase}`,
        },
      ],
    };
  });
}
