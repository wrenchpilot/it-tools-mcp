import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMathTools(server: McpServer) {
  // Math expression evaluator
  server.tool(
    "math-evaluate",
    "Safely evaluate mathematical expressions",
    {
      expression: z.string().describe("Mathematical expression to evaluate (e.g., '2 + 3 * 4')")
    },
    async ({ expression }) => {
      try {
        // @ts-ignore: Ignore missing type declarations for mathjs
        const { compile } = await import("mathjs");
        const start = Date.now();
        const code = compile(expression);
        const result = code.evaluate();
        const elapsed = Date.now() - start;
        return {
          content: [
            {
              type: "text",
              text: `Expression: ${expression}\nResult: ${result}\n(evaluated in ${elapsed} ms)`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );

  // Number base converter
  server.tool(
    "number-base-converter",
    "Convert numbers between different bases (binary, octal, decimal, hexadecimal)",
    {
      number: z.string().describe("Number to convert"),
      fromBase: z.number().describe("Source base (2-36)"),
      toBase: z.number().describe("Target base (2-36)")
    },
    async ({ number, fromBase, toBase }) => {
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

  // Roman numeral converter
  server.tool(
    "roman-numeral-converter",
    "Convert between Arabic numbers and Roman numerals",
    {
      input: z.string().describe("Number to convert (Arabic number 1-3999 or Roman numeral)")
    },
    async ({ input }) => {
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

  // Temperature converter
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

  // Percentage calculator
  server.tool(
    "percentage-calculator",
    "Calculate percentages, percentage of a number, or percentage change",
    {
      operation: z.enum(["percentage-of", "what-percentage", "percentage-change"]).describe("Type of percentage calculation"),
      value1: z.number().describe("First value"),
      value2: z.number().describe("Second value")
    },
    async ({ operation, value1, value2 }) => {
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

  // Unix timestamp converter
  server.tool(
    "unix-timestamp-converter",
    "Convert between Unix timestamps and human-readable dates",
    {
      input: z.string().describe("Unix timestamp (seconds) or ISO date string")
    },
    async ({ input }) => {
      try {
        // Auto-detect if input is a timestamp or date string
        const isTimestamp = /^\d+$/.test(input.trim());

        if (isTimestamp) {
          // Convert timestamp to date
          const timestamp = parseInt(input);
          if (isNaN(timestamp)) {
            throw new Error("Invalid timestamp");
          }

          const date = new Date(timestamp * 1000);
          const iso = date.toISOString();
          const local = date.toLocaleString();

          return {
            content: [
              {
                type: "text",
                text: `Timestamp: ${timestamp}\nISO Date: ${iso}\nLocal Date: ${local}`
              }
            ]
          };
        } else {
          // Convert date string to timestamp
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date string");
          }

          const timestamp = Math.floor(date.getTime() / 1000);

          return {
            content: [
              {
                type: "text",
                text: `Date: ${input}\nUnix Timestamp: ${timestamp}`
              }
            ]
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}