import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextTools(server: McpServer) {
  // Text case conversion tools
  server.tool(
    "text-uppercase",
    "Convert text to uppercase",
    {
      text: z.string().describe("Text to convert to uppercase"),
    },
    async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Uppercase: ${text.toUpperCase()}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-lowercase",
    "Convert text to lowercase",
    {
      text: z.string().describe("Text to convert to lowercase"),
    },
    async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Lowercase: ${text.toLowerCase()}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-capitalize",
    "Capitalize first letter of each word",
    {
      text: z.string().describe("Text to capitalize"),
    },
    async ({ text }) => {
      const capitalized = text.replace(/\b\w/g, l => l.toUpperCase());
      return {
        content: [
          {
            type: "text",
            text: `Capitalized: ${capitalized}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-camelcase",
    "Convert text to camelCase",
    {
      text: z.string().describe("Text to convert to camelCase"),
    },
    async ({ text }) => {
      const camelCase = text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
      return {
        content: [
          {
            type: "text",
            text: `camelCase: ${camelCase}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-pascalcase",
    "Convert text to PascalCase",
    {
      text: z.string().describe("Text to convert to PascalCase"),
    },
    async ({ text }) => {
      const pascalCase = text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '');
      return {
        content: [
          {
            type: "text",
            text: `PascalCase: ${pascalCase}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-kebabcase",
    "Convert text to kebab-case",
    {
      text: z.string().describe("Text to convert to kebab-case"),
    },
    async ({ text }) => {
      const kebabCase = text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
      return {
        content: [
          {
            type: "text",
            text: `kebab-case: ${kebabCase}`,
          },
        ],
      };
    }
  );

  server.tool(
    "text-snakecase",
    "Convert text to snake_case",
    {
      text: z.string().describe("Text to convert to snake_case"),
    },
    async ({ text }) => {
      const snakeCase = text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toLowerCase()
        .replace(/^_+|_+$/g, '');
      return {
        content: [
          {
            type: "text",
            text: `snake_case: ${snakeCase}`,
          },
        ],
      };
    }
  );

  // Text statistics tool
  server.tool(
    "text-stats",
    "Get statistics about text (character count, word count, etc.)",
    {
      text: z.string().describe("Text to analyze"),
    },
    async ({ text }) => {
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

  // Text comparison tool
  server.tool(
    "text-diff",
    "Compare two texts and show differences",
    {
      text1: z.string().describe("First text to compare"),
      text2: z.string().describe("Second text to compare"),
    },
    async ({ text1, text2 }) => {
      try {
        // Simple diff implementation
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);

        let differences = [];
        let same = true;

        for (let i = 0; i < maxLines; i++) {
          const line1 = lines1[i] || '';
          const line2 = lines2[i] || '';

          if (line1 !== line2) {
            same = false;
            if (line1 && line2) {
              differences.push(`Line ${i + 1}: Changed`);
              differences.push(`  - ${line1}`);
              differences.push(`  + ${line2}`);
            } else if (line1) {
              differences.push(`Line ${i + 1}: Removed`);
              differences.push(`  - ${line1}`);
            } else {
              differences.push(`Line ${i + 1}: Added`);
              differences.push(`  + ${line2}`);
            }
          }
        }

        if (same) {
          return {
            content: [
              {
                type: "text",
                text: "✅ Texts are identical - no differences found.",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `❌ Found differences:

${differences.join('\n')}

Summary:
Lines in text 1: ${lines1.length}
Lines in text 2: ${lines2.length}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error comparing texts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // ASCII art generator
  server.tool(
    "ascii-art-text",
    "Generate ASCII art text",
    {
      text: z.string().describe("Text to convert to ASCII art"),
      font: z.string().describe("ASCII art font style. Supports all 295+ figlet fonts. Use 'standard' if unsure.").optional(),
    },
    async ({ text, font = "standard" }) => {
      try {
        // Generate ASCII art using figlet
        const figlet = await import('figlet');
        
        // Get list of available fonts
        const availableFonts = figlet.default.fontsSync();
        
        // Find the exact font match (case insensitive and flexible matching)
        let targetFont = "Standard"; // Default fallback
        const inputFont = font.toLowerCase();
        
        // Direct match
        const exactMatch = availableFonts.find(f => f.toLowerCase() === inputFont);
        if (exactMatch) {
          targetFont = exactMatch;
        } else {
          // Fuzzy match - look for fonts that contain the input as substring
          const partialMatch = availableFonts.find(f => 
            f.toLowerCase().includes(inputFont) || 
            inputFont.includes(f.toLowerCase())
          );
          if (partialMatch) {
            targetFont = partialMatch;
          }
        }

        // Generate ASCII art
        const asciiArt = figlet.default.textSync(text, {
          font: targetFont as any,
          horizontalLayout: 'default',
          verticalLayout: 'default'
        });
        
        const fontUsed = targetFont === font ? font : `${font} → ${targetFont}`;
        
        return {
          content: [
            {
              type: "text",
              text: `ASCII Art (${fontUsed}):\n\n${asciiArt}`,
            },
          ],
        };
      } catch (error) {
        // Get available fonts for error message
        try {
          const figlet = await import('figlet');
          const availableFonts = figlet.default.fontsSync();
          const popularFonts = [
            "Standard", "Big", "Small", "Slant", "3-D", "Banner", "Block", "Shadow", 
            "Larry 3D", "Doom", "Star Wars", "Gothic", "Graffiti", "Bubble", "Digital"
          ];
          
          return {
            content: [
              {
                type: "text",
                text: `Error generating ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}

Font '${font}' not found or invalid.

Popular fonts to try: ${popularFonts.join(', ')}

Total available fonts: ${availableFonts.length}
Some examples: ${availableFonts.slice(0, 10).join(', ')}...

Note: ASCII art generation works best with short text (1-10 characters).`,
              },
            ],
          };
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `Error generating ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}

Note: ASCII art generation works best with short text (1-10 characters).`,
              },
            ],
          };
        }
      }
    }
  );

  // NATO phonetic alphabet converter
  server.tool(
    "text-to-nato-alphabet",
    "Convert text to NATO phonetic alphabet",
    {
      text: z.string().describe("Text to convert to NATO alphabet"),
    },
    async ({ text }) => {
      const natoAlphabet: Record<string, string> = {
        'A': 'Alfa', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
        'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
        'I': 'India', 'J': 'Juliett', 'K': 'Kilo', 'L': 'Lima',
        'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
        'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
        'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
        'Y': 'Yankee', 'Z': 'Zulu',
        '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
        '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
        '8': 'Eight', '9': 'Nine', ' ': '[SPACE]'
      };

      const result = text
        .toUpperCase()
        .split('')
        .map(char => natoAlphabet[char] || `[${char}]`)
        .join(' ');

      return {
        content: [
          {
            type: "text",
            text: `NATO Phonetic Alphabet:

Original: ${text}
NATO: ${result}`,
          },
        ],
      };
    }
  );

  // String obfuscator
  server.tool(
    "string-obfuscator",
    "Obfuscate text by replacing characters with their HTML entities or other representations",
    {
      text: z.string().describe("Text to obfuscate"),
      method: z.enum(["html-entities", "unicode", "base64"]).describe("Obfuscation method").optional(),
    },
    async ({ text, method = "html-entities" }) => {
      try {
        let result = '';

        switch (method) {
          case 'html-entities':
            result = text
              .split('')
              .map(char => `&#${char.charCodeAt(0)};`)
              .join('');
            break;

          case 'unicode':
            result = text
              .split('')
              .map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
              .join('');
            break;

          case 'base64':
            result = Buffer.from(text, 'utf-8').toString('base64');
            break;
        }

        return {
          content: [
            {
              type: "text",
              text: `Obfuscated Text (${method}):

Original: ${text}
Obfuscated: ${result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error obfuscating text: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Slugify string
  server.tool(
    "slugify-string",
    "Convert text to URL-friendly slug format",
    {
      text: z.string().describe("Text to convert to slug"),
      separator: z.string().describe("Character to use as separator").optional(),
      lowercase: z.boolean().describe("Convert to lowercase").optional(),
    },
    async ({ text, separator = "-", lowercase = true }) => {
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

  // Lorem Ipsum generator
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

  // Numeronym generator
  server.tool(
    "numeronym-generator",
    "Generate numeronyms (abbreviations with numbers) from text",
    {
      text: z.string().describe("Text to convert to numeronym"),
    },
    async ({ text }) => {
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

  // Text to Unicode converter
  server.tool(
    "text-to-unicode",
    "Convert text to Unicode code points and vice versa",
    {
      input: z.string().describe("Text to convert to Unicode or Unicode to convert to text"),
      operation: z.enum(["encode", "decode"]).describe("Operation: encode text to Unicode or decode Unicode to text"),
    },
    async ({ input, operation }) => {
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

  // Emoji search
  server.tool(
    "emoji-search",
    "Search for emojis by name or category",
    {
      query: z.string().describe("Search term for emoji (name, category, or keyword)"),
    },
    async ({ query }) => {
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
