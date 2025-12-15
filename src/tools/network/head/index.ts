import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs";

export function registerHead(server: McpServer) {
  server.registerTool("head", {

  inputSchema: {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Head",

      readOnlyHint: false
    }
}, async ({ file, lines }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        const out = data.split("\n").slice(0, lines).join("\n");
        return { content: [{ type: "text", text: out }] };
      } catch (error) {
        return { content: [{ type: "text", text: `head failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
