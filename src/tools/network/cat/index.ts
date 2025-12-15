import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs";

export function registerCat(server: McpServer) {
  server.registerTool("cat", {

  inputSchema: {
      file: z.string().describe("File path")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Cat",

      readOnlyHint: false
    }
}, async ({ file }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        return { content: [{ type: "text", text: data }] };
      } catch (error) {
        return { content: [{ type: "text", text: `cat failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
