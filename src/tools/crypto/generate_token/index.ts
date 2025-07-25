import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerGenerateToken(server: McpServer) {
  server.registerTool("generate_token", {
  description: "Generate secure random tokens",
  inputSchema: {
      length: z.number().describe("Token length").optional(),
      charset: z.enum(["alphanumeric", "hex", "base64", "custom"]).describe("Character set to use").optional(),
      customChars: z.string().optional().describe("Custom characters (required if charset is 'custom')"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Token",
      description: "Generate secure random tokens",
      readOnlyHint: false
    }
}, async ({ length = 32, charset = "alphanumeric", customChars }) => {
      try {
        if (length < 8 || length > 256) {
          return {
            content: [
              {
                type: "text",
                text: "Length must be between 8 and 256.",
              },
            ],
          };
        }
        let chars = '';

        switch (charset) {
          case 'alphanumeric':
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            break;
          case 'hex':
            chars = '0123456789abcdef';
            break;
          case 'base64':
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            break;
          case 'custom':
            if (!customChars) {
              return {
                content: [
                  {
                    type: "text",
                    text: "Error: Custom characters required when charset is 'custom'",
                  },
                ],
              };
            }
            chars = customChars;
            break;
        }

        let token = '';
        const { randomBytes } = await import('crypto');
        const randomValues = randomBytes(length);
        
        for (let i = 0; i < length; i++) {
          token += chars.charAt(randomValues[i] % chars.length);
        }

        return {
          content: [
            {
              type: "text",
              text: `Generated Token:
${token}

Length: ${length} characters
Character set: ${charset}
${charset === 'custom' ? `Custom chars: ${customChars}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating token: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
