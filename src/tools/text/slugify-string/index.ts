import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSlugifyString(server: McpServer) {
  server.registerTool("slugify-string", {
  description: "Convert text to URL-friendly slug format",
  inputSchema: {
      text: z.string().describe("Text to convert to slug"),
      separator: z.string().describe("Character to use as separator").optional(),
      lowercase: z.boolean().describe("Convert to lowercase").optional(),
    }
}, async ({ text, separator = "-", lowercase = true }) => {
      try {
        let slug = text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .trim()
          .replace(/\s+/g, separator) // Replace spaces with separator
          .replace(new RegExp(`${separator}+`, 'g'), separator); // Remove duplicate separators

        if (lowercase) {
          slug = slug.toLowerCase();
        }

        return {
          content: [
            {
              type: "text",
              text: `Original: ${text}
Slug: ${slug}

Settings:
- Separator: "${separator}"
- Lowercase: ${lowercase}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating slug: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
