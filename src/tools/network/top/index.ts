import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import psList from "ps-list";

export function registerTop(server: McpServer) {
  server.registerTool("top", {
    description: "Display system processes (snapshot)",

  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Top",

      
      readOnlyHint: false
    }
}, async () => {
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
