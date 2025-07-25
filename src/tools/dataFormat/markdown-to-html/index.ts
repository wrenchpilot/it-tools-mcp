import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMarkdownToHtml(server: McpServer) {
  server.registerTool("markdown-to-html", {
  description: "Convert Markdown to HTML",
  inputSchema: {
      markdown: z.string().describe("Markdown content to convert to HTML"),
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
