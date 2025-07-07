import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerLoremIpsumGenerator(server: McpServer) {
  server.tool(
    "lorem-ipsum-generator",
    "Generate Lorem Ipsum placeholder text",
    {
      count: z.number().describe("Number of items to generate").optional(),
      type: z.enum(["words", "sentences", "paragraphs"]).describe("Type of content to generate").optional(),
    },
    async ({ count = 5, type = "sentences" }) => {
      try {
        if (count < 1 || count > 100) {
          return {
            content: [
              {
                type: "text",
                text: "Count must be between 1 and 100.",
              },
            ],
          };
        }
        const words = [
          "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
          "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
          "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
          "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
          "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
          "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
          "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
          "deserunt", "mollit", "anim", "id", "est", "laborum"
        ];

        let result = "";

        if (type === "words") {
          const selectedWords = [];
          for (let i = 0; i < count; i++) {
            selectedWords.push(words[Math.floor(Math.random() * words.length)]);
          }
          result = selectedWords.join(" ");
        } else if (type === "sentences") {
          const sentences = [];
          for (let i = 0; i < count; i++) {
            const sentenceLength = Math.floor(Math.random() * 10) + 5;
            const sentenceWords = [];
            for (let j = 0; j < sentenceLength; j++) {
              sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
            }
            sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
            sentences.push(sentenceWords.join(" ") + ".");
          }
          result = sentences.join(" ");
        } else if (type === "paragraphs") {
          const paragraphs = [];
          for (let i = 0; i < count; i++) {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            const sentences = [];
            for (let j = 0; j < sentenceCount; j++) {
              const sentenceLength = Math.floor(Math.random() * 10) + 5;
              const sentenceWords = [];
              for (let k = 0; k < sentenceLength; k++) {
                sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
              }
              sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
              sentences.push(sentenceWords.join(" ") + ".");
            }
            paragraphs.push(sentences.join(" "));
          }
          result = paragraphs.join("\n\n");
        }

        return {
          content: [
            {
              type: "text",
              text: `Lorem Ipsum (${count} ${type}):\n\n${result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating Lorem Ipsum: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
