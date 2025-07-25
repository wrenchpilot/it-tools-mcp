import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEmojiSearch(server: McpServer) {
  server.registerTool("search_emoji", {
  description: "Search for emojis by name or category",
  inputSchema: {
      query: z.string().describe("Search term for emoji (name, category, or keyword)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Search Emoji",
      description: "Search for emojis by name or category",
      readOnlyHint: false
    }
}, async ({ query }) => {
      try {
        // Basic emoji database (simplified)
        const emojis: Record<string, string[]> = {
          // Faces
          "happy": ["😀", "😃", "😄", "😁", "😊", "🙂", "😉"],
          "sad": ["😢", "😭", "😔", "☹️", "🙁", "😞", "😟"],
          "love": ["😍", "🥰", "😘", "💕", "💖", "💗", "❤️"],
          "angry": ["😠", "😡", "🤬", "👿", "💢"],

          // Animals
          "cat": ["🐱", "🐈", "🙀", "😸", "😹", "😻", "😼"],
          "dog": ["🐶", "🐕", "🦮", "🐕‍🦺"],
          "animal": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻"],

          // Food
          "food": ["🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🍝", "🍜"],
          "fruit": ["🍎", "🍊", "🍋", "🍌", "🍇", "🍓", "🫐", "🍈"],

          // Objects
          "tech": ["💻", "📱", "⌚", "📺", "📷", "🎮", "💾", "💿"],
          "tools": ["🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🔩"],

          // Symbols
          "check": ["✅", "☑️", "✔️"],
          "cross": ["❌", "❎", "✖️"],
          "star": ["⭐", "🌟", "✨", "💫", "⭐"],
          "heart": ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍"]
        };

        const searchTerm = query.toLowerCase();
        let results: string[] = [];

        for (const [category, emojiList] of Object.entries(emojis)) {
          if (category.includes(searchTerm)) {
            results.push(...emojiList);
          }
        }

        // Remove duplicates
        results = [...new Set(results)];

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No emojis found for "${query}".

Available categories: ${Object.keys(emojis).join(', ')}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Emojis for "${query}":

${results.join(' ')}

Found ${results.length} emoji(s)
Copy any emoji above to use it!`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching emojis: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
