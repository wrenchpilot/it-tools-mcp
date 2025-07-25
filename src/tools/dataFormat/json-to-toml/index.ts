import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerJsonToToml(server: McpServer) {
  server.registerTool("json-to-toml", {
  description: "Convert JSON to TOML format",
  inputSchema: {
      json: z.string().describe("JSON string to convert"),
    }
}, async ({ json }) => {
      try {
        const toml = await import("@iarna/toml");
        const data = JSON.parse(json);
        const tomlResult = toml.stringify(data);
        return {
          content: [
            {
              type: "text",
              text: `TOML result:\n${tomlResult}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting JSON to TOML: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
