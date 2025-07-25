import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerAngleConverter(server: McpServer) {
  server.registerTool("convert_angle", {
  description: "Convert between different angle units",
  inputSchema: {
      value: z.number().describe("Angle value to convert"),
      fromUnit: z.enum([
        "degree", "radian", "gradian", "turn", "arcminute", "arcsecond"
      ]).describe("Source angle unit"),
      toUnit: z.enum([
        "degree", "radian", "gradian", "turn", "arcminute", "arcsecond"
      ]).describe("Target angle unit")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Angle",
      description: "Convert between different angle units",
      readOnlyHint: false
    }
}, async ({ value, fromUnit, toUnit }) => {
      try {
        // Conversion factors to degrees
        const toDegrees: Record<string, number> = {
          "degree": 1,
          "radian": 180 / Math.PI,
          "gradian": 0.9, // 1 gradian = 0.9 degrees
          "turn": 360,     // 1 turn = 360 degrees
          "arcminute": 1/60, // 1 arcminute = 1/60 degree
          "arcsecond": 1/3600 // 1 arcsecond = 1/3600 degree
        };

        // Convert to degrees first
        const degrees = value * toDegrees[fromUnit];
        
        // Convert from degrees to target unit
        const result = degrees / toDegrees[toUnit];

        const units: Record<string, string> = {
          "degree": "°",
          "radian": "rad",
          "gradian": "gon",
          "turn": "tr",
          "arcminute": "'",
          "arcsecond": "\""
        };

        // Additional conversions for context
        const inDegrees = degrees;
        const inRadians = degrees * Math.PI / 180;
        const inGradians = degrees / 0.9;

        return {
          content: [{
            type: "text",
            text: `Angle Conversion Results:

${value} ${units[fromUnit]} = ${result} ${units[toUnit]}

All Conversions:
• Degrees: ${inDegrees.toFixed(6)}°
• Radians: ${inRadians.toFixed(6)} rad
• Gradians: ${inGradians.toFixed(6)} gon
• Turns: ${(inDegrees / 360).toFixed(6)} tr
• Arcminutes: ${(inDegrees * 60).toFixed(2)}'
• Arcseconds: ${(inDegrees * 3600).toFixed(2)}"

Trigonometric Values:
• sin: ${Math.sin(inRadians).toFixed(6)}
• cos: ${Math.cos(inRadians).toFixed(6)}
• tan: ${Math.tan(inRadians).toFixed(6)}

Reference:
• π rad = 180° = 200 gon = 0.5 tr
• 1° = 60' = 3600"`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting angle: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
