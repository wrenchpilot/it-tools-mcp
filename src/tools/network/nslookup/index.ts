import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import dns from "dns";

export function registerNslookup(server: McpServer) {
  server.registerTool("nslookup", {

  inputSchema: {
      target: z.string().describe("Hostname or IP address")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Nslookup",

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
