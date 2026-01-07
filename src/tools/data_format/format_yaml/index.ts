import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFormatYaml(server: McpServer) {
  server.registerTool("format_yaml", {
    description: "Format and prettify YAML",

  inputSchema: {
      yaml: z.string().describe("YAML string to format"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Yaml",

      
      readOnlyHint: false
    }
}, async ({ yaml }) => {
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
}
