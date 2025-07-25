import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTomlToJson(server: McpServer) {
  server.registerTool("toml-to-json", {
  description: "Convert TOML to JSON format",
  inputSchema: {
      toml: z.string().describe("TOML string to convert"),
    }
}, async ({ toml: tomlString }) => {
      try {
        const toml = await import("@iarna/toml");
        const result = toml.parse(tomlString);
        return {
          content: [
            {
              type: "text",
              text: `JSON result:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting TOML to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
