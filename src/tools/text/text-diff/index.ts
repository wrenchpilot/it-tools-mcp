import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextDiff(server: McpServer) {
  server.registerTool("text-diff", {
  description: "Compare two texts and show differences",
  inputSchema: {
      text1: z.string().describe("First text to compare"),
      text2: z.string().describe("Second text to compare"),
    }
}, async ({ text1, text2 }) => {
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
}
