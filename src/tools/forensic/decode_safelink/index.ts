import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Buffer } from 'buffer';

export function registerDecodeSafelink(server: McpServer) {
  server.registerTool("decode_safelink", {

  inputSchema: {
      safelink: z.string().describe("SafeLink URL to decode")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decode Safelink",

      readOnlyHint: false
    }
}, async ({ safelink }) => {
      try {
        const url = new URL(safelink);
        
        // Check if it's a SafeLink URL - use secure hostname validation
        const allowedSafeLinkHosts = [
          'safelinks.protection.outlook.com',
          'nam11.safelinks.protection.outlook.com',
          'eur01.safelinks.protection.outlook.com',
          'apc01.safelinks.protection.outlook.com',
          'gcc02.safelinks.protection.outlook.com'
        ];
        
        if (!allowedSafeLinkHosts.includes(url.hostname.toLowerCase())) {
          return {
            content: [{
              type: "text",
              text: "This doesn't appear to be a legitimate SafeLink URL from Microsoft Outlook."
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
