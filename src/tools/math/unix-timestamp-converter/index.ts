import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUnixTimestampConverter(server: McpServer) {
  server.registerTool("unix-timestamp-converter", {
  description: "Convert between Unix timestamps and human-readable dates",
  inputSchema: {
      input: z.string().describe("Unix timestamp (seconds) or ISO date string")
    }
}, async ({ input }) => {
      try {
        // Auto-detect if input is a timestamp or date string
        const isTimestamp = /^\d+$/.test(input.trim());

        if (isTimestamp) {
          // Convert timestamp to date
          const timestamp = parseInt(input);
          if (isNaN(timestamp)) {
            throw new Error("Invalid timestamp");
          }

          const date = new Date(timestamp * 1000);
          const iso = date.toISOString();
          const local = date.toLocaleString();

          return {
            content: [
              {
                type: "text",
                text: `Timestamp: ${timestamp}\nISO Date: ${iso}\nLocal Date: ${local}`
              }
            ]
          };
        } else {
          // Convert date string to timestamp
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date string");
          }

          const timestamp = Math.floor(date.getTime() / 1000);

          return {
            content: [
              {
                type: "text",
                text: `Date: ${input}\nUnix Timestamp: ${timestamp}`
              }
            ]
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}
