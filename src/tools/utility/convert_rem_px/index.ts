import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRemPxConverter(server: McpServer) {
  server.registerTool("convert_rem_px", {

    inputSchema: {
      value: z.number().min(0).describe("Value to convert (e.g., 1.5 for 1.5rem or 24 for 24px)"),
      fromUnit: z.enum(["rem", "px"]).describe("Source unit - either 'rem' or 'px'"),
      rootFontSize: z.number().min(1).max(100).default(16).describe("Root font size in pixels (default: 16px - standard browser default)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Rem Px",

      readOnlyHint: false
    }
  }, async ({ value, fromUnit, rootFontSize = 16 }) => {
      try {
        let result: number;
        let explanation: string;

        if (fromUnit === "rem") {
          result = value * rootFontSize;
          explanation = `${value} rem × ${rootFontSize}px (root font size) = ${result}px`;
        } else {
          result = value / rootFontSize;
          explanation = `${value}px ÷ ${rootFontSize}px (root font size) = ${result} rem`;
        }

        const targetUnit = fromUnit === "rem" ? "px" : "rem";

        // Calculate common breakpoint equivalents
        const commonRootSizes = [14, 16, 18, 20];
        const equivalents = commonRootSizes.map(size => {
          if (fromUnit === "rem") {
            return `${size}px root: ${value} rem = ${value * size}px`;
          } else {
            return `${size}px root: ${value}px = ${(value / size).toFixed(4)} rem`;
          }
        });

        return {
          content: [{
            type: "text",
            text: `REM/PX Conversion Results:

${value} ${fromUnit} = ${result} ${targetUnit}

Calculation: ${explanation}

Equivalents at different root font sizes:
${equivalents.join('\n')}

CSS Usage:
• font-size: ${fromUnit === "rem" ? result + "px" : result.toFixed(4) + "rem"};
• margin: ${fromUnit === "rem" ? result + "px" : result.toFixed(4) + "rem"};
• padding: ${fromUnit === "rem" ? result + "px" : result.toFixed(4) + "rem"};

Notes:
• REM units are relative to the root element's font size
• Default browser font size is typically 16px
• Using REM provides better accessibility and scalability`
            }]
          };
      } catch (error) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error converting REM/PX: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
