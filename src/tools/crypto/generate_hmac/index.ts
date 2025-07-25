import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerGenerateHmac(server: McpServer) {
  server.registerTool("generate_hmac", {
  description: "Generate HMAC (Hash-based Message Authentication Code)",
  inputSchema: {
      message: z.string().describe("Message to authenticate"),
      key: z.string().describe("Secret key for HMAC"),
      algorithm: z.enum(["sha1", "sha256", "sha512"]).describe("Hash algorithm").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Hmac",
      description: "Generate HMAC (Hash-based Message Authentication Code)",
      readOnlyHint: false
    }
}, async ({ message, key, algorithm = "sha256" }) => {
      try {
        const hmac = createHmac(algorithm, key);
        hmac.update(message);
        const result = hmac.digest('hex');

        return {
          content: [
            {
              type: "text",
              text: `HMAC-${algorithm.toUpperCase()}: ${result}

Message: ${message}
Key: ${key}
Algorithm: ${algorithm.toUpperCase()}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating HMAC: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
