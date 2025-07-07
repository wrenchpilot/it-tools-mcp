import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTemperatureConverter(server: McpServer) {
  server.tool(
    "temperature-converter",
    "Convert temperatures between Celsius, Fahrenheit, and Kelvin",
    {
      temperature: z.number().describe("Temperature value to convert"),
      from: z.enum(["celsius", "fahrenheit", "kelvin"]).describe("Source temperature unit"),
      to: z.enum(["celsius", "fahrenheit", "kelvin"]).describe("Target temperature unit")
    },
    async ({ temperature, from, to }) => {
      try {
        // Convert to Celsius first
        let celsius: number;
        switch (from) {
          case "celsius":
            celsius = temperature;
            break;
          case "fahrenheit":
            celsius = (temperature - 32) * 5 / 9;
            break;
          case "kelvin":
            celsius = temperature - 273.15;
            break;
          default:
            throw new Error("Invalid source unit");
        }

        // Convert from Celsius to target unit
        let result: number;
        switch (to) {
          case "celsius":
            result = celsius;
            break;
          case "fahrenheit":
            result = celsius * 9 / 5 + 32;
            break;
          case "kelvin":
            result = celsius + 273.15;
            break;
          default:
            throw new Error("Invalid target unit");
        }

        return {
          content: [
            {
              type: "text",
              text: `${temperature}° ${from} = ${result.toFixed(2)}° ${to}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting temperature: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}
