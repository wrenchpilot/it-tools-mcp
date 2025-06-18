import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
        // Remove # if present
        const cleanHex = hex.replace('#', '');
        
        if (cleanHex.length !== 6) {
          throw new Error("Invalid HEX color format. Please use 6 characters (e.g., FF5733)");
        }
        
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        
        return {
          content: [
            {
              type: "text",
              text: `${hex} = RGB(${r}, ${g}, ${b})`,
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
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      return {
        content: [
          {
            type: "text",
            text: `RGB(${r}, ${g}, ${b}) = ${hex}`,
          },
        ],
      };
    }
  );
}
