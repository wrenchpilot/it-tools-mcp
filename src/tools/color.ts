import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Color from "color";
import { z } from "zod";

export function registerColorTools(server: McpServer) {
  // Color conversion tools
  server.tool(
    "color-hex-to-rgb",
    "Convert HEX color to RGB",
    {
      hex: z.string().describe("HEX color code (e.g., #FF5733 or FF5733)"),
    },
    async ({ hex }) => {
      try {
        const rgb = Color(hex).rgb().array();
        return {
          content: [
            {
              type: "text",
              text: `${hex} = RGB(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting HEX to RGB: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "color-rgb-to-hex",
    "Convert RGB color to HEX",
    {
      r: z.number().describe("Red value (0-255)"),
      g: z.number().describe("Green value (0-255)"),
      b: z.number().describe("Blue value (0-255)"),
    },
    async ({ r, g, b }) => {
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
