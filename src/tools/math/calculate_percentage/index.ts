import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCalculatePercentage(server: McpServer) {
  server.registerTool("calculate_percentage", {
    description: "Calculate percentages, percentage of a number, or percentage change",

  inputSchema: {
      operation: z.enum(["percentage-of", "what-percentage", "percentage-change"]).describe("Type of percentage calculation"),
      value1: z.number().describe("First value"),
      value2: z.number().describe("Second value")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Calculate Percentage",

      
      readOnlyHint: false
    }
}, async ({ operation, value1, value2 }) => {
      try {
        let result: number;
        let explanation: string;

        switch (operation) {
          case "percentage-of":
            // value1% of value2
            result = (value1 / 100) * value2;
            explanation = `${value1}% of ${value2} = ${result}`;
            break;
          case "what-percentage":
            // value1 is what percentage of value2
            result = (value1 / value2) * 100;
            explanation = `${value1} is ${result.toFixed(2)}% of ${value2}`;
            break;
          case "percentage-change":
            // percentage change from value1 to value2
            result = ((value2 - value1) / value1) * 100;
            explanation = `Percentage change from ${value1} to ${value2} = ${result.toFixed(2)}%`;
            break;
          default:
            throw new Error("Invalid operation");
        }

        return {
          content: [
            {
              type: "text",
              text: explanation
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calculating percentage: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}
