import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCidrToIpRange(server: McpServer) {
  server.registerTool("convert_cidr_to_ip_range", {

  inputSchema: {
      cidr: z.string().describe("CIDR notation (e.g., 192.168.1.0/24)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Cidr-to-ip-range",

      readOnlyHint: false
    }
}, async ({ cidr }) => {
      try {
        const [network, prefixLength] = cidr.split('/');
        if (!network || !prefixLength) {
          throw new Error("Invalid CIDR format. Use format: x.x.x.x/y");
        }

        const prefix = parseInt(prefixLength);
        if (prefix < 0 || prefix > 32) {
          throw new Error("Prefix length must be between 0 and 32");
        }

        // Parse IP address
        const ipParts = network.split('.').map(part => {
          const num = parseInt(part);
          if (num < 0 || num > 255) {
            throw new Error("Invalid IP address format");
          }
          return num;
        });

        if (ipParts.length !== 4) {
          throw new Error("Invalid IP address format");
        }

        // Calculate network and broadcast addresses
        const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
        const mask = (-1 << (32 - prefix)) >>> 0;
        const networkInt = (ipInt & mask) >>> 0;
        const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;

        // Convert back to dotted decimal
        const networkAddr = [
          (networkInt >>> 24) & 0xFF,
          (networkInt >>> 16) & 0xFF,
          (networkInt >>> 8) & 0xFF,
          networkInt & 0xFF
        ].join('.');

        const broadcastAddr = [
          (broadcastInt >>> 24) & 0xFF,
          (broadcastInt >>> 16) & 0xFF,
          (broadcastInt >>> 8) & 0xFF,
          broadcastInt & 0xFF
        ].join('.');

        const firstUsable = [
          (networkInt >>> 24) & 0xFF,
          (networkInt >>> 16) & 0xFF,
          (networkInt >>> 8) & 0xFF,
          (networkInt & 0xFF) + 1
        ].join('.');

        const lastUsable = [
          (broadcastInt >>> 24) & 0xFF,
          (broadcastInt >>> 16) & 0xFF,
          (broadcastInt >>> 8) & 0xFF,
          (broadcastInt & 0xFF) - 1
        ].join('.');

        const subnetMask = [
          (mask >>> 24) & 0xFF,
          (mask >>> 16) & 0xFF,
          (mask >>> 8) & 0xFF,
          mask & 0xFF
        ].join('.');

        const wildcardMask = [
          ((~mask) >>> 24) & 0xFF,
          ((~mask) >>> 16) & 0xFF,
          ((~mask) >>> 8) & 0xFF,
          (~mask) & 0xFF
        ].join('.');

        const totalHosts = Math.pow(2, 32 - prefix);
        const usableHosts = totalHosts - 2; // Subtract network and broadcast

        return {
          content: [{
            type: "text",
            text: `CIDR to IP Range Conversion:

Input CIDR: ${cidr}

Network Information:
• Network Address: ${networkAddr}
• Broadcast Address: ${broadcastAddr}
• First Usable IP: ${firstUsable}
• Last Usable IP: ${lastUsable}

Range: ${firstUsable} - ${lastUsable}

Subnet Details:
• Subnet Mask: ${subnetMask}
• Wildcard Mask: ${wildcardMask}
• Prefix Length: /${prefix}
• Total Addresses: ${totalHosts.toLocaleString()}
• Usable Addresses: ${usableHosts.toLocaleString()}

Binary Representation:
• Network: ${networkInt.toString(2).padStart(32, '0')}
• Mask:    ${mask.toString(2).padStart(32, '0')}
• Broadcast: ${broadcastInt.toString(2).padStart(32, '0')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting CIDR: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
