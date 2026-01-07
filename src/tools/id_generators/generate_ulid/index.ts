import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGenerateUlid(server: McpServer) {
  server.registerTool("generate_ulid", {
    description: "Generate Universally Unique Lexicographically Sortable Identifier (ULID). Example: creates time-sortable unique IDs like '01ARZ3NDEKTSV4RRFFQ69G5FAV'",

    inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Generate ULID",

      
      readOnlyHint: false
    }
  }, async () => {
      try {
        // Simplified ULID implementation
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 18);
        const ulid = timestamp.toString(36).toUpperCase() + randomPart.toUpperCase();

        return {
          content: [
            {
              type: "text",
              text: `Generated ULID: ${ulid}

Timestamp: ${timestamp}
Generated at: ${new Date(timestamp).toISOString()}

Note: This is a simplified ULID implementation.
For production use, please use a proper ULID library.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating ULID: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
