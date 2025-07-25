import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextCapitalize(server: McpServer) {
  server.registerTool("text-capitalize", {
  description: "Capitalize first letter of each word",
  inputSchema: {
      text: z.string().describe("Text to capitalize"),
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
