import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client as SSHClient } from "ssh2";
import ping from "ping";
import dns from "dns";
import psList from "ps-list";
import fs from "fs";
import readLastLines from "read-last-lines";
import path from "path";
import os from "os";

export function registerTail(server: McpServer) {
  server.registerTool("tail", {
  description: "Display the end of a file",
  inputSchema: {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Tail",
      description: "Display the end of a file",
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
