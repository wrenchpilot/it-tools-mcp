import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Buffer } from 'buffer';

export function registerSafelinkDecoder(server: McpServer) {
  server.tool(
    "safelink-decoder",
    "Decode Microsoft Outlook SafeLink URLs",
    {
      safelink: z.string().describe("SafeLink URL to decode")
    },
    async ({ safelink }) => {
      try {
        const url = new URL(safelink);
        
        // Check if it's a SafeLink URL
        if (!url.hostname.includes('safelinks.protection.outlook.com')) {
          return {
            content: [{
              type: "text",
              text: "This doesn't appear to be a SafeLink URL."
            }]
          };
        }

        // Extract the actual URL from the 'url' parameter
        const actualUrl = url.searchParams.get('url');
        if (!actualUrl) {
          return {
            content: [{
              type: "text",
              text: "Could not find the original URL in the SafeLink."
            }]
          };
        }

        // Decode the URL
        const decodedUrl = decodeURIComponent(actualUrl);
        
        return {
          content: [{
            type: "text",
            text: `SafeLink Decoder Results:

Original SafeLink: ${safelink}

Decoded URL: ${decodedUrl}

Additional Parameters:
- Data: ${url.searchParams.get('data') || 'N/A'}
- Reserved: ${url.searchParams.get('reserved') || 'N/A'}
- Source: ${url.searchParams.get('source') || 'N/A'}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error decoding SafeLink: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
