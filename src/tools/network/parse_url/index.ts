import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUrlParse(server: McpServer) {
  server.registerTool("parse_url", {
  description: "Parse URL into components",
  inputSchema: {
      url: z.string().describe("URL to parse"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Url-parse",
      description: "Parse URL into components",
      readOnlyHint: false
    }
}, async ({ url }) => {
      try {
        const urlObj = new URL(url);

        // Parse query parameters
        const params: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return {
          content: [
            {
              type: "text",
              text: `URL Components:

Original URL: ${url}

Protocol: ${urlObj.protocol}
Host: ${urlObj.host}
Hostname: ${urlObj.hostname}
Port: ${urlObj.port || 'default'}
Pathname: ${urlObj.pathname}
Search: ${urlObj.search}
Hash: ${urlObj.hash}
Origin: ${urlObj.origin}

Query Parameters:
${Object.keys(params).length > 0
                  ? Object.entries(params).map(([key, value]) => `  ${key}: ${value}`).join('\n')
                  : '  (none)'}

Path Segments:
${urlObj.pathname.split('/').filter(segment => segment).map((segment, i) => `  ${i + 1}. ${segment}`).join('\n') || '  (none)'}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`,
            },
          ],
        };
      }
    }
  );
}
