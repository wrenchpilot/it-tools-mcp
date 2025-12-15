import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import readLastLines from "read-last-lines";

export function registerTail(server: McpServer) {
  server.registerTool("tail", {

  inputSchema: {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Tail",

      readOnlyHint: false
    }
}, async ({ file, lines }) => {
      try {
        const out = await readLastLines.read(file, lines);
        return { content: [{ type: "text", text: out }] };
      } catch (error) {
        return { content: [{ type: "text", text: `tail failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
