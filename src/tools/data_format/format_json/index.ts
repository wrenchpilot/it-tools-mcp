import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFormatJson(server: McpServer) {
  server.registerTool("format_json", {
    description: 'Format and prettify JSON with proper indentation. Example: {"a":1,"b":2} → formatted JSON with customizable spacing',
    inputSchema: {
      json: z.string().describe("JSON string to format"),
      indent: z.number().describe("Number of spaces for indentation").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format JSON",
      description: "Format and prettify JSON with proper indentation and customizable spacing",
      readOnlyHint: false
    }
  }, async ({ json, indent = 2 }) => {
      try {
        if (indent < 0 || indent > 10) {
          return {
            content: [
              {
                type: "text",
                text: "Indent must be between 0 and 10.",
              },
            ],
          };
        }

        // Try to normalize JavaScript-style object notation to valid JSON
        let normalizedJson = json.trim();
        
        // Handle single quotes by converting to double quotes
        // This is a simplified approach that works for most common cases
        try {
          // First try parsing as-is
          const parsed = JSON.parse(normalizedJson);
          const formatted = JSON.stringify(parsed, null, indent);
          return {
            content: [
              {
                type: "text",
                text: `Formatted JSON:\n${formatted}`,
              },
            ],
          };
        } catch (firstError) {
          // If parsing fails, try to normalize the format
          try {
            // Convert single quotes to double quotes for property names and string values
            // This handles simple cases like {'name':'John','age':30}
            normalizedJson = normalizedJson
              .replace(/'/g, '"')  // Replace single quotes with double quotes
              .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'); // Quote unquoted property names
            
            const parsed = JSON.parse(normalizedJson);
            const formatted = JSON.stringify(parsed, null, indent);
            return {
              content: [
                {
                  type: "text",
                  text: `Formatted JSON (normalized from JavaScript object notation):\n${formatted}`,
                },
              ],
            };
          } catch (secondError) {
            // If normalization fails, try using Function constructor for JavaScript object literals
            try {
              const evaluated = new Function('return ' + json)();
              const formatted = JSON.stringify(evaluated, null, indent);
              return {
                content: [
                  {
                    type: "text",
                    text: `Formatted JSON (converted from JavaScript object):\n${formatted}`,
                  },
                ],
              };
            } catch (evalError) {
              return {
                content: [
                  {
                    type: "text",
                    text: `Error parsing JSON: ${firstError instanceof Error ? firstError.message : 'Unknown error'}

Tried to normalize JavaScript object notation but failed.
Please ensure your input is valid JSON or JavaScript object notation.

Examples of supported formats:
- Valid JSON: {"name":"John","age":30}
- JavaScript object: {'name':'John','age':30}
- Unquoted keys: {name:'John',age:30}`,
                  },
                ],
              };
            }
          }
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error formatting JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
