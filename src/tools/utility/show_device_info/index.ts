import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDeviceInfo(server: McpServer) {
  server.registerTool("show_device_info", {

  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Show Device Info",

      readOnlyHint: true
    }
}, async () => {
      try {
        const info = {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          userAgent: 'IT Tools MCP Server',
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en-US' // Default for server environment
        };

        return {
          content: [
            {
              type: "text",
              text: `Device Information:

Platform: ${info.platform}
Architecture: ${info.arch}
Node.js Version: ${info.nodeVersion}
User Agent: ${info.userAgent}
Current Time: ${info.timestamp}
Timezone: ${info.timezone}
Language: ${info.language}

Note: This is basic server environment information.
For detailed client device info, use a browser-based tool.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting device info: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
