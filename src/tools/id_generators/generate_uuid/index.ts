import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";

export function registerGenerateUuid(server: McpServer) {
  server.registerTool("generate_uuid", {

  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Generate Uuid",

      readOnlyHint: false
    }
}, async () => {
      const uuid = randomUUID();
      return {
        content: [
          {
            type: "text",
            text: `Generated UUID: ${uuid}`,
          },
        ],
      };
    }
  );
}
