import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerIpv6UlaGenerator(server: McpServer) {
  server.registerTool("generate_ipv6_ula", {
    description: "Generate IPv6 Unique Local Address (ULA) prefix",

  inputSchema: {
      globalId: z.string().optional().describe("Global ID (40 bits in hex, auto-generated if not provided)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Ipv6-ula-generator",

      
      readOnlyHint: false
    }
}, async ({ globalId }) => {
      try {
        // Generate random 40-bit Global ID if not provided
        let gid = globalId;
        if (!gid) {
          const randomBytes = [];
          for (let i = 0; i < 5; i++) {
            randomBytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
          }
          gid = randomBytes.join('');
        }

        // Validate Global ID
        if (!/^[0-9a-fA-F]{10}$/.test(gid)) {
          throw new Error("Global ID must be exactly 10 hexadecimal characters (40 bits)");
        }

        // Format the ULA prefix
        const prefix = `fd${gid.substring(0, 2)}:${gid.substring(2, 6)}:${gid.substring(6, 10)}`;
        const fullPrefix = `${prefix}::/48`;

        // Generate some example subnets
        const subnets = [];
        for (let i = 0; i < 5; i++) {
          const subnetId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
          subnets.push(`${prefix}:${subnetId}::/64`);
        }

        return {
          content: [
            {
              type: "text",
              text: `IPv6 ULA (Unique Local Address) Generated:

ULA Prefix: ${fullPrefix}
Global ID: ${gid}

Example Subnets:
${subnets.map((subnet, i) => `${i + 1}. ${subnet}`).join('\n')}

Properties:
- Scope: Local (not routed on the internet)
- Prefix: fd00::/8 (ULA)
- Global ID: ${gid} (40 bits)
- Subnet ID: 16 bits available
- Interface ID: 64 bits available

Note: ULAs are designed for local communications within a site.
They are not expected to be routable on the global Internet.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating IPv6 ULA: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
