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

export function registerPing(server: McpServer) {
  server.tool(
    "ping",
    "Ping a host to check connectivity",
    {
      target: z.string().describe("Host to ping"),
      count: z.number().default(4).describe("Number of ping attempts")
    },
    async ({ target, count }) => {
      try {
        const res = await ping.promise.probe(target, { min_reply: count });
        return {
          content: [
            { type: "text", text: `Ping to ${target}:\nAlive: ${res.alive}\nTime: ${res.time} ms\nOutput: ${res.output}` }
          ]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Ping failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
