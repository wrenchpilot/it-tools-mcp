import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Color from "color";
import { z } from "zod";

export function registerColorRgbToHex(server: McpServer) {
  server.registerTool("color-rgb-to-hex", {
  description: "Convert RGB color to HEX",
  inputSchema: {
      r: z.number().describe("Red value (0-255)"),
      g: z.number().describe("Green value (0-255)"),
      b: z.number().describe("Blue value (0-255)"),
    }
}, async ({ r, g, b }) => {
      try {
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
          return {
            content: [
              {
                type: "text",
                text: "RGB values must be between 0 and 255.",
              },
            ],
          };
        }
        const hex = Color({ r, g, b }).hex().toUpperCase();
        return {
          content: [
            {
              type: "text",
              text: `RGB(${r}, ${g}, ${b}) = ${hex}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting RGB to HEX: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
