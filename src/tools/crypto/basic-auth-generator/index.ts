import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerBasicAuthGenerator(server: McpServer) {
  server.registerTool("basic-auth-generator", {
  description: "Generate HTTP Basic Authentication header",
  inputSchema: {
      username: z.string().describe("Username"),
      password: z.string().describe("Password"),
    }
}, async ({ username, password }) => {
      try {
        const credentials = `${username}:${password}`;
        const encoded = Buffer.from(credentials, 'utf-8').toString('base64');
        const authHeader = `Basic ${encoded}`;

        return {
          content: [
            {
              type: "text",
              text: `HTTP Basic Auth Header:
Authorization: ${authHeader}

Credentials: ${username}:${password}
Base64 Encoded: ${encoded}

Usage in curl:
curl -H "Authorization: ${authHeader}" https://api.example.com

Usage in fetch:
fetch('https://api.example.com', {
  headers: {
    'Authorization': '${authHeader}'
  }
})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating basic auth: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
