import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFormatXml(server: McpServer) {
  server.registerTool("format_xml", {
  description: "Format and prettify XML",
  inputSchema: {
      xml: z.string().describe("XML string to format"),
      indent: z.number().describe("Number of spaces for indentation").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Xml",
      description: "Format and prettify XML",
      readOnlyHint: false
    }
}, async ({ xml, indent = 2 }) => {
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
}
