import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerStringObfuscator(server: McpServer) {
  server.registerTool("obfuscate_string", {

  inputSchema: {
      text: z.string().describe("Text to obfuscate"),
      method: z.enum(["html-entities", "unicode", "base64"]).describe("Obfuscation method").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Obfuscate String",

      readOnlyHint: false
    }
}, async ({ text, method = "html-entities" }) => {
      try {
        let result = '';

        switch (method) {
          case 'html-entities':
            result = text
              .split('')
              .map(char => `&#${char.charCodeAt(0)};`)
              .join('');
            break;

          case 'unicode':
            result = text
              .split('')
              .map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
              .join('');
            break;

          case 'base64':
            result = Buffer.from(text, 'utf-8').toString('base64');
            break;
        }

        return {
          content: [
            {
              type: "text",
              text: `Obfuscated Text (${method}):

Original: ${text}
Obfuscated: ${result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error obfuscating text: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
