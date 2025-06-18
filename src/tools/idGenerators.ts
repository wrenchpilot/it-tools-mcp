import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";
import QRCode from "qrcode";

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
    "Generate ASCII QR code",
    {
      text: z.string().describe("Text to encode in QR code"),
      size: z.number().min(1).max(3).default(1).describe("Size multiplier (1-3)"),
    },
    async ({ text, size = 1 }) => {
      try {
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
              text: `Error generating QR code: ${error instanceof Error ? error.message : 'Unknown error'}

Debug info:
- Text: "${text}"
- Size: ${size}
- QRCode library available: ${typeof QRCode !== 'undefined' ? 'Yes' : 'No'}`,
            },
          ],
        };
      }
    }
  );

  // WiFi QR code generator
  server.tool(
    "wifi-qr-code-generator",
    "Generate QR code for WiFi network connection",
    {
      ssid: z.string().describe("WiFi network name (SSID)"),
      password: z.string().describe("WiFi password"),
      security: z.enum(["WPA", "WEP", "nopass"]).default("WPA").describe("Security type"),
      hidden: z.boolean().default(false).describe("Is the network hidden?"),
    },
    async ({ ssid, password, security = "WPA", hidden = false }) => {
      try {
        // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
        const wifiString = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
        
        // Generate QR code as base64 data URL
        const dataUrl = await QRCode.toDataURL(wifiString, {
          type: 'image/png',
          errorCorrectionLevel: 'M',
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',  // Black
            light: '#FFFFFF'  // White
          }
        });

        return {
          content: [
            {
              type: "text",
              text: `🔗 WiFi QR Code Generated!

WiFi Connection Details:
• Network Name (SSID): ${ssid}
• Security Type: ${security}
• Hidden Network: ${hidden}
• WiFi Connection String: ${wifiString}

📱 Scan this QR code to connect to the WiFi network!`,
            },
            {
              type: "image",
              data: dataUrl,
              mimeType: "image/png"
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating WiFi QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      width: z.number().min(1).max(2000).default(300).describe("Width in pixels"),
      height: z.number().min(1).max(2000).default(200).describe("Height in pixels"),
      backgroundColor: z.string().default("#cccccc").describe("Background color (hex)"),
      textColor: z.string().default("#666666").describe("Text color (hex)"),
      text: z.string().optional().describe("Custom text (default: dimensions)"),
    },
    async ({ width = 300, height = 200, backgroundColor = "#cccccc", textColor = "#666666", text }) => {
      try {
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
