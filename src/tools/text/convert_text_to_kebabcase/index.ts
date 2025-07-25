import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextKebabcase(server: McpServer) {
  server.registerTool("convert_text_to_kebabcase", {
  description: "Convert text to kebab-case",
  inputSchema: {
      text: z.string().describe("Text to convert to kebab-case"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Kebabcase",
      description: "Convert text to kebab-case",
      readOnlyHint: false
    }
}, async ({ text }) => {
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
