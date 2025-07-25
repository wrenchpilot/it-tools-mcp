import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerNumeronymGenerator(server: McpServer) {
  server.registerTool("generate_numeronym", {
  description: "Generate numeronyms (abbreviations with numbers) from text",
  inputSchema: {
      text: z.string().describe("Text to convert to numeronym"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Numeronym",
      description: "Generate numeronyms (abbreviations with numbers) from text",
      readOnlyHint: false
    }
}, async ({ text }) => {
      try {
        const words = text.trim().split(/\s+/);
        const numeronyms = words.map(word => {
          if (word.length <= 3) {
            return word;
          }
          const firstChar = word[0];
          const lastChar = word[word.length - 1];
          const middleCount = word.length - 2;
          return `${firstChar}${middleCount}${lastChar}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `Original: ${text}\nNumeronym: ${numeronyms.join(' ')}\n\nExamples:\n- internationalization → i18n\n- localization → l10n\n- accessibility → a11y`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating numeronym: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
