import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEnergyConverter(server: McpServer) {
  server.tool(
    "energy-converter",
    "Convert between different energy units",
    {
      value: z.number().describe("Energy value to convert"),
      fromUnit: z.enum([
        "joule", "kilojoule", "calorie", "kilocalorie", "btu", 
        "watt-hour", "kilowatt-hour", "electronvolt", "foot-pound"
      ]).describe("Source energy unit"),
      toUnit: z.enum([
        "joule", "kilojoule", "calorie", "kilocalorie", "btu", 
        "watt-hour", "kilowatt-hour", "electronvolt", "foot-pound"
      ]).describe("Target energy unit")
    },
    async ({ value, fromUnit, toUnit }) => {
      try {
        // Conversion factors to joules
        const toJoules: Record<string, number> = {
          "joule": 1,
          "kilojoule": 1000,
          "calorie": 4.184,
          "kilocalorie": 4184,
          "btu": 1055.06,
          "watt-hour": 3600,
          "kilowatt-hour": 3600000,
          "electronvolt": 1.602176634e-19,
          "foot-pound": 1.355818
        };

        // Convert to joules first
        const joules = value * toJoules[fromUnit];
        
        // Convert from joules to target unit
        const result = joules / toJoules[toUnit];

        const units: Record<string, string> = {
          "joule": "J",
          "kilojoule": "kJ",
          "calorie": "cal",
          "kilocalorie": "kcal",
          "btu": "BTU",
          "watt-hour": "Wh",
          "kilowatt-hour": "kWh",
          "electronvolt": "eV",
          "foot-pound": "ft·lb"
        };

        return {
          content: [{
            type: "text",
            text: `Energy Conversion Results:

${value} ${units[fromUnit]} = ${result.toExponential(6)} ${units[toUnit]}

Formatted Results:
• Scientific: ${result.toExponential(6)} ${units[toUnit]}
• Fixed: ${result.toFixed(6)} ${units[toUnit]}
• Compact: ${result.toPrecision(6)} ${units[toUnit]}

Intermediate (Joules): ${joules.toExponential(6)} J

Common Energy Equivalents:
• 1 kWh = 3.6 MJ = 860 kcal
• 1 BTU = 1055 J = 252 cal
• 1 eV = 1.602 × 10⁻¹⁹ J`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting energy: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
