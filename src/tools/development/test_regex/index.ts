import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTestRegex(server: McpServer) {
  server.registerTool("test_regex", {
    description: "Test regular expressions against text",

  inputSchema: {
      pattern: z.string().describe("Regular expression pattern"),
      text: z.string().describe("Text to test against the regex"),
      flags: z.string().optional().describe("Regex flags (g, i, m, s, u, y)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Test Regex",

      
      readOnlyHint: false
    }
}, async ({ pattern, text, flags }) => {
      try {
        const regex = new RegExp(pattern, flags);
        const matches = text.match(regex);
        const globalMatches = flags?.includes('g') ? [...text.matchAll(new RegExp(pattern, flags))] : null;
        const isMatch = regex.test(text);

        let result = `Regex Test Results:

Pattern: ${pattern}
Flags: ${flags || 'none'}
Text: ${text}

Match: ${isMatch ? '✅ Yes' : '❌ No'}`;

        if (matches) {
          result += `\n\nFirst Match: ${matches[0]}`;
          if (matches.length > 1) {
            result += `\nCapture Groups: ${matches.slice(1).join(', ')}`;
          }
        }

        if (globalMatches && globalMatches.length > 0) {
          result += `\n\nAll Matches (${globalMatches.length}):`;
          globalMatches.forEach((match, index) => {
            result += `\n${index + 1}. "${match[0]}" at position ${match.index}`;
            if (match.length > 1) {
              result += ` (groups: ${match.slice(1).join(', ')})`;
            }
          });
        }

        result += `\n\nCommon Regex Patterns:
• Email: ^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$
• Phone: ^\\+?[1-9]\\d{1,14}$
• URL: ^https?:\\/\\/.+
• IPv4: ^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$
• Date (YYYY-MM-DD): ^\\d{4}-\\d{2}-\\d{2}$`;

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error testing regex: ${error instanceof Error ? error.message : 'Unknown error'}

Common regex flags:
• g - Global (find all matches)
• i - Case insensitive
• m - Multiline
• s - Dot matches newline
• u - Unicode
• y - Sticky`,
            },
          ],
        };
      }
    }
  );
}
