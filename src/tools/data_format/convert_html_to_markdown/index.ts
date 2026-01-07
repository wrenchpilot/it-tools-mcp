import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertHtmlMarkdown(server: McpServer) {
  server.registerTool("convert_html_to_markdown", {
    description: "Convert HTML to Markdown",

  inputSchema: {
      html: z.string().describe("HTML content to convert to Markdown"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Html To Markdown",

      
      readOnlyHint: false
    }
}, async ({ html }) => {
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
