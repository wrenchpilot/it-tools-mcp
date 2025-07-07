import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMathEvaluate(server: McpServer) {
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
}
