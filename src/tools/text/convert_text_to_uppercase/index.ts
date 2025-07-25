import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextUppercase(server: McpServer) {
  server.registerTool("convert_text_to_uppercase", {
  description: "Convert text to uppercase",
  inputSchema: {
      text: z.string().describe("Text to convert to uppercase"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Uppercase",
      description: "Convert text to uppercase",
      readOnlyHint: false
    }
}, async ({ text }) => {
      return {
        content: [
          {
            type: "text",
            text: `Uppercase: ${text.toUpperCase()}`,
          },
        ],
      };
    }
  );
}
