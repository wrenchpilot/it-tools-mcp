import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import yaml from "js-yaml";

export function registerDockerRunToCompose(server: McpServer) {
  server.registerTool("convert_docker_run_to_compose", {

  inputSchema: {
      commands: z.string().describe("Docker run commands to convert (one per line)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Docker Run To Compose",

      readOnlyHint: false
    }
}, async ({ commands }) => {
      if (!commands?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide docker run commands to convert",
            },
          ],
        };
      }

      try {
        const lines = commands.split('\n').filter(line => line.trim());
        const services: any = {};

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('docker run')) {
            continue;
          }

          // Parse docker run command
          const args = trimmedLine.split(/\s+/);
          let serviceName = 'app';
          const service: any = {};

          for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            switch (arg) {
              case '--name':
                serviceName = args[++i];
                break;
              case '-p':
                const portMapping = args[++i];
                if (!service.ports) service.ports = [];
                service.ports.push(portMapping);
                break;
              case '-v':
                const volumeMapping = args[++i];
                if (!service.volumes) service.volumes = [];
                service.volumes.push(volumeMapping);
                break;
              case '-e':
                const envVar = args[++i];
                if (!service.environment) service.environment = [];
                service.environment.push(envVar);
                break;
              case '--restart':
                service.restart = args[++i];
                break;
              case '--network':
                const networkName = args[++i];
                if (!service.networks) service.networks = [];
                service.networks.push(networkName);
                break;
              case '-w':
                service.working_dir = args[++i];
                break;
              case '--user':
                service.user = args[++i];
                break;
              case '-d':
                // Detached mode is default in compose
                break;
              default:
                // Check if this is the image name (no dashes and not a flag value)
                if (!arg.startsWith('-') && i > 1 && !args[i-1].startsWith('-')) {
                  if (!service.image && (arg.includes('/') || arg.includes(':') || !arg.includes(' '))) {
                    service.image = arg;
                  }
                }
                break;
            }
          }

          // If no image found, try to extract from the end
          if (!service.image) {
            const lastArgs = args.slice(-3);
            for (const arg of lastArgs) {
              if (!arg.startsWith('-') && (arg.includes('/') || arg.includes(':'))) {
                service.image = arg;
                break;
              }
            }
          }

          services[serviceName] = service;
        }

        const compose = {
          version: '3.8',
          services
        };

        return {
          content: [
            {
              type: "text",
              text: yaml.dump(compose),
            },
          ],
        };

      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting docker run to Docker Compose: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
