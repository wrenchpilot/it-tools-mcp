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

export function registerGrep(server: McpServer) {
  server.registerTool("grep", {
  description: "Search for patterns in files",
  inputSchema: {
      pattern: z.string().describe("Pattern to search for"),
      file: z.string().describe("File path")
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
