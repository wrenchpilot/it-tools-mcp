import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDecodeJwt(server: McpServer) {
  server.registerTool("decode_jwt", {
  description: "Decode JWT token (header and payload only)",

  inputSchema: {
      token: z.string().describe("JWT token to decode"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decode Jwt",

      
      readOnlyHint: false
    }
}, async ({ token }) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid JWT format. JWT must have 3 parts separated by dots.");
        }

        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

        return {
          content: [
            {
              type: "text",
              text: `JWT Token Decoded:

Header:
${JSON.stringify(header, null, 2)}

Payload:
${JSON.stringify(payload, null, 2)}

Note: Signature verification is not performed. Do not trust this token without proper verification.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error decoding JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
