import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGenerateMarkdownToc(server: McpServer) {
  server.registerTool("generate_markdown_toc", {
  description: "Generate a table of contents from Markdown headers",
  inputSchema: {
      markdown: z.string().describe("Markdown content to generate TOC from"),
      maxLevel: z.number().optional().default(6).describe("Maximum header level to include (1-6)"),
      generateAnchors: z.boolean().optional().default(true).describe("Whether to generate anchor links")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Markdown Toc",
      description: "Generate a table of contents from Markdown headers",
      readOnlyHint: false
    }
}, async ({ markdown, maxLevel, generateAnchors }) => {
      // Extract headers from markdown
      const headerRegex = /^(#{1,6})\s+(.+)$/gm;
      const headers: Array<{ level: number; text: string; anchor: string }> = [];
      
      let match;
      while ((match = headerRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        if (level <= maxLevel) {
          const text = match[2].trim();
          // Generate anchor from text
          const anchor = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          headers.push({ level, text, anchor });
        }
      }

      if (headers.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No headers found in the markdown content."
          }]
        };
      }

      // Generate TOC
      const tocLines: string[] = [];
      headers.forEach(header => {
        const indent = '  '.repeat(header.level - 1);
        const link = generateAnchors ? `[${header.text}](#${header.anchor})` : header.text;
        tocLines.push(`${indent}- ${link}`);
      });

      const toc = tocLines.join('\n');

      return {
        content: [{
          type: "text",
          text: `Table of Contents:

${toc}

${generateAnchors ? '\nAnchors have been generated based on header text.' : ''}`
        }]
      };
    }
  );
}
