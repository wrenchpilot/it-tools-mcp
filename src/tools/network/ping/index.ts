import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import ping from "ping";

export function registerPing(server: McpServer) {
  server.registerTool("ping", {
    description: "Test network connectivity to a host. Example: ping google.com to check if it's reachable",

  inputSchema: {
      target: z.string().describe("Host to ping"),
      count: z.number().default(4).describe("Number of ping attempts")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Ping",

      
      readOnlyHint: false
    }
}, async ({ target, count }) => {
      try {
        const res = await ping.promise.probe(target, { min_reply: count });
        return {
          content: [
            { type: "text", text: `Ping to ${target}:\nAlive: ${res.alive}\nTime: ${res.time} ms\nOutput: ${res.output}` }
          ]
        };
      } catch (error) {
        return {
          isError: true, content: [{ type: "text", text: `Ping failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
