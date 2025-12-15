import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextCapitalize(server: McpServer) {
  server.registerTool("capitalize_text", {

  inputSchema: {
      text: z.string().describe("Text to capitalize"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Capitalize Text",

      readOnlyHint: false
    }
}, async ({ text }) => {
      const capitalized = text.replace(/\b\w/g, l => l.toUpperCase());
      return {
        content: [
          {
            type: "text",
            text: `Capitalized: ${capitalized}`,
          },
        ],
      };
    }
  );
}
