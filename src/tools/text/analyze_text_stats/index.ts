import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextStats(server: McpServer) {
  server.registerTool("analyze_text_stats", {
  description: "Get statistics about text (character count, word count, etc.)",
  inputSchema: {
      text: z.string().describe("Text to analyze"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Analyze Text Stats",
      description: "Get statistics about text (character count, word count, etc",
      readOnlyHint: true
    }
}, async ({ text }) => {
      const lines = text.split('\n');
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);

      return {
        content: [
          {
            type: "text",
            text: `Text Statistics:

Characters: ${characters}
Characters (no spaces): ${charactersNoSpaces}
Words: ${words.length}
Lines: ${lines.length}
Paragraphs: ${paragraphs.length}

Reading time: ~${Math.ceil(words.length / 200)} minutes (200 WPM)
Speaking time: ~${Math.ceil(words.length / 150)} minutes (150 WPM)`,
          },
        ],
      };
    }
  );
}
