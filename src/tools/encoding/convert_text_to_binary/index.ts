import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertTextBinary(server: McpServer) {
  server.registerTool("convert_text_to_binary", {
    description: "Convert text to binary and vice versa",

  inputSchema: {
      input: z.string().describe("Text to convert to binary, or binary to convert to text"),
      operation: z.enum(["encode", "decode"]).describe("Operation: encode text to binary or decode binary to text"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Binary",

      
      readOnlyHint: false
    }
}, async ({ input, operation }) => {
      try {
        if (operation === "encode") {
          const binary = input
            .split('')
            .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ');
          
          return {
            content: [
              {
                type: "text",
                text: `Text: ${input}
Binary: ${binary}`,
              },
            ],
          };
        } else {
          // Decode binary to text
          const binaryGroups = input.replace(/\s+/g, ' ').trim().split(' ');
          const text = binaryGroups
            .map(binary => String.fromCharCode(parseInt(binary, 2)))
            .join('');
          
          return {
            content: [
              {
                type: "text",
                text: `Binary: ${input}
Text: ${text}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting text/binary: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
