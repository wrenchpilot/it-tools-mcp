import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHtmlToMarkdown(server: McpServer) {
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
}
