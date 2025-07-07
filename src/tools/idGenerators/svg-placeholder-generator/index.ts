import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSvgPlaceholderGenerator(server: McpServer) {
  server.tool(
    "svg-placeholder-generator",
    "Generate SVG placeholder images",
    {
      width: z.number().describe("Width in pixels").optional(),
      height: z.number().describe("Height in pixels").optional(),
      backgroundColor: z.string().describe("Background color (hex)").optional(),
      textColor: z.string().describe("Text color (hex)").optional(),
      text: z.string().optional().describe("Custom text (default: dimensions)"),
    },
    async ({ width = 300, height = 200, backgroundColor = "#cccccc", textColor = "#666666", text }) => {
      try {
        if (width < 1 || width > 2000 || height < 1 || height > 2000) {
          return {
            content: [
              {
                type: "text",
                text: "Width and height must be between 1 and 2000 pixels.",
              },
            ],
          };
        }
        const displayText = text || `${width}×${height}`;
        const fontSize = Math.min(width, height) / 8;

        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dy=".3em">${displayText}</text>
</svg>`;

        const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

        return {
          content: [
            {
              type: "text",
              text: `SVG Placeholder Generated:

Dimensions: ${width}×${height}
Background: ${backgroundColor}
Text Color: ${textColor}
Text: ${displayText}

SVG Code:
${svg}

Data URL:
${dataUrl}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating SVG placeholder: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
