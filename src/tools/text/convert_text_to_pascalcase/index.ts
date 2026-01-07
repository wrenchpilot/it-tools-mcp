import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextPascalcase(server: McpServer) {
  server.registerTool("convert_text_to_pascalcase", {
    description: "Convert text to PascalCase",

  inputSchema: {
      text: z.string().describe("Text to convert to PascalCase"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Pascalcase",

      
      readOnlyHint: false
    }
}, async ({ text }) => {
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
