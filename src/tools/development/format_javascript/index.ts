import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrettifyJavascript(server: McpServer) {
  server.registerTool("format_javascript", {
  description: "Format and beautify JavaScript/CSS code",
  inputSchema: {
      code: z.string().describe("JavaScript or CSS code to prettify"),
      type: z.enum(["javascript", "css"]).describe("Type of code to format"),
      indentSize: z.number().optional().default(2).describe("Number of spaces for indentation")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Javascript",
      description: "Format and beautify JavaScript/CSS code",
      readOnlyHint: false
    }
}, async ({ code, type, indentSize }) => {
      try {
        let formatted = code;
        const indent = ' '.repeat(indentSize);
        
        if (type === "javascript") {
          // Basic JS formatting
          formatted = formatted
            .replace(/\s*{\s*/g, ' {\n')
            .replace(/\s*}\s*/g, '\n}\n')
            .replace(/;\s*/g, ';\n')
            .replace(/,\s*/g, ', ')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index, lines) => {
              let indentLevel = 0;
              for (let i = 0; i < index; i++) {
                if (lines[i].includes('{')) indentLevel++;
                if (lines[i].includes('}')) indentLevel--;
              }
              if (line.includes('}')) indentLevel--;
              return indent.repeat(Math.max(0, indentLevel)) + line;
            })
            .join('\n');
        } else if (type === "css") {
          // Basic CSS formatting
          formatted = formatted
            .replace(/\s*{\s*/g, ' {\n')
            .replace(/\s*}\s*/g, '\n}\n')
            .replace(/;\s*/g, ';\n')
            .replace(/:\s*/g, ': ')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index, lines) => {
              if (line.includes('}')) return line;
              if (line.includes('{')) return line;
              return indent + line;
            })
            .join('\n');
        }

        return {
          content: [{
            type: "text",
            text: `Prettified ${type.toUpperCase()}:

\`\`\`${type}
${formatted}
\`\`\``
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error formatting ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
