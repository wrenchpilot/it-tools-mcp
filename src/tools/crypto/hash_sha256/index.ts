import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";
import { z } from "zod";

export function registerHashSha256(server: McpServer) {
  server.registerTool("hash_sha256", {
  description: 'Generate SHA256 hash of input text. Example: "hello" → "2cf24dba4f21d..."',
  inputSchema: {
      text: z.string().describe("Text to hash with SHA256"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Hash Sha256",
      description: "Generate SHA256 hash of input text",
      readOnlyHint: false
    }
}, async ({ text }) => {
      const hash = createHash('sha256');
      hash.update(text);
      const result = hash.digest('hex');
      return {
        content: [
          {
            type: "text",
            text: `SHA256 hash: ${result}`,
          },
        ],
      };
    }
  );
}
