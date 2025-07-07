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

export function registerHead(server: McpServer) {
  server.tool(
    "head",
    "Display the beginning of a file",
    {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    async ({ file, lines }) => {
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
