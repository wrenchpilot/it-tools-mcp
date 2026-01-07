import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertTomlJson(server: McpServer) {
  server.registerTool("convert_toml_to_json", {
    description: "Convert TOML to JSON format",

  inputSchema: {
      toml: z.string().describe("TOML string to convert"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Toml To Json",

      
      readOnlyHint: false
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
