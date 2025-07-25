import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextToUnicodeNames(server: McpServer) {
  server.registerTool("show_unicode_names", {
  description: "Convert text to Unicode character names",
  inputSchema: {
      text: z.string().describe("Text to convert to Unicode names")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Show Unicode Names",
      description: "Convert text to Unicode character names",
      readOnlyHint: true
    }
}, async ({ text }) => {
      const unicodeNames = [...text].map(char => {
        const codePoint = char.codePointAt(0);
        if (!codePoint) return char;
        
        const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
        
        // Basic Unicode character name mapping for common characters
        const basicNames: Record<number, string> = {
          32: 'SPACE',
          33: 'EXCLAMATION MARK',
          63: 'QUESTION MARK',
          64: 'COMMERCIAL AT',
          65: 'LATIN CAPITAL LETTER A',
          66: 'LATIN CAPITAL LETTER B',
          97: 'LATIN SMALL LETTER A',
          98: 'LATIN SMALL LETTER B',
          // Add more as needed
        };
        
        const name = basicNames[codePoint] || 'UNKNOWN CHARACTER';
        return `${char} (U+${hex}: ${name})`;
      }).join('\n');

      return {
        content: [{
          type: "text",
          text: `Unicode Character Names:
${unicodeNames}`
        }]
      };
    }
  );
}
