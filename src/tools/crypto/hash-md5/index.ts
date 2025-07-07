import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";
import { z } from "zod";

export function registerHashMd5(server: McpServer) {
  server.tool(
    "hash-md5",
    "Generate MD5 hash",
    {
      text: z.string().describe("Text to hash with MD5"),
    },
    async ({ text }) => {
      const hash = createHash('md5');
      hash.update(text);
      const result = hash.digest('hex');
      return {
        content: [
          {
            type: "text",
            text: `MD5 hash: ${result}`,
          },
        ],
      };
    }
  );
}
