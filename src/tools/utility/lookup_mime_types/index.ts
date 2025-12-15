import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mimeTypes from 'mime-types';

function getMimeCategory(mimeType: string): string {
  if (mimeType.startsWith('text/')) return 'Text';
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('application/')) return 'Application';
  if (mimeType.startsWith('font/')) return 'Font';
  return 'Other';
}

function getMimeDescription(mimeType: string): string {
  const descriptions: Record<string, string> = {
    'text/plain': 'Plain text file',
    'text/html': 'HTML document',
    'text/css': 'Cascading Style Sheets',
    'text/javascript': 'JavaScript code',
    'application/json': 'JSON data',
    'image/jpeg': 'JPEG image',
    'image/png': 'PNG image',
    'image/gif': 'GIF image',
    'application/pdf': 'PDF document',
    'application/zip': 'ZIP archive',
    'audio/mpeg': 'MP3 audio file',
    'video/mp4': 'MP4 video file'
  };

  return descriptions[mimeType] || 'No description available';
}

export function registerMimeTypes(server: McpServer) {
  server.registerTool("lookup_mime_types", {

  inputSchema: {
      input: z.string().describe("File extension (e.g., 'txt') or MIME type (e.g., 'text/plain')"),
      lookupType: z.enum(["extension-to-mime", "mime-to-extension"]).describe("Lookup direction").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Lookup Mime Types",

      readOnlyHint: true
    }
}, async ({ input, lookupType = "extension-to-mime" }) => {
      try {

        if (lookupType === "extension-to-mime") {
          const ext = input.toLowerCase().replace(/^\./, ''); // Remove leading dot if present
          const mimeType = mimeTypes.lookup(ext);

          if (!mimeType) {
            return {
              content: [
                {
                  type: "text",
                  text: `MIME Type Lookup:

Extension: .${ext}
Result: Not found

Note: This extension is not recognized in the MIME types database.`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `MIME Type Lookup:

Extension: .${ext}
MIME Type: ${mimeType}

Category: ${getMimeCategory(mimeType)}
Description: ${getMimeDescription(mimeType)}`,
              },
            ],
          };
        } else {
          // mime-to-extension
          const mimeType = input.toLowerCase();
          const extension = mimeTypes.extension(mimeType);

          if (!extension) {
            return {
              content: [
                {
                  type: "text",
                  text: `Extension Lookup:

MIME Type: ${input}
Result: Not found

Note: This MIME type is not recognized or has no standard extension.`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `Extension Lookup:

MIME Type: ${mimeType}
Extension: .${extension}
Primary: .${extension}

Category: ${getMimeCategory(mimeType)}
Description: ${getMimeDescription(mimeType)}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error looking up MIME type: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
