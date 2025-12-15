import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTelnet(server: McpServer) {
  server.registerTool("telnet", {

  inputSchema: {
      target: z.string().describe("Host to connect to"),
      port: z.number().describe("Port number")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Telnet",

      readOnlyHint: false
    }
}, async ({ target, port }) => {
      return new Promise(async (resolve) => {
        try {
          const net = (await import('net')).default;
          const socket = new net.Socket();
          let connected = false;
          let banner = '';
          socket.setTimeout(2000);
          socket.connect(port, target, () => {
            connected = true;
          });
          socket.on('data', (data: Buffer) => {
            banner += data.toString();
            // If we get a banner, close immediately
            socket.end();
          });
          socket.on('timeout', () => {
            socket.destroy();
            if (!connected) {
              resolve({ content: [{ type: "text", text: `Telnet failed: Connection timed out` }] });
            } else {
              resolve({ content: [{ type: "text", text: `Telnet to ${target}:${port} succeeded.${banner ? '\nBanner: ' + banner.trim() : ''}` }] });
            }
          });
          socket.on('error', (err: Error) => {
            resolve({ content: [{ type: "text", text: `Telnet failed: ${err.message}` }] });
          });
          socket.on('close', (hadError: boolean) => {
            if (connected) {
              resolve({ content: [{ type: "text", text: `Telnet to ${target}:${port} succeeded.${banner ? '\nBanner: ' + banner.trim() : ''}` }] });
            }
          });
        } catch (error) {
          resolve({ content: [{ type: "text", text: `Telnet failed: ${error instanceof Error ? error.message : error}` }] });
        }
      });
    }
  );
}
