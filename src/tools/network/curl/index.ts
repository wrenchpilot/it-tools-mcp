import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCurl(server: McpServer) {
  server.tool(
    "curl",
    "Make HTTP requests (GET, POST, etc.) like curl",
    {
      url: z.string().describe("URL to request"),
      method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"]).default("GET").describe("HTTP method"),
      headers: z.record(z.string()).optional().describe("Request headers (object of key-value pairs)"),
      body: z.string().optional().describe("Request body (for POST/PUT/PATCH)")
    },
    async ({ url, method, headers, body }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          method,
          headers: headers || {},
          body: body && ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();

        return {
          content: [
            { type: "text", text: `Status: ${response.status} ${response.statusText}` },
            { type: "text", text: `Headers:\n${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}` },
            { type: "text", text: `Body:\n${responseText}` }
          ]
        };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { content: [{ type: "text", text: `curl failed: Request timeout (10s)` }] };
        }
        return { content: [{ type: "text", text: `curl failed: ${error.message || error}` }] };
      }
    }
  );
}
