import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMinifyJson(server: McpServer) {
  server.registerTool("minify_json", {
    description: "Minify JSON by removing whitespace and unnecessary characters. Example: formatted JSON → compact single-line JSON",
    inputSchema: {
      json: z.string().describe("JSON string to minify"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Minify JSON",
      description: "Remove whitespace and minify JSON to compact format",
      readOnlyHint: false
    }
  }, async ({ json }) => {
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
