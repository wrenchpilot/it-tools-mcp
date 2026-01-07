import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as crypto from "crypto";
export function registerMacAddressGenerate(server: McpServer) {
  server.registerTool("generate_mac_address", {
    description: "Generate random MAC address",

  inputSchema: {
      prefix: z.string().optional().describe("MAC address prefix (e.g., '00:1B:44')"),
      separator: z.enum([":", "-"]).describe("Separator character").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Mac-address-generate",

      
      readOnlyHint: false
    }
}, async ({ prefix, separator = ":" }) => {
      try {
        let macParts = [];

        if (prefix) {
          // Validate and use provided prefix
          const prefixParts = prefix.split(/[:-]/);
          if (prefixParts.length > 6) {
            throw new Error("Prefix cannot have more than 6 parts");
          }

          for (const part of prefixParts) {
            if (!/^[0-9-A-Fa-f]{2}$/.test(part)) {
              throw new Error(`Invalid MAC address part: ${part}`);
            }
            macParts.push(part.toUpperCase());
          }
        }

        // Generate remaining parts
        if (macParts.length < 6) {
          const neededBytes = 6 - macParts.length;
          const randomBytes = crypto.randomBytes(neededBytes);
          for (let i = 0; i < neededBytes; i++) {
            const randomByte = randomBytes[i].toString(16).padStart(2, '0').toUpperCase();
            macParts.push(randomByte);
          }
        }

        // Ensure first octet indicates locally administered unicast
        if (!prefix) {
          const firstOctet = parseInt(macParts[0], 16);
          // Set locally administered bit (bit 1) and clear multicast bit (bit 0)
          macParts[0] = ((firstOctet | 0x02) & 0xFE).toString(16).padStart(2, '0').toUpperCase();
        }

        const macAddress = macParts.join(separator);

        // Analyze the MAC address
        const firstOctet = parseInt(macParts[0], 16);
        const isMulticast = (firstOctet & 0x01) !== 0;
        const isLocallyAdministered = (firstOctet & 0x02) !== 0;

        return {
          content: [
            {
              type: "text",
              text: `Generated MAC Address: ${macAddress}

Properties:
Type: ${isMulticast ? 'Multicast' : 'Unicast'}
Administration: ${isLocallyAdministered ? 'Locally Administered' : 'Universally Administered'}
Format: ${separator === ':' ? 'Colon notation' : 'Hyphen notation'}

Binary representation:
${macParts.map(part => parseInt(part, 16).toString(2).padStart(8, '0')).join(' ')}

${prefix ? `Used prefix: ${prefix}` : 'Randomly generated'}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating MAC address: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
