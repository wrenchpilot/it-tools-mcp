import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client as SSHClient } from "ssh2";
import ping from "ping";
import dns from "dns";
import psList from "ps-list";
import fs from "fs";
import readLastLines from "read-last-lines";
import path from "path";
import os from "os";

export function registerMacAddressGenerate(server: McpServer) {
  server.registerTool("mac-address-generate", {
  description: "Generate random MAC address",
  inputSchema: {
      prefix: z.string().optional().describe("MAC address prefix (e.g., '00:1B:44')"),
      separator: z.enum([":", "-"]).describe("Separator character").optional(),
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
        while (macParts.length < 6) {
          const randomByte = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
          macParts.push(randomByte);
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
