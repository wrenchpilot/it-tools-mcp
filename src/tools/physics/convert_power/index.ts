import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPowerConverter(server: McpServer) {
  server.registerTool("convert_power", {
    description: "Convert between different power units",

  inputSchema: {
      value: z.number().describe("Power value to convert"),
      fromUnit: z.enum([
        "watt", "kilowatt", "megawatt", "horsepower", "metric-horsepower",
        "btu-per-hour", "calorie-per-second", "foot-pound-per-second"
      ]).describe("Source power unit"),
      toUnit: z.enum([
        "watt", "kilowatt", "megawatt", "horsepower", "metric-horsepower",
        "btu-per-hour", "calorie-per-second", "foot-pound-per-second"
      ]).describe("Target power unit")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Power",

      
      readOnlyHint: false
    }
}, async ({ value, fromUnit, toUnit }) => {
      try {
        // Conversion factors to watts
        const toWatts: Record<string, number> = {
          "watt": 1,
          "kilowatt": 1000,
          "megawatt": 1000000,
          "horsepower": 745.7, // Mechanical horsepower
          "metric-horsepower": 735.5,
          "btu-per-hour": 0.293071,
          "calorie-per-second": 4.184,
          "foot-pound-per-second": 1.355818
        };

        // Convert to watts first
        const watts = value * toWatts[fromUnit];
        
        // Convert from watts to target unit
        const result = watts / toWatts[toUnit];

        const units: Record<string, string> = {
          "watt": "W",
          "kilowatt": "kW",
          "megawatt": "MW",
          "horsepower": "hp",
          "metric-horsepower": "PS",
          "btu-per-hour": "BTU/h",
          "calorie-per-second": "cal/s",
          "foot-pound-per-second": "ft·lb/s"
        };

        return {
          content: [{
            type: "text",
            text: `Power Conversion Results:

${value} ${units[fromUnit]} = ${result.toFixed(6)} ${units[toUnit]}

Common Conversions:
• Watts: ${watts.toFixed(3)} W
• Kilowatts: ${(watts / 1000).toFixed(6)} kW
• Horsepower: ${(watts / 745.7).toFixed(6)} hp
• Metric HP: ${(watts / 735.5).toFixed(6)} PS
• BTU/hour: ${(watts / 0.293071).toFixed(3)} BTU/h

Energy Relationships:
• Power × Time = Energy
• 1 kW for 1 hour = 1 kWh = 3.6 MJ
• 1 hp ≈ 746 W (mechanical)
• 1 PS ≈ 736 W (metric)`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting power: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
