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

export function registerIpRangeToCidr(server: McpServer) {
  server.registerTool("ip-range-to-cidr", {
  description: "Convert IP address range to CIDR notation(s)",
  inputSchema: {
      startIP: z.string().describe("Starting IP address"),
      endIP: z.string().describe("Ending IP address")
    }
}, async ({ startIP, endIP }) => {
      try {
        // Parse IP addresses
        const parseIP = (ip: string): number => {
          const parts = ip.split('.').map(part => {
            const num = parseInt(part);
            if (num < 0 || num > 255) {
              throw new Error(`Invalid IP address: ${ip}`);
            }
            return num;
          });
          
          if (parts.length !== 4) {
            throw new Error(`Invalid IP address format: ${ip}`);
          }
          
          return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
        };

        const formatIP = (ipInt: number): string => {
          return [
            (ipInt >>> 24) & 0xFF,
            (ipInt >>> 16) & 0xFF,
            (ipInt >>> 8) & 0xFF,
            ipInt & 0xFF
          ].join('.');
        };

        const startInt = parseIP(startIP);
        const endInt = parseIP(endIP);

        if (startInt > endInt) {
          throw new Error("Start IP must be less than or equal to end IP");
        }

        // Find CIDR blocks that cover the range
        const cidrs: string[] = [];
        let current = startInt;

        while (current <= endInt) {
          // Find the largest block size that fits
          let prefixLength = 32;
          let blockSize = 1;

          // Find the largest power of 2 that fits in the remaining range
          for (let i = 0; i < 32; i++) {
            const testSize = 1 << i;
            const testPrefix = 32 - i;
            
            // Check if this block size fits and aligns properly
            if (current + testSize - 1 <= endInt && (current & (testSize - 1)) === 0) {
              blockSize = testSize;
              prefixLength = testPrefix;
            } else {
              break;
            }
          }

          // Add this CIDR block
          cidrs.push(`${formatIP(current)}/${prefixLength}`);
          current += blockSize;
        }

        const totalIPs = endInt - startInt + 1;
        
        return {
          content: [{
            type: "text",
            text: `IP Range to CIDR Conversion:

Input Range: ${startIP} - ${endIP}
Total IPs: ${totalIPs.toLocaleString()}

CIDR Blocks (${cidrs.length}):
${cidrs.map((cidr, i) => `${i + 1}. ${cidr}`).join('\n')}

Compact CIDR List:
${cidrs.join(', ')}

Note: Multiple CIDR blocks may be needed to represent arbitrary IP ranges.
Each CIDR block must align to power-of-2 boundaries.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting range to CIDR: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
