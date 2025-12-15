import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrettifyHtml(server: McpServer) {
  server.registerTool("format_html", {

  inputSchema: {
      html: z.string().describe("HTML code to prettify"),
      indentSize: z.number().optional().default(2).describe("Number of spaces for indentation")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Html",

      readOnlyHint: false
    }
}, async ({ html, indentSize }) => {
      try {
        // Simple HTML prettifier
        let formatted = html;
        let indentLevel = 0;
        const indent = ' '.repeat(indentSize);
        
        // Remove extra whitespace
        formatted = formatted.replace(/>\s*</g, '><');
        
        // Add line breaks and indentation
        formatted = formatted.replace(/(<\/?[^>]+>)/g, (match) => {
          if (match.startsWith('</') && !match.includes('/>')) {
            indentLevel--;
          }
          
          const result = '\n' + indent.repeat(indentLevel) + match;
          
          if (!match.startsWith('</') && !match.includes('/>') && !match.includes('<input') && !match.includes('<img') && !match.includes('<br') && !match.includes('<hr')) {
            indentLevel++;
          }
          
          return result;
        });

        // Clean up
        formatted = formatted.trim();

        return {
          content: [{
            type: "text",
            text: `Prettified HTML:

\`\`\`html
${formatted}
\`\`\``
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error formatting HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
