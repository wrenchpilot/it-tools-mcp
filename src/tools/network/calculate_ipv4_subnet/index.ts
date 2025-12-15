import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerIpv4SubnetCalc(server: McpServer) {
  server.registerTool("calculate_ipv4_subnet", {

  inputSchema: {
      cidr: z.string().describe("IPv4 CIDR notation (e.g., 192.168.1.0/24)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Ipv4-subnet-calc",

      readOnlyHint: false
    }
}, async ({ cidr }) => {
      try {
        const [ip, prefixLength] = cidr.split('/');
        const prefix = parseInt(prefixLength);

        if (isNaN(prefix) || prefix < 0 || prefix > 32) {
          throw new Error("Invalid CIDR prefix length");
        }

        const ipParts = ip.split('.').map(part => {
          const num = parseInt(part);
          if (isNaN(num) || num < 0 || num > 255) {
            throw new Error(`Invalid IP address part: ${part}`);
          }
          return num;
        });

        if (ipParts.length !== 4) {
          throw new Error("Invalid IP address format");
        }

        // Calculate all subnet information
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const inverseMask = (0xFFFFFFFF >>> prefix);

        const maskOctets = [
          (mask >>> 24) & 0xFF,
          (mask >>> 16) & 0xFF,
          (mask >>> 8) & 0xFF,
          mask & 0xFF
        ];

        const wildcardOctets = [
          inverseMask >>> 24,
          (inverseMask >>> 16) & 0xFF,
          (inverseMask >>> 8) & 0xFF,
          inverseMask & 0xFF
        ];

        const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const networkNum = (ipNum & mask) >>> 0;
        const broadcastNum = (networkNum | inverseMask) >>> 0;

        const networkOctets = [
          (networkNum >>> 24) & 0xFF,
          (networkNum >>> 16) & 0xFF,
          (networkNum >>> 8) & 0xFF,
          networkNum & 0xFF
        ];

        const broadcastOctets = [
          (broadcastNum >>> 24) & 0xFF,
          (broadcastNum >>> 16) & 0xFF,
          (broadcastNum >>> 8) & 0xFF,
          broadcastNum & 0xFF
        ];

        const totalAddresses = Math.pow(2, 32 - prefix);
        const usableAddresses = Math.max(0, totalAddresses - 2);

        // Determine network class
        let networkClass = 'Unknown';
        const firstOctet = networkOctets[0];
        if (firstOctet >= 1 && firstOctet <= 126) networkClass = 'A';
        else if (firstOctet >= 128 && firstOctet <= 191) networkClass = 'B';
        else if (firstOctet >= 192 && firstOctet <= 223) networkClass = 'C';
        else if (firstOctet >= 224 && firstOctet <= 239) networkClass = 'D (Multicast)';
        else if (firstOctet >= 240 && firstOctet <= 255) networkClass = 'E (Reserved)';

        // Check if private
        const isPrivate = (firstOctet === 10) ||
          (firstOctet === 172 && networkOctets[1] >= 16 && networkOctets[1] <= 31) ||
          (firstOctet === 192 && networkOctets[1] === 168);

        return {
          content: [
            {
              type: "text",
              text: `Enhanced IPv4 Subnet Calculation:

Input CIDR: ${cidr}

Network Information:
Network Address: ${networkOctets.join('.')}
Broadcast Address: ${broadcastOctets.join('.')}
Subnet Mask: ${maskOctets.join('.')}
Wildcard Mask: ${wildcardOctets.join('.')}

Address Range:
First Host: ${networkOctets[0]}.${networkOctets[1]}.${networkOctets[2]}.${networkOctets[3] + 1}
Last Host: ${broadcastOctets[0]}.${broadcastOctets[1]}.${broadcastOctets[2]}.${broadcastOctets[3] - 1}

Capacity:
Total Addresses: ${totalAddresses.toLocaleString()}
Usable Host Addresses: ${usableAddresses.toLocaleString()}

Network Properties:
Class: ${networkClass}
Type: ${isPrivate ? 'Private' : 'Public'}
CIDR Prefix: /${prefix}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calculating IPv4 subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
