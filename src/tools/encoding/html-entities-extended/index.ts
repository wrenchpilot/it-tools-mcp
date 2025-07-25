import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlEntitiesExtended(server: McpServer) {
  server.registerTool("html-entities-extended", {
  description: "Extended HTML entity encoding/decoding",
  inputSchema: {
      text: z.string().describe("Text to encode or decode"),
      operation: z.enum(["encode", "decode"]).describe("Operation to perform"),
    }
}, async ({ text, operation }) => {
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
}
