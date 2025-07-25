import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";
import { z } from "zod";

export function registerHashSha1(server: McpServer) {
  server.registerTool("hash-sha1", {
  description: "Generate SHA1 hash",
  inputSchema: {
      text: z.string().describe("Text to hash with SHA1"),
    }
}, async ({ text }) => {
      const hash = createHash('sha1');
      hash.update(text);
      const result = hash.digest('hex');
      return {
        content: [
          {
            type: "text",
            text: `SHA1 hash: ${result}`,
          },
        ],
      };
    }
  );
}
