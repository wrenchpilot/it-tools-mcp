import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import dns from "dns";

export function registerDig(server: McpServer) {
  server.registerTool("dig", {

  inputSchema: {
      target: z.string().describe("Hostname or IP address"),
      type: z.string().default("A").describe("DNS record type")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Dig",

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
