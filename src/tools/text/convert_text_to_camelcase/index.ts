import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextCamelcase(server: McpServer) {
  server.registerTool("convert_text_to_camelcase", {
    description: "Convert text to camelCase format. Example: 'hello world' → 'helloWorld', 'my-variable-name' → 'myVariableName'",

    inputSchema: {
      text: z.string().describe("Text to convert to camelCase"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert to camelCase",

      
      readOnlyHint: false
    }
  }, async ({ text }) => {
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
