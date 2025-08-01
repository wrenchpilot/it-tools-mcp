import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import bcryptjs from "bcryptjs";
import { z } from "zod";

export function registerHashBcrypt(server: McpServer) {
  server.registerTool("hash_bcrypt", {
  description: "Generate bcrypt hash or verify password against hash",
  inputSchema: {
      password: z.string().describe("Password to hash or verify"),
      rounds: z.number().describe("Number of salt rounds (4-12, default 10)").optional(),
      hash: z.string().optional().describe("Existing hash to verify against (for verification)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Hash Bcrypt",
      description: "Generate bcrypt hash or verify password against hash",
      readOnlyHint: false
    }
}, async ({ password, rounds = 10, hash }) => {
      try {
        if (rounds < 4 || rounds > 12) {
          return {
            content: [
              {
                type: "text",
                text: "Rounds must be between 4 and 12.",
              },
            ],
          };
        }

        if (hash) {
          // Verification mode
          const isValid = await bcryptjs.compare(password, hash);
          return {
            content: [
              {
                type: "text",
                text: `Password Verification: ${isValid ? 'VALID' : 'INVALID'}

Password: ${password}
Hash: ${hash}`,
              },
            ],
          };
        } else {
          // Hash generation mode
          const salt = await bcryptjs.genSalt(rounds);
          const hashedPassword = await bcryptjs.hash(password, salt);
          
          return {
            content: [
              {
                type: "text",
                text: `Bcrypt Hash Generated:
Hash: ${hashedPassword}

Password: ${password}
Rounds: ${rounds}
Algorithm: bcrypt

This hash can be safely stored in databases and used for password verification.`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error with bcrypt operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
