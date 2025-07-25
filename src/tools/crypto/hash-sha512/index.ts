import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";
import { z } from "zod";

export function registerHashSha512(server: McpServer) {
  server.registerTool("hash-sha512", {
  description: "Generate SHA512 hash",
  inputSchema: {
      text: z.string().describe("Text to hash with SHA512"),
    }
}, async ({ text }) => {
      const hash = createHash('sha512');
      hash.update(text);
      const result = hash.digest('hex');
      return {
        content: [
          {
            type: "text",
            text: `SHA512 hash: ${result}`,
          },
        ],
      };
    }
  );
}
