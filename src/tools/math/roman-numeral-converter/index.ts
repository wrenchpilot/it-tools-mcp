import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRomanNumeralConverter(server: McpServer) {
  server.registerTool("roman-numeral-converter", {
  description: "Convert between Arabic numbers and Roman numerals",
  inputSchema: {
      input: z.string().describe("Number to convert (Arabic number 1-3999 or Roman numeral)")
    }
}, async ({ input }) => {
      try {
        // Auto-detect if input is a number or Roman numeral
        const isNumber = /^\d+$/.test(input.trim());

        if (isNumber) {
          // Convert number to Roman numeral
          const num = parseInt(input);
          if (isNaN(num) || num < 1 || num > 3999) {
            throw new Error("Number must be between 1 and 3999");
          }

          const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
          const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

          let result = "";
          let remaining = num;

          for (let i = 0; i < values.length; i++) {
            while (remaining >= values[i]) {
              result += symbols[i];
              remaining -= values[i];
            }
          }

          return {
            content: [
              {
                type: "text",
                text: `${num} = ${result} in Roman numerals`
              }
            ]
          };
        } else {
          // Convert Roman numeral to number
          const roman = input.toUpperCase();
          const romanMap: { [key: string]: number } = {
            I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
          };

          let result = 0;
          let prev = 0;

          for (let i = roman.length - 1; i >= 0; i--) {
            const current = romanMap[roman[i]];
            if (!current) {
              throw new Error(`Invalid Roman numeral character: ${roman[i]}`);
            }

            if (current < prev) {
              result -= current;
            } else {
              result += current;
            }
            prev = current;
          }

          return {
            content: [
              {
                type: "text",
                text: `${roman} = ${result} in decimal`
              }
            ]
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting Roman numeral: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}
