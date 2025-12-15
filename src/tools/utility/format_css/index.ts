import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCssPrettifier(server: McpServer) {
  server.registerTool("format_css", {

  inputSchema: {
      css: z.string().describe("CSS code to format"),
      indentSize: z.number().optional().describe("Number of spaces for indentation (default: 2)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Css",

      readOnlyHint: false
    }
}, async ({ css, indentSize = 2 }) => {
      try {
        // Basic CSS prettifier implementation
        let formatted = css
          // Remove extra whitespace
          .replace(/\s+/g, ' ')
          .trim()
          // Add newlines and indentation
          .replace(/\{/g, ' {\n' + ' '.repeat(indentSize))
          .replace(/\}/g, '\n}\n')
          .replace(/;/g, ';\n' + ' '.repeat(indentSize))
          .replace(/,/g, ',\n')
          // Clean up extra newlines
          .replace(/\n\s*\n/g, '\n')
          .replace(/\n\s*\}/g, '\n}')
          // Fix selectors
          .replace(/\n([^{]+)\{/g, '\n\n$1 {')
          .trim();

        // Add some basic formatting rules
        formatted = formatted
          .replace(/:\s*/g, ': ')
          .replace(/,\s*/g, ', ')
          .replace(/\s*{\s*/g, ' {\n' + ' '.repeat(indentSize))
          .replace(/;\s*}/g, ';\n}');

        // Count some metrics
        const selectors = (css.match(/[^{}]+(?=\s*\{)/g) || []).length;
        const properties = (css.match(/[^{}:;]+\s*:\s*[^{}:;]+/g) || []).length;
        const lines = formatted.split('\n').length;
        const originalLines = css.split('\n').length;

        return {
          content: [{
            type: "text",
            text: `CSS Prettifier Results:

Original CSS (${css.length} characters, ${originalLines} lines):
${css}

Formatted CSS (${formatted.length} characters, ${lines} lines):
${formatted}

Statistics:
• Selectors: ${selectors}
• Properties: ${properties}
• Size change: ${css.length} → ${formatted.length} characters
• Lines: ${originalLines} → ${lines}
• Indentation: ${indentSize} spaces

Formatting Applied:
• Proper indentation and spacing
• Consistent selector formatting
• Property alignment
• Clean line breaks`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error prettifying CSS: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
