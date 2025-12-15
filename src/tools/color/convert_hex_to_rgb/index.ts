import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Color from "color";
import { z } from "zod";

export function registerConvertHexRgb(server: McpServer) {
  server.registerTool("convert_hex_to_rgb", {

  inputSchema: {
      hex: z.string().describe("HEX color code (e.g., #FF5733 or FF5733)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Hex To Rgb",

      readOnlyHint: false
    }
}, async ({ hex }) => {
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
}
