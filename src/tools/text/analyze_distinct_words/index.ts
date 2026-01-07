import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDistinctWords(server: McpServer) {
  server.registerTool("analyze_distinct_words", {
    description: "Count distinct words in text and show their frequency",

  inputSchema: {
      text: z.string().describe("Text to analyze for distinct words")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Analyze Distinct Words",

      
      readOnlyHint: true
    }
}, async ({ text }) => {
      // Remove punctuation and split into words
      const cleanedText = text.replace(/[^\w\s]/g, ' ').toLowerCase();
      const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
      
      // Count word frequencies
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // Sort by frequency (descending)
      const sortedWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a);

      const result = sortedWords.map(([word, count]) => `${word}: ${count}`).join('\n');
      
      return {
        content: [{
          type: "text",
          text: `Distinct Words Analysis:
Total unique words: ${sortedWords.length}
Total words: ${words.length}

Word frequencies:
${result}`
        }]
      };
    }
  );
}
