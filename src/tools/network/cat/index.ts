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

export function registerCat(server: McpServer) {
  server.tool(
    "cat",
    "Display content of a file",
    {
      file: z.string().describe("File path")
    },
    async ({ file }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        return { content: [{ type: "text", text: data }] };
      } catch (error) {
        return { content: [{ type: "text", text: `cat failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
