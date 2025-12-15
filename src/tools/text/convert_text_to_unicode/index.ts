import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextToUnicode(server: McpServer) {
  server.registerTool("convert_text_to_unicode", {

  inputSchema: {
      input: z.string().describe("Text to convert to Unicode or Unicode to convert to text"),
      operation: z.enum(["encode", "decode"]).describe("Operation: encode text to Unicode or decode Unicode to text"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Unicode",

      readOnlyHint: false
    }
}, async ({ input, operation }) => {
      try {
        if (operation === "encode") {
          const unicode = input
            .split('')
            .map(char => `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
            .join(' ');

          return {
            content: [
              {
                type: "text",
                text: `Text: ${input}\nUnicode: ${unicode}`,
              },
            ],
          };
        } else {
          // Decode Unicode to text
          const unicodePattern = /U\+([0-9A-Fa-f]{4,6})/g;
          const text = input.replace(unicodePattern, (match, hex) => {
            const decimal = parseInt(hex, 16);
            return String.fromCharCode(decimal);
          });

          return {
            content: [
              {
                type: "text",
                text: `Unicode: ${input}\nText: ${text}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting text/Unicode: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
