import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "crypto";
import { z } from "zod";

export function registerIdGeneratorTools(server: McpServer) {
  // UUID generation tool
  server.tool(
    "uuid-generate",
    "Generate a random UUID v4",
    {},
    async () => {
      const uuid = randomUUID();
      return {
        content: [
          {
            type: "text",
            text: `Generated UUID: ${uuid}`,
          },
        ],
      };
    }
  );

  // ULID generator
  server.tool(
    "ulid-generate",
    "Generate Universally Unique Lexicographically Sortable Identifier",
    {},
    async () => {
      try {
        // Simplified ULID implementation
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 18);
        const ulid = timestamp.toString(36).toUpperCase() + randomPart.toUpperCase();

        return {
          content: [
            {
              type: "text",
              text: `Generated ULID: ${ulid}

Timestamp: ${timestamp}
Generated at: ${new Date(timestamp).toISOString()}

Note: This is a simplified ULID implementation.
For production use, please use a proper ULID library.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating ULID: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // QR code generator (Real implementation using qrcode library)
  server.tool(
    "qr-generate",
    "Generate QR code for any text including URLs, WiFi networks, contact info, etc.",
    {
      text: z.string().describe("Text to encode in QR code (URLs, WiFi: WIFI:T:WPA;S:network;P:password;;, contact info, etc.)"),
      size: z.number().describe("Size multiplier (1-3)").optional(),
    },
    async ({ text, size = 1 }) => {
      try {
        const QRCode = (await import("qrcode")).default;

        if (size < 1 || size > 3) {
          return {
            content: [
              {
                type: "text",
                text: "Size must be between 1 and 3.",
              },
            ],
          };
        }
        // Generate QR code as base64 data URL
        console.log(`[DEBUG] Generating QR code for: "${text}" with size: ${size}`);
        const dataUrl = await QRCode.toDataURL(text, {
          type: 'image/png',
          errorCorrectionLevel: 'M',
          width: Math.max(256, size * 128), // Minimum 256px, scales with size parameter
          margin: 2,
          color: {
            dark: '#000000',  // Black
            light: '#FFFFFF'  // White
          }
        });
        console.log(`[DEBUG] QR code generated successfully`);

        // Extract just the base64 data (remove the data:image/png;base64, prefix)
        const base64Data = dataUrl.split(',')[1];

        return {
          content: [
            {
              type: "text",
              text: `📱 QR Code for: "${text}"

📊 Data encoded: "${text}" (${text.length} characters)
🎯 Error correction: Medium (M)
📐 Image size: ${Math.max(256, size * 128)}x${Math.max(256, size * 128)} pixels

✅ This QR code can be scanned with any QR code reader app
💡 Generated using the 'qrcode' npm library!`,
            },
            {
              type: "image",
              data: base64Data,
              mimeType: "image/png"
            }
          ],
        };
      } catch (error) {
        console.error(`[DEBUG] QR code generation failed:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error generating QR code: ${error instanceof Error ? error.message : 'Unknown error'}\n\nDebug info:\n- Text: \"${text}\"\n- Size: ${size}`,
            },
          ],
        };
      }
    }
  );



  // SVG placeholder generator
  server.tool(
    "svg-placeholder-generator",
    "Generate SVG placeholder images",
    {
      width: z.number().describe("Width in pixels").optional(),
      height: z.number().describe("Height in pixels").optional(),
      backgroundColor: z.string().describe("Background color (hex)").optional(),
      textColor: z.string().describe("Text color (hex)").optional(),
      text: z.string().optional().describe("Custom text (default: dimensions)"),
    },
    async ({ width = 300, height = 200, backgroundColor = "#cccccc", textColor = "#666666", text }) => {
      try {
        if (width < 1 || width > 2000 || height < 1 || height > 2000) {
          return {
            content: [
              {
                type: "text",
                text: "Width and height must be between 1 and 2000 pixels.",
              },
            ],
          };
        }
        const displayText = text || `${width}×${height}`;
        const fontSize = Math.min(width, height) / 8;

        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dy=".3em">${displayText}</text>
</svg>`;

        const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

        return {
          content: [
            {
              type: "text",
              text: `SVG Placeholder Generated:

Dimensions: ${width}×${height}
Background: ${backgroundColor}
Text Color: ${textColor}
Text: ${displayText}

SVG Code:
${svg}

Data URL:
${dataUrl}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating SVG placeholder: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
