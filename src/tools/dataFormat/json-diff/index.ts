import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerJsonDiff(server: McpServer) {
  server.registerTool("json-diff", {
  description: "Compare two JSON objects and show differences",
  inputSchema: {
      json1: z.string().describe("First JSON object"),
      json2: z.string().describe("Second JSON object"),
    }
}, async ({ json1, json2 }) => {
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
