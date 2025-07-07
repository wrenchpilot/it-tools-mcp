import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerJsonMinify(server: McpServer) {
  server.tool(
    "json-minify",
    "Minify JSON by removing whitespace",
    {
      json: z.string().describe("JSON string to minify"),
    },
    async ({ json }) => {
      try {
        const parsed = JSON.parse(json);
        const minified = JSON.stringify(parsed);
        return {
          content: [
            {
              type: "text",
              text: `Minified JSON: ${minified}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
