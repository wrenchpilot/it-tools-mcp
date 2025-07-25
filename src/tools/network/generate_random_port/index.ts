import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRandomPort(server: McpServer) {
  server.registerTool("generate_random_port", {
  description: "Generate random port numbers",
  inputSchema: {
      count: z.number().describe("Number of ports to generate").optional(),
      min: z.number().describe("Minimum port number").optional(),
      max: z.number().describe("Maximum port number").optional(),
      exclude: z.array(z.number()).optional().describe("Ports to exclude"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Random-port",
      description: "Generate random port numbers",
      readOnlyHint: false
    }
}, async ({ count = 1, min = 1024, max = 65535, exclude = [] }) => {
      try {
        const ports: number[] = [];
        const excludeSet = new Set(exclude);

        // Well-known ports to avoid by default
        const wellKnownPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
        wellKnownPorts.forEach(port => excludeSet.add(port));

        for (let i = 0; i < count; i++) {
          let port;
          let attempts = 0;
          do {
            port = Math.floor(Math.random() * (max - min + 1)) + min;
            attempts++;
            if (attempts > 1000) {
              throw new Error("Could not generate unique port after 1000 attempts");
            }
          } while (excludeSet.has(port) || ports.includes(port));

          ports.push(port);
        }

        return {
          content: [
            {
              type: "text",
              text: `Random Ports Generated:

${ports.map((port, i) => `${i + 1}. ${port}`).join('\n')}

Range: ${min} - ${max}
Excluded well-known ports: ${wellKnownPorts.join(', ')}
${exclude.length > 0 ? `Custom excluded: ${exclude.join(', ')}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating random ports: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
