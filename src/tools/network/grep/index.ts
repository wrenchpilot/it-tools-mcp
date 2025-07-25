import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs";

export function registerGrep(server: McpServer) {
  server.registerTool("grep", {
  description: "Search for patterns in files",
  inputSchema: {
      pattern: z.string().describe("Pattern to search for"),
      file: z.string().describe("File path")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Grep",
      description: "Search for patterns in files",
      readOnlyHint: false
    }
}, async ({ pattern, file }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        const lines = data.split("\n");
        const matches = lines.filter(line => line.includes(pattern));
        return { content: [{ type: "text", text: matches.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text", text: `grep failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
