import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import psList from "ps-list";

export function registerPs(server: McpServer) {
  server.registerTool("ps", {
  description: "List running processes",
  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Ps",
      description: "List running processes",
      readOnlyHint: false
    }
}, async () => {
      try {
        const processes = await psList();
        // Defensive: handle missing properties and filter out bad entries
        const output = processes
          .map(p => {
            const pid = p.pid ?? 'N/A';
            const name = p.name ?? 'N/A';
            return `${pid}\t${name}`;
          })
          .join("\n");
        return { content: [{ type: "text", text: output || 'No processes found.' }] };
      } catch (error) {
        // Log error for debugging
        console.error('ps error:', error);
        return { content: [{ type: "text", text: `ps failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );
}
