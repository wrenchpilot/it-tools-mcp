import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mimeTypes from 'mime-types';

export function registerUtilityTools(server: McpServer) {
  // Email normalizer
  server.tool(
    "email-normalizer",
    "Normalize email addresses (remove dots, plus aliases, etc.)",
    {
      email: z.string().describe("Email address to normalize"),
    },
    async ({ email }) => {
      try {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Invalid email format");
        }

        const [localPart, domain] = email.toLowerCase().split('@');
        let normalizedLocal = localPart;
        let notes = [];

        // Handle Gmail-specific rules
        if (domain === 'gmail.com' || domain === 'googlemail.com') {
          // Remove dots from Gmail addresses
          const withoutDots = normalizedLocal.replace(/\./g, '');
          if (withoutDots !== normalizedLocal) {
            notes.push(`Removed dots: ${normalizedLocal} → ${withoutDots}`);
            normalizedLocal = withoutDots;
          }

          // Remove everything after + (alias)
          const plusIndex = normalizedLocal.indexOf('+');
          if (plusIndex !== -1) {
            const withoutAlias = normalizedLocal.substring(0, plusIndex);
            notes.push(`Removed alias: ${normalizedLocal} → ${withoutAlias}`);
            normalizedLocal = withoutAlias;
          }
        }

        // Handle other common plus aliasing
        const plusIndex = normalizedLocal.indexOf('+');
        if (plusIndex !== -1 && domain !== 'gmail.com' && domain !== 'googlemail.com') {
          const withoutAlias = normalizedLocal.substring(0, plusIndex);
          notes.push(`Removed plus alias: ${normalizedLocal} → ${withoutAlias}`);
          normalizedLocal = withoutAlias;
        }

        const normalizedEmail = `${normalizedLocal}@${domain}`;
        const isChanged = normalizedEmail !== email.toLowerCase();

        return {
          content: [
            {
              type: "text",
              text: `Email Normalization:

Original: ${email}
Normalized: ${normalizedEmail}
Changed: ${isChanged ? 'Yes' : 'No'}

${notes.length > 0 ? `Transformations applied:
${notes.map(note => `• ${note}`).join('\n')}` : 'No transformations needed'}

Domain: ${domain}
Local part: ${normalizedLocal}

Note: This normalization helps identify duplicate email addresses
that would be delivered to the same inbox.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error normalizing email: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // MIME type lookup
  server.tool(
    "mime-types",
    "Look up MIME types for file extensions",
    {
      input: z.string().describe("File extension (e.g., 'txt') or MIME type (e.g., 'text/plain')"),
      lookupType: z.enum(["extension-to-mime", "mime-to-extension"]).describe("Lookup direction").optional(),
    },
    async ({ input, lookupType = "extension-to-mime" }) => {
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

  // Device info
  server.tool(
    "device-info",
    "Get basic device/system information",
    {},
    async () => {
      try {
        const info = {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          userAgent: 'IT Tools MCP Server',
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en-US' // Default for server environment
        };

        return {
          content: [
            {
              type: "text",
              text: `Device Information:

Platform: ${info.platform}
Architecture: ${info.arch}
Node.js Version: ${info.nodeVersion}
User Agent: ${info.userAgent}
Current Time: ${info.timestamp}
Timezone: ${info.timezone}
Language: ${info.language}

Note: This is basic server environment information.
For detailed client device info, use a browser-based tool.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting device info: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // HTTP status codes reference
  server.tool(
    "http-status-codes",
    "Get information about HTTP status codes",
    {
      code: z.number().optional().describe("HTTP status code to look up (optional)"),
    },
    async ({ code }) => {
      try {
        const statusCodes: Record<number, string> = {
          // 1xx Informational
          100: "Continue",
          101: "Switching Protocols",
          102: "Processing",

          // 2xx Success
          200: "OK",
          201: "Created",
          202: "Accepted",
          204: "No Content",
          206: "Partial Content",

          // 3xx Redirection
          300: "Multiple Choices",
          301: "Moved Permanently",
          302: "Found",
          304: "Not Modified",
          307: "Temporary Redirect",
          308: "Permanent Redirect",

          // 4xx Client Error
          400: "Bad Request",
          401: "Unauthorized",
          403: "Forbidden",
          404: "Not Found",
          405: "Method Not Allowed",
          409: "Conflict",
          410: "Gone",
          422: "Unprocessable Entity",
          429: "Too Many Requests",

          // 5xx Server Error
          500: "Internal Server Error",
          501: "Not Implemented",
          502: "Bad Gateway",
          503: "Service Unavailable",
          504: "Gateway Timeout",
          505: "HTTP Version Not Supported"
        };

        const descriptions: Record<number, string> = {
          100: "The server has received the request headers and the client should proceed to send the request body.",
          101: "The requester has asked the server to switch protocols and the server has agreed to do so.",
          102: "The server has received and is processing the request, but no response is available yet.",

          200: "The request has succeeded.",
          201: "The request has been fulfilled and resulted in a new resource being created.",
          202: "The request has been accepted for processing, but the processing has not been completed.",
          204: "The server successfully processed the request and is not returning any content.",
          206: "The server is delivering only part of the resource due to a range header sent by the client.",

          300: "The request has more than one possible response.",
          301: "The URL of the requested resource has been changed permanently.",
          302: "The resource is temporarily located at a different URL.",
          304: "The response has not been modified since the last request.",
          307: "The request should be repeated with another URI, but future requests should still use the original URI.",
          308: "The request and all future requests should be repeated using another URI.",

          400: "The server could not understand the request due to invalid syntax.",
          401: "The client must authenticate itself to get the requested response.",
          403: "The client does not have access rights to the content.",
          404: "The server can not find the requested resource.",
          405: "The request method is known by the server but is not supported by the target resource.",
          409: "The request conflicts with the current state of the server.",
          410: "The content has been permanently deleted from server.",
          422: "The request was well-formed but was unable to be followed due to semantic errors.",
          429: "The user has sent too many requests in a given amount of time.",

          500: "The server has encountered a situation it doesn't know how to handle.",
          501: "The request method is not supported by the server and cannot be handled.",
          502: "The server got an invalid response while working as a gateway.",
          503: "The server is not ready to handle the request.",
          504: "The server is acting as a gateway and cannot get a response in time.",
          505: "The HTTP version used in the request is not supported by the server."
        };

        if (code !== undefined) {
          const message = statusCodes[code];
          const description = descriptions[code];

          if (!message) {
            return {
              content: [
                {
                  type: "text",
                  text: `HTTP Status Code: ${code}

Status: Unknown/Custom status code

Common status codes:
${Object.entries(statusCodes).slice(0, 10).map(([c, m]) => `• ${c}: ${m}`).join('\n')}`,
                },
              ],
            };
          }

          const category = getStatusCategory(code);

          return {
            content: [
              {
                type: "text",
                text: `HTTP Status Code: ${code}

Message: ${message}
Category: ${category}

Description: ${description || 'No detailed description available.'}

Usage: This status code indicates ${getUsageHint(code)}.`,
              },
            ],
          };
        } else {
          // Return overview of all status codes
          const byCategory = {
            '1xx (Informational)': Object.entries(statusCodes).filter(([c]) => c.startsWith('1')),
            '2xx (Success)': Object.entries(statusCodes).filter(([c]) => c.startsWith('2')),
            '3xx (Redirection)': Object.entries(statusCodes).filter(([c]) => c.startsWith('3')),
            '4xx (Client Error)': Object.entries(statusCodes).filter(([c]) => c.startsWith('4')),
            '5xx (Server Error)': Object.entries(statusCodes).filter(([c]) => c.startsWith('5'))
          };

          let result = 'HTTP Status Codes Reference:\n\n';

          for (const [category, codes] of Object.entries(byCategory)) {
            result += `${category}:\n`;
            for (const [code, message] of codes) {
              result += `• ${code}: ${message}\n`;
            }
            result += '\n';
          }

          return {
            content: [
              {
                type: "text",
                text: result.trim(),
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error looking up HTTP status code: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}

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

function getStatusCategory(code: number): string {
  if (code >= 100 && code < 200) return '1xx Informational';
  if (code >= 200 && code < 300) return '2xx Success';
  if (code >= 300 && code < 400) return '3xx Redirection';
  if (code >= 400 && code < 500) return '4xx Client Error';
  if (code >= 500 && code < 600) return '5xx Server Error';
  return 'Unknown Category';
}

function getUsageHint(code: number): string {
  if (code >= 100 && code < 200) return 'the request is being processed';
  if (code >= 200 && code < 300) return 'the request was successful';
  if (code >= 300 && code < 400) return 'the client needs to take additional action';
  if (code >= 400 && code < 500) return 'there was an error with the client request';
  if (code >= 500 && code < 600) return 'there was an error on the server side';
  return 'an unknown status';
}
