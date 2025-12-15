import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertNumberBase(server: McpServer) {
  server.registerTool("convert_number_base", {

  inputSchema: {
      number: z.string().describe("Number to convert"),
      fromBase: z.number().describe("Source base (2-36)"),
      toBase: z.number().describe("Target base (2-36)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Number Base",

      readOnlyHint: false
    }
}, async ({ number, fromBase, toBase }) => {
      try {
        if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
          return {
            content: [
              {
                type: "text",
                text: "Base must be between 2 and 36.",
              },
            ],
          };
        }
        // Parse number from source base to decimal
        const decimal = parseInt(number, fromBase);

        if (isNaN(decimal)) {
          throw new Error("Invalid number for the specified base");
        }

        // Convert decimal to target base
        const result = decimal.toString(toBase);

        return {
          content: [
            {
              type: "text",
              text: `${number} (base ${fromBase}) = ${result} (base ${toBase})\nDecimal equivalent: ${decimal}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting number: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}
