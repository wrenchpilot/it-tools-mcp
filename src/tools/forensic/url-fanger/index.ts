import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Buffer } from 'buffer';

export function registerUrlFanger(server: McpServer) {
  server.tool(
    "url-fanger",
    "Defang or refang URLs for safe sharing (security analysis)",
    {
      text: z.string().describe("Text containing URLs to fang/defang"),
      operation: z.enum(["defang", "refang"]).describe("Whether to defang (make safe) or refang (restore) URLs")
    },
    async ({ text, operation }) => {
      try {
        let result = text;
        
        if (operation === "defang") {
          // Defang URLs to make them safe
          result = result
            .replace(/https?:\/\//g, 'hxxp://') // Replace http/https with hxxp
            .replace(/\./g, '[.]') // Replace dots with [.]
            .replace(/@/g, '[@]') // Replace @ with [@]
            .replace(/:/g, '[:]'); // Replace colons with [:]
        } else {
          // Refang URLs to restore them
          result = result
            .replace(/hxxp:\/\//g, 'http://') // Restore http
            .replace(/hxxps:\/\//g, 'https://') // Restore https
            .replace(/\[\.\]/g, '.') // Restore dots
            .replace(/\[@\]/g, '@') // Restore @
            .replace(/\[:\]/g, ':'); // Restore colons
        }

        return {
          content: [{
            type: "text",
            text: `URL ${operation === "defang" ? "Defanging" : "Refanging"} Results:

Original:
${text}

${operation === "defang" ? "Defanged" : "Refanged"}:
${result}

Note: ${operation === "defang" 
  ? "Defanged URLs are safe to share and won't be clickable." 
  : "Refanged URLs have been restored to their original form."}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error processing URLs: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
