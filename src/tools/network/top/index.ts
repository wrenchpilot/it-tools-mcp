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

export function registerTop(server: McpServer) {
  server.tool(
    "top",
    "Display system processes (snapshot)",
    {},
    async () => {
      try {
        const processes = await psList();
        const sorted = processes.sort((a, b) => (b.cpu || 0) - (a.cpu || 0)).slice(0, 10);
        const output = sorted.map(p => `${p.pid}\t${p.name}\tCPU: ${p.cpu || 0}%\tMEM: ${p.memory || 0}`).join("\n");
        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return { content: [{ type: "text", text: `top failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
