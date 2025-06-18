import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDataFormatTools(server: McpServer) {
  // JSON formatting tool
  server.tool(
    "json-format",
    "Format and validate JSON",
    {
      json: z.string().describe("JSON string to format"),
      indent: z.number().min(0).max(10).default(2).describe("Number of spaces for indentation"),
    },
    async ({ json, indent = 2 }) => {
      try {
        const parsed = JSON.parse(json);
        const formatted = JSON.stringify(parsed, null, indent);
        return {
          content: [
            {
              type: "text",
              text: `Formatted JSON:\n${formatted}`,
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

  // JSON to CSV converter
  server.tool(
    "json-to-csv",
    "Convert JSON to CSV format",
    {
      json: z.string().describe("JSON string to convert to CSV"),
      delimiter: z.string().optional().default(",").describe("CSV delimiter"),
    },
    async ({ json, delimiter = "," }) => {
      try {
        const data = JSON.parse(json);
        
        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of objects");
        }
        
        if (data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "CSV: (empty)",
              },
            ],
          };
        }
        
        // Get all unique keys from all objects
        const allKeys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
        
        // Create header row
        const header = allKeys.map(key => {
          const stringValue = String(key);
          if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(delimiter);
        
        // Create data rows
        const rows = data.map(obj => allKeys.map(key => {
          const value = obj[key] ?? '';
          const stringValue = String(value);
          if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(delimiter));
        
        const csv = [header, ...rows].join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: `CSV:
${csv}

Conversion Summary:
Rows: ${data.length}
Columns: ${allKeys.length}
Delimiter: "${delimiter}"`,
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

  // XML formatter tool
  server.tool(
    "xml-format",
    "Format and prettify XML",
    {
      xml: z.string().describe("XML string to format"),
      indent: z.number().default(2).describe("Number of spaces for indentation"),
    },
    async ({ xml, indent = 2 }) => {
      try {
        // Basic XML formatter (simplified implementation)
        let formatted = xml.replace(/></g, '>\n<');
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const indentStr = ' '.repeat(indent);
        
        const result = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          
          if (trimmed.startsWith('</')) {
            indentLevel--;
          }
          
          const indentedLine = indentStr.repeat(Math.max(0, indentLevel)) + trimmed;
          
          if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
            indentLevel++;
          }
          
          return indentedLine;
        }).filter(line => line).join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: `Formatted XML:\n\n${result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting XML: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        // Simple YAML formatter - basic indentation and structure cleanup
        const lines = yaml.split('\n');
        let formatted = '';
        let indentLevel = 0;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          if (trimmed.endsWith(':') && !trimmed.includes(': ')) {
            formatted += '  '.repeat(indentLevel) + trimmed + '\n';
            indentLevel++;
          } else if (trimmed.startsWith('- ')) {
            formatted += '  '.repeat(indentLevel) + trimmed + '\n';
          } else {
            if (trimmed.includes(': ')) {
              formatted += '  '.repeat(indentLevel) + trimmed + '\n';
            } else {
              formatted += '  '.repeat(indentLevel) + trimmed + '\n';
            }
          }
          
          // Decrease indent for certain patterns
          if (trimmed.endsWith(':') && lines[lines.indexOf(line) + 1]?.trim().startsWith('-')) {
            // Don't change indent - list follows
          }
        }
        
        return {
          content: [
            {
              type: "text",
              text: `Formatted YAML:\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting YAML: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        // Basic SQL formatter
        const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
        
        let formatted = sql
          .replace(/\s+/g, ' ')
          .trim();
        
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          formatted = formatted.replace(regex, `\n${keyword.toUpperCase()}`);
        });
        
        formatted = formatted
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: `Formatted SQL:\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting SQL: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    async ({ toml }) => {
      try {
        // Basic TOML parsing (simplified implementation)
        const lines = toml.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const result: any = {};
        let currentSection = result;
        let currentSectionName = '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Section headers [section]
          if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
            currentSectionName = trimmedLine.slice(1, -1);
            result[currentSectionName] = {};
            currentSection = result[currentSectionName];
            continue;
          }
          
          // Key-value pairs
          const equalIndex = trimmedLine.indexOf('=');
          if (equalIndex > 0) {
            const key = trimmedLine.slice(0, equalIndex).trim();
            let value = trimmedLine.slice(equalIndex + 1).trim();
            
            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            
            // Try to parse as number or boolean
            let parsedValue: any = value;
            if (value === 'true') parsedValue = true;
            else if (value === 'false') parsedValue = false;
            else if (!isNaN(Number(value))) parsedValue = Number(value);
            
            currentSection[key] = parsedValue;
          }
        }
        
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
        const data = JSON.parse(json);
        
        function jsonToToml(obj: any, prefix = ''): string {
          let result = '';
          
          for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              if (Object.keys(value).length > 0) {
                result += `\n[${fullKey}]\n`;
                result += jsonToToml(value, '');
              }
            } else {
              result += `${key} = ${formatValue(value)}\n`;
            }
          }
          
          return result;
        }
        
        function formatValue(value: any): string {
          if (typeof value === 'string') {
            return `"${value}"`;
          } else if (Array.isArray(value)) {
            return `[${value.map(formatValue).join(', ')}]`;
          } else {
            return String(value);
          }
        }
        
        const tomlResult = jsonToToml(data);
        
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

  // Markdown to HTML converter
  server.tool(
    "markdown-to-html",
    "Convert Markdown to HTML",
    {
      markdown: z.string().describe("Markdown content to convert to HTML"),
    },
    async ({ markdown }) => {
      try {
        // Basic Markdown to HTML converter (simplified)
        let html = markdown
          // Headers
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          // Bold
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/__(.*?)__/gim, '<strong>$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/_(.*?)_/gim, '<em>$1</em>')
          // Code
          .replace(/`(.*?)`/gim, '<code>$1</code>')
          // Links
          .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
          // Line breaks
          .replace(/\n/gim, '<br>');
        
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

  // HTML to Markdown converter
  server.tool(
    "html-to-markdown",
    "Convert HTML to Markdown",
    {
      html: z.string().describe("HTML content to convert to Markdown"),
    },
    async ({ html }) => {
      try {
        // Basic HTML to Markdown converter (simplified)
        let markdown = html
          // Headers
          .replace(/<h1[^>]*>(.*?)<\/h1>/gim, '# $1')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gim, '## $1')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gim, '### $1')
          .replace(/<h4[^>]*>(.*?)<\/h4>/gim, '#### $1')
          .replace(/<h5[^>]*>(.*?)<\/h5>/gim, '##### $1')
          .replace(/<h6[^>]*>(.*?)<\/h6>/gim, '###### $1')
          // Bold
          .replace(/<strong[^>]*>(.*?)<\/strong>/gim, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gim, '**$1**')
          // Italic
          .replace(/<em[^>]*>(.*?)<\/em>/gim, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gim, '*$1*')
          // Code
          .replace(/<code[^>]*>(.*?)<\/code>/gim, '`$1`')
          // Links
          .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gim, '[$2]($1)')
          // Line breaks
          .replace(/<br[^>]*>/gim, '\n')
          // Remove remaining HTML tags
          .replace(/<[^>]*>/gim, '');
        
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
