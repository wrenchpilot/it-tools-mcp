import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";
import { z } from "zod";

export function registerHashMd5(server: McpServer) {
  server.registerTool("hash-md5", {
  description: "Generate MD5 hash",
  inputSchema: {
      text: z.string().describe("Text to hash with MD5"),
    }
}, async ({ text }) => {
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
