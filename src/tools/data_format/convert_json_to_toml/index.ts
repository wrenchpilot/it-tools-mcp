import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertJsonToml(server: McpServer) {
  server.registerTool("convert_json_to_toml", {
    description: "Convert JSON to TOML format",

  inputSchema: {
      json: z.string().describe("JSON string to convert"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Json To Toml",

      
      readOnlyHint: false
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
