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

export function registerIpSubnetCalculator(server: McpServer) {
  server.registerTool("ip-subnet-calculator", {
  description: "Calculate subnet information for IPv4",
  inputSchema: {
      ip: z.string().describe("IPv4 address (e.g., 192.168.1.1)"),
      cidr: z.number().describe("CIDR notation (e.g., 24)"),
    }
}, async ({ ip, cidr }) => {
      try {
        if (cidr < 1 || cidr > 32) {
          return {
            content: [
              {
                type: "text",
                text: "CIDR must be between 1 and 32.",
              },
            ],
          };
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

        // Calculate subnet mask
        const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
        const maskParts = [
          (mask >>> 24) & 0xFF,
          (mask >>> 16) & 0xFF,
          (mask >>> 8) & 0xFF,
          mask & 0xFF
        ];

        // Calculate network address
        const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const networkNum = (ipNum & mask) >>> 0;
        const networkParts = [
          (networkNum >>> 24) & 0xFF,
          (networkNum >>> 16) & 0xFF,
          (networkNum >>> 8) & 0xFF,
          networkNum & 0xFF
        ];

        // Calculate broadcast address
        const broadcastNum = (networkNum | (0xFFFFFFFF >>> cidr)) >>> 0;
        const broadcastParts = [
          (broadcastNum >>> 24) & 0xFF,
          (broadcastNum >>> 16) & 0xFF,
          (broadcastNum >>> 8) & 0xFF,
          broadcastNum & 0xFF
        ];

        // Calculate first and last usable addresses
        const firstUsableNum = networkNum + 1;
        const lastUsableNum = broadcastNum - 1;
        const firstUsableParts = [
          (firstUsableNum >>> 24) & 0xFF,
          (firstUsableNum >>> 16) & 0xFF,
          (firstUsableNum >>> 8) & 0xFF,
          firstUsableNum & 0xFF
        ];
        const lastUsableParts = [
          (lastUsableNum >>> 24) & 0xFF,
          (lastUsableNum >>> 16) & 0xFF,
          (lastUsableNum >>> 8) & 0xFF,
          lastUsableNum & 0xFF
        ];

        const totalHosts = Math.pow(2, 32 - cidr);
        const usableHosts = totalHosts - 2;

        return {
          content: [
            {
              type: "text",
              text: `IPv4 Subnet Information:

Input: ${ip}/${cidr}

Network Address: ${networkParts.join('.')}
Subnet Mask: ${maskParts.join('.')}
Broadcast Address: ${broadcastParts.join('.')}
First Usable: ${firstUsableParts.join('.')}
Last Usable: ${lastUsableParts.join('.')}

Total Addresses: ${totalHosts}
Usable Addresses: ${usableHosts}
CIDR: /${cidr}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calculating subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
