import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDataFormatTools(server: McpServer) {
  // JSON formatting tool
  server.tool(
    "json-format",
    "Format and validate JSON",
    {
      json: z.string().describe("JSON string to format"),
      indent: z.number().describe("Number of spaces for indentation").optional(),
    },
    async ({ json, indent = 2 }) => {
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

  // JSON minify tool
  server.tool(
    "json-minify",
    "Minify JSON by removing whitespace",
    {
      json: z.string().describe("JSON string to minify"),
    },
    async ({ json }) => {
      try {
        const parsed = JSON.parse(json);
        const minified = JSON.stringify(parsed);
        return {
          content: [
            {
              type: "text",
              text: `Minified JSON: ${minified}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // CSV converter (using papaparse)
  server.tool(
    "json-to-csv",
    "Convert JSON to CSV format",
    {
      json: z.string().describe("JSON string to convert to CSV"),
      delimiter: z.string().describe("CSV delimiter").optional(),
    },
    async ({ json, delimiter = "," }) => {
      try {
        const Papa = (await import("papaparse")).default;
        const data = JSON.parse(json);
        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of objects");
        }
        const csv = Papa.unparse(data, { delimiter });
        return {
          content: [
            {
              type: "text",
              text: `CSV:\n${csv}\n\nConversion Summary:\nRows: ${data.length}\nDelimiter: \"${delimiter}\"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting JSON to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // YAML formatter tool
  server.tool(
    "yaml-format",
    "Format and prettify YAML",
    {
      yaml: z.string().describe("YAML string to format"),
    },
    async ({ yaml }) => {
      try {
        const YAML = await import("js-yaml");
        // Parse YAML to validate and then dump with proper formatting
        const parsed = YAML.load(yaml);

        // Format with proper indentation and options
        const formatted = YAML.dump(parsed, {
          indent: 2,
          lineWidth: 80,
          noRefs: false,
          noCompatMode: false,
          condenseFlow: false,
          quotingType: '"',
          forceQuotes: false,
          sortKeys: false,
          skipInvalid: false,
        });

        // Count lines and detect any issues
        const inputLines = yaml.split('\n').length;
        const outputLines = formatted.split('\n').length;

        return {
          content: [
            {
              type: "text",
              text: `Formatted YAML:

${formatted.trim()}

✅ YAML is valid and properly formatted
📊 Input: ${inputLines} lines → Output: ${outputLines} lines
🎯 Features: 2-space indentation, proper line width, preserved structure`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting YAML: ${error instanceof Error ? error.message : 'Unknown error'}

💡 Common YAML issues:
• Check indentation (use spaces, not tabs)
• Ensure proper key-value syntax (key: value)
• Validate string quoting
• Check list formatting (- item)
• Verify nested structure alignment`,
            },
          ],
        };
      }
    }
  );

  // XML formatter tool
  server.tool(
    "xml-format",
    "Format and prettify XML",
    {
      xml: z.string().describe("XML string to format"),
      indent: z.number().describe("Number of spaces for indentation").optional(),
    },
    async ({ xml, indent = 2 }) => {
      try {
        const formatXML = (await import("xml-formatter")).default;
        const formatted = formatXML(xml, {
          indentation: ' '.repeat(indent),
          collapseContent: true,
        });

        return {
          content: [
            {
              type: "text",
              text: `Formatted XML:

${formatted}

✅ XML formatted successfully
🎯 Features: ${indent}-space indentation, collapsed content, clean structure`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting XML: ${error instanceof Error ? error.message : 'Unknown error'}

💡 Common XML issues:
• Check that all tags are properly closed
• Ensure proper nesting of elements
• Validate attribute syntax (key="value")
• Check for special character encoding`,
            },
          ],
        };
      }
    }
  );

  // SQL formatter tool
  server.tool(
    "sql-format",
    "Format and prettify SQL queries",
    {
      sql: z.string().describe("SQL query to format"),
    },
    async ({ sql }) => {
      try {
        const { format: formatSQL } = await import("sql-formatter");
        const formatted = formatSQL(sql, {
          language: "sql"
        });

        return {
          content: [
            {
              type: "text",
              text: `Formatted SQL:

${formatted}

✅ SQL formatted successfully
🎯 Features: uppercase keywords, proper indentation, clean structure`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting SQL: ${error instanceof Error ? error.message : 'Unknown error'}

💡 Common SQL issues:
• Check syntax for missing semicolons
• Ensure proper table and column names
• Validate string quoting (single quotes for strings)
• Check for balanced parentheses in subqueries`,
            },
          ],
        };
      }
    }
  );

  // TOML to JSON converter
  server.tool(
    "toml-to-json",
    "Convert TOML to JSON format",
    {
      toml: z.string().describe("TOML string to convert"),
    },
    async ({ toml: tomlString }) => {
      try {
        const toml = await import("@iarna/toml");
        const result = toml.parse(tomlString);
        return {
          content: [
            {
              type: "text",
              text: `JSON result:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting TOML to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // JSON to TOML converter
  server.tool(
    "json-to-toml",
    "Convert JSON to TOML format",
    {
      json: z.string().describe("JSON string to convert"),
    },
    async ({ json }) => {
      try {
        const toml = await import("@iarna/toml");
        const data = JSON.parse(json);
        const tomlResult = toml.stringify(data);
        return {
          content: [
            {
              type: "text",
              text: `TOML result:\n${tomlResult}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting JSON to TOML: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Markdown to HTML converter (using marked library)
  server.tool(
    "markdown-to-html",
    "Convert Markdown to HTML",
    {
      markdown: z.string().describe("Markdown content to convert to HTML"),
    },
    async ({ markdown }) => {
      try {
        const { marked } = await import("marked");
        const html = marked(markdown, {
          breaks: true,
          gfm: true
        });

        return {
          content: [
            {
              type: "text",
              text: `HTML result:\n${html}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting Markdown to HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // HTML to Markdown converter (using turndown library)
  server.tool(
    "html-to-markdown",
    "Convert HTML to Markdown",
    {
      html: z.string().describe("HTML content to convert to Markdown"),
    },
    async ({ html }) => {
      try {
        const TurndownService = (await import("turndown")).default;
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          emDelimiter: '*',
        });
        const markdown = turndownService.turndown(html);

        return {
          content: [
            {
              type: "text",
              text: `Markdown result:\n${markdown}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting HTML to Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // JSON diff tool
  server.tool(
    "json-diff",
    "Compare two JSON objects and show differences",
    {
      json1: z.string().describe("First JSON object"),
      json2: z.string().describe("Second JSON object"),
    },
    async ({ json1, json2 }) => {
      try {
        const obj1 = JSON.parse(json1);
        const obj2 = JSON.parse(json2);

        function deepCompare(a: any, b: any, path = ""): string[] {
          const differences: string[] = [];

          if (typeof a !== typeof b) {
            differences.push(`${path}: Type difference - ${typeof a} vs ${typeof b}`);
            return differences;
          }

          if (a === null || b === null) {
            if (a !== b) {
              differences.push(`${path}: ${a} vs ${b}`);
            }
            return differences;
          }

          if (typeof a === 'object' && !Array.isArray(a)) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            const allKeys = new Set([...keysA, ...keysB]);

            for (const key of allKeys) {
              const newPath = path ? `${path}.${key}` : key;
              if (!(key in a)) {
                differences.push(`${newPath}: Missing in first object`);
              } else if (!(key in b)) {
                differences.push(`${newPath}: Missing in second object`);
              } else {
                differences.push(...deepCompare(a[key], b[key], newPath));
              }
            }
          } else if (Array.isArray(a) && Array.isArray(b)) {
            const maxLength = Math.max(a.length, b.length);
            for (let i = 0; i < maxLength; i++) {
              const newPath = `${path}[${i}]`;
              if (i >= a.length) {
                differences.push(`${newPath}: Missing in first array`);
              } else if (i >= b.length) {
                differences.push(`${newPath}: Missing in second array`);
              } else {
                differences.push(...deepCompare(a[i], b[i], newPath));
              }
            }
          } else if (a !== b) {
            differences.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
          }

          return differences;
        }

        const differences = deepCompare(obj1, obj2);

        if (differences.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "✅ JSON objects are identical - no differences found.",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `❌ Found ${differences.length} difference(s):

${differences.map((diff, i) => `${i + 1}. ${diff}`).join('\n')}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error comparing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
