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

export function registerIpv6SubnetCalculator(server: McpServer) {
  server.tool(
    "ipv6-subnet-calculator",
    "Calculate IPv6 subnet information",
    {
      ipv6: z.string().describe("IPv6 address and prefix (e.g., 2001:db8::/32)"),
      newPrefix: z.number().optional().describe("New prefix length for subnetting")
    },
    async ({ ipv6, newPrefix }) => {
      try {
        const [address, prefixStr] = ipv6.split('/');
        if (!address || !prefixStr) {
          throw new Error("Invalid IPv6 format. Use format: address/prefix");
        }

        const prefix = parseInt(prefixStr);
        if (prefix < 0 || prefix > 128) {
          throw new Error("Prefix length must be between 0 and 128");
        }

        // Expand IPv6 address to full form
        const expandIPv6 = (addr: string): string => {
          // Handle :: notation
          const parts = addr.split('::');
          if (parts.length === 2) {
            const left = parts[0] ? parts[0].split(':') : [];
            const right = parts[1] ? parts[1].split(':') : [];
            const missing = 8 - left.length - right.length;
            const middle = Array(missing).fill('0000');
            return [...left, ...middle, ...right].map(part => part.padStart(4, '0')).join(':');
          } else {
            return addr.split(':').map(part => part.padStart(4, '0')).join(':');
          }
        };

        const fullAddress = expandIPv6(address);
        const parts = fullAddress.split(':');
        
        if (parts.length !== 8) {
          throw new Error("Invalid IPv6 address format");
        }

        // Calculate network portion
        const networkBits = prefix;
        const hostBits = 128 - prefix;
        
        // Create network address
        const networkParts = [...parts];
        const bytesToClear = Math.floor((128 - prefix) / 16);
        const partialBits = (128 - prefix) % 16;
        
        // Clear host portion
        for (let i = 8 - bytesToClear; i < 8; i++) {
          networkParts[i] = '0000';
        }
        
        if (partialBits > 0) {
          const partIndex = 8 - bytesToClear - 1;
          const mask = (0xFFFF << partialBits) & 0xFFFF;
          const value = parseInt(networkParts[partIndex], 16) & mask;
          networkParts[partIndex] = value.toString(16).padStart(4, '0');
        }

        const networkAddr = networkParts.join(':');
        
        // Calculate some common subnet sizes if newPrefix is provided
        let subnetInfo = '';
        if (newPrefix && newPrefix > prefix) {
          const subnetBits = newPrefix - prefix;
          const numSubnets = Math.pow(2, subnetBits);
          const hostsPerSubnet = Math.pow(2, 128 - newPrefix);
          
          subnetInfo = `\nSubnetting to /${newPrefix}:
• Subnet bits borrowed: ${subnetBits}
• Number of subnets: ${numSubnets.toLocaleString()}
• Hosts per subnet: ${hostsPerSubnet.toExponential(2)}`;
        }

        const totalHosts = Math.pow(2, hostBits);

        return {
          content: [{
            type: "text",
            text: `IPv6 Subnet Calculator Results:

Input: ${ipv6}
Full Address: ${fullAddress}

Network Information:
• Network Address: ${networkAddr}/${prefix}
• Prefix Length: /${prefix}
• Network Bits: ${networkBits}
• Host Bits: ${hostBits}
• Total Addresses: 2^${hostBits} (${totalHosts.toExponential(2)})

Address Format:
• Compressed: ${networkAddr.replace(/(:0000)+/g, '::').replace(/^0+|:0+/g, ':').replace(/^:/, '').replace(/:$/, '') || '::'}/${prefix}
• Full: ${networkAddr}/${prefix}

${subnetInfo}

IPv6 Address Types:
• Global Unicast: 2000::/3
• Link-Local: fe80::/10
• Unique Local: fc00::/7
• Multicast: ff00::/8`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error calculating IPv6 subnet: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
