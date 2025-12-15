import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGenerateAuth(server: McpServer) {
  server.registerTool("generate_basic_auth", {

  inputSchema: {
      username: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Basic Auth",

      readOnlyHint: false
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
