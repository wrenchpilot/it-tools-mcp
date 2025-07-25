import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextLowercase(server: McpServer) {
  server.registerTool("convert_text_to_lowercase", {
  description: "Convert text to lowercase",
  inputSchema: {
      text: z.string().describe("Text to convert to lowercase"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Lowercase",
      description: "Convert text to lowercase",
      readOnlyHint: false
    }
}, async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Lowercase: ${text.toLowerCase()}`,
          },
        ],
      };
    }
  );
}
