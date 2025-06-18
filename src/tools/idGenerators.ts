import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";

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
        // Simplified QR code pattern (just a visual representation)
        const qrSize = Math.max(21, Math.min(177, text.length + 21));
        let qr = '';
        
        for (let i = 0; i < qrSize; i++) {
          let line = '';
          for (let j = 0; j < qrSize; j++) {
            // Create a simple pattern based on position and text
            const hash = (i * qrSize + j + text.charCodeAt(j % text.length)) % 2;
            const char = hash === 0 ? '██' : '  ';
            line += char.repeat(size);
          }
          for (let k = 0; k < size; k++) {
            qr += line + '\n';
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `ASCII QR Code for: "${text}"

${qr}

Size: ${qrSize}x${qrSize} (scale ${size}x)

⚠️  Note: This is a visual representation only.
For actual QR codes, use a proper QR code library.`,
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
        
        // Simple QR representation
        const qrSize = 25;
        let qr = '';
        
        for (let i = 0; i < qrSize; i++) {
          let line = '';
          for (let j = 0; j < qrSize; j++) {
            const hash = (i * qrSize + j + wifiString.charCodeAt(j % wifiString.length)) % 2;
            const char = hash === 0 ? '██' : '  ';
            line += char;
          }
          qr += line + '\n';
        }

        return {
          content: [
            {
              type: "text",
              text: `WiFi QR Code:

${qr}

WiFi Details:
Network: ${ssid}
Security: ${security}
Hidden: ${hidden}

QR Code Data: ${wifiString}

⚠️  Note: This is a visual representation only.
For actual QR codes, use a proper QR code library.
Scan with a QR code reader to connect to the WiFi network.`,
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
