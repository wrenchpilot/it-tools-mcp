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

export function registerDig(server: McpServer) {
  server.registerTool("dig", {
  description: "Perform DNS lookup with dig command",
  inputSchema: {
      target: z.string().describe("Hostname or IP address"),
      type: z.string().default("A").describe("DNS record type")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Dig",
      description: "Perform DNS lookup with dig command",
      readOnlyHint: false
    }
}, async ({ target, type }) => {
      return new Promise((resolve) => {
        dns.resolve(target, type, (err, addresses) => {
          if (err) {
            resolve({ content: [{ type: "text", text: `dig failed: ${err.message}` }] });
          } else {
            resolve({ content: [{ type: "text", text: `${type} records for ${target}:\n${JSON.stringify(addresses, null, 2)}` }] });
          }
        });
      });
    }
  );
}
