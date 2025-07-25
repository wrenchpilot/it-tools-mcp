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

export function registerNslookup(server: McpServer) {
  server.registerTool("nslookup", {
  description: "Perform DNS lookup on a hostname or IP address",
  inputSchema: {
      target: z.string().describe("Hostname or IP address")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Nslookup",
      description: "Perform DNS lookup on a hostname or IP address",
      readOnlyHint: false
    }
}, async ({ target }) => {
      return new Promise((resolve) => {
        dns.lookup(target, (err, address, family) => {
          if (err) {
            resolve({ content: [{ type: "text", text: `nslookup failed: ${err.message}` }] });
          } else {
            resolve({ content: [{ type: "text", text: `Address: ${address}\nFamily: IPv${family}` }] });
          }
        });
      });
    }
  );
}
