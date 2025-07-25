import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertMarkdownHtml(server: McpServer) {
  server.registerTool("convert_markdown_to_html", {
  description: "Convert Markdown to HTML",
  inputSchema: {
      markdown: z.string().describe("Markdown content to convert to HTML"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Markdown To Html",
      description: "Convert Markdown to HTML",
      readOnlyHint: false
    }
}, async ({ markdown }) => {
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
}
