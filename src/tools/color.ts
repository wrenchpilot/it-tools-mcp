import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Color from "color";

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
      r: z.number().min(0).max(255).describe("Red value (0-255)"),
      g: z.number().min(0).max(255).describe("Green value (0-255)"),
      b: z.number().min(0).max(255).describe("Blue value (0-255)"),
    },
    async ({ r, g, b }) => {
      try {
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
