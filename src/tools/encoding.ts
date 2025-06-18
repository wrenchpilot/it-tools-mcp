import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEncodingTools(server: McpServer) {
  // Base64 encoding tool
  server.tool(
    "base64-encode",
    "Encode text to Base64",
    {
      text: z.string().describe("Text to encode to Base64"),
    },
    async ({ text }) => {
      const encoded = Buffer.from(text, 'utf-8').toString('base64');
      return {
        content: [
          {
            type: "text",
            text: `Base64 encoded: ${encoded}`,
          },
        ],
      };
    }
  );

  // Base64 decoding tool
  server.tool(
    "base64-decode",
    "Decode Base64 text",
    {
      text: z.string().describe("Base64 text to decode"),
    },
    async ({ text }) => {
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf-8');
        return {
          content: [
            {
              type: "text",
              text: `Base64 decoded: ${decoded}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error decoding Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // URL encoding tool
  server.tool(
    "url-encode",
    "URL encode text",
    {
      text: z.string().describe("Text to URL encode"),
    },
    async ({ text }) => {
      const encoded = encodeURIComponent(text);
      return {
        content: [
          {
            type: "text",
            text: `URL encoded: ${encoded}`,
          },
        ],
      };
    }
  );

  // URL decoding tool
  server.tool(
    "url-decode",
    "URL decode text",
    {
      text: z.string().describe("URL encoded text to decode"),
    },
    async ({ text }) => {
      try {
        const decoded = decodeURIComponent(text);
        return {
          content: [
            {
              type: "text",
              text: `URL decoded: ${decoded}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error decoding URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // HTML encode tool
  server.tool(
    "html-encode",
    "Encode HTML entities",
    {
      text: z.string().describe("Text to HTML encode"),
    },
    async ({ text }) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return {
        content: [
          {
            type: "text",
            text: `HTML encoded: ${encoded}`,
          },
        ],
      };
    }
  );

  // HTML decode tool
  server.tool(
    "html-decode",
    "Decode HTML entities",
    {
      text: z.string().describe("HTML encoded text to decode"),
    },
    async ({ text }) => {
      const decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return {
        content: [
          {
            type: "text",
            text: `HTML decoded: ${decoded}`,
          },
        ],
      };
    }
  );

  // Extended HTML entities tool
  server.tool(
    "html-entities-extended",
    "Extended HTML entity encoding/decoding",
    {
      text: z.string().describe("Text to encode or decode"),
      operation: z.enum(["encode", "decode"]).describe("Operation to perform"),
    },
    async ({ text, operation }) => {
      try {
        if (operation === "encode") {
          const encoded = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/©/g, '&copy;')
            .replace(/®/g, '&reg;')
            .replace(/™/g, '&trade;')
            .replace(/€/g, '&euro;')
            .replace(/£/g, '&pound;')
            .replace(/¥/g, '&yen;')
            .replace(/§/g, '&sect;')
            .replace(/¶/g, '&para;')
            .replace(/†/g, '&dagger;')
            .replace(/‡/g, '&Dagger;');
          
          return {
            content: [
              {
                type: "text",
                text: `HTML entities encoded: ${encoded}`,
              },
            ],
          };
        } else {
          const decoded = text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&copy;/g, '©')
            .replace(/&reg;/g, '®')
            .replace(/&trade;/g, '™')
            .replace(/&euro;/g, '€')
            .replace(/&pound;/g, '£')
            .replace(/&yen;/g, '¥')
            .replace(/&sect;/g, '§')
            .replace(/&para;/g, '¶')
            .replace(/&dagger;/g, '†')
            .replace(/&Dagger;/g, '‡');
          
          return {
            content: [
              {
                type: "text",
                text: `HTML entities decoded: ${decoded}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error processing HTML entities: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Text to binary converter
  server.tool(
    "text-to-binary",
    "Convert text to binary and vice versa",
    {
      input: z.string().describe("Text to convert to binary, or binary to convert to text"),
      operation: z.enum(["encode", "decode"]).describe("Operation: encode text to binary or decode binary to text"),
    },
    async ({ input, operation }) => {
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
