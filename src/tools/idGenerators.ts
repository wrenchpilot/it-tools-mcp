import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";
import QRCode from "qrcode";

// Real QR Code generator using the qrcode library
async function generateQRCodeASCII(text: string, size: number = 1): Promise<string> {
  try {
    // Generate QR code as a string (ASCII art)
    const qrString = await QRCode.toString(text, { 
      type: 'terminal',
      small: size === 1,
      width: size > 1 ? size * 20 : undefined
    });
    return qrString;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

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

  // QR code generator (ASCII)
  server.tool(
    "qr-generate",
    "Generate ASCII QR code",
    {
      text: z.string().describe("Text to encode in QR code"),
      size: z.number().min(1).max(3).default(1).describe("Size multiplier (1-3)"),
    },
    async ({ text, size = 1 }) => {
      try {
        // Generate real QR code using the qrcode library
        const asciiQR = await generateQRCodeASCII(text, size);

        return {
          content: [
            {
              type: "text",
              text: `QR Code for: "${text}"

${asciiQR}

✅ This is a real, scannable QR code!
📱 Scan it with any QR code reader app.

Data: ${text.length} characters
Generated using the 'qrcode' npm library.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        
        // Generate real QR code for WiFi
        const asciiQR = await generateQRCodeASCII(wifiString, 1);

        return {
          content: [
            {
              type: "text",
              text: `WiFi QR Code:

${asciiQR}

WiFi Details:
• Network: ${ssid}
• Security: ${security}
• Hidden: ${hidden}
• WiFi String: ${wifiString}

✅ This is a real, scannable WiFi QR code!
📱 Scan with your phone's camera or WiFi settings to connect automatically.

Generated using the 'qrcode' npm library.`,
            },
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
