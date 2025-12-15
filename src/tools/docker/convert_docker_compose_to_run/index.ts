import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import yaml from "js-yaml";

export function registerDockerComposeToRun(server: McpServer) {
  server.registerTool("convert_docker_compose_to_run", {

  inputSchema: {
      content: z.string().describe("Docker Compose file content to convert"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Docker Compose To Run",

      readOnlyHint: false
    }
}, async ({ content }) => {
      if (!content?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide a Docker Compose file content to convert",
            },
          ],
        };
      }

      try {
        const parsed = yaml.load(content) as any;

        if (!parsed?.services) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid Docker Compose file: missing services section",
              },
            ],
          };
        }

        const commands: string[] = [];

        for (const [serviceName, service] of Object.entries(parsed.services)) {
          const serviceObj = service as any;
          let command = 'docker run';

          // Add detached mode by default
          command += ' -d';

          // Add name
          command += ` --name ${serviceName}`;

          // Add ports
          if (serviceObj.ports) {
            for (const port of serviceObj.ports) {
              if (typeof port === 'string') {
                command += ` -p ${port}`;
              } else if (typeof port === 'object' && port.published && port.target) {
                command += ` -p ${port.published}:${port.target}`;
              }
            }
          }

          // Add volumes
          if (serviceObj.volumes) {
            for (const volume of serviceObj.volumes) {
              if (typeof volume === 'string') {
                command += ` -v ${volume}`;
              } else if (typeof volume === 'object' && volume.source && volume.target) {
                command += ` -v ${volume.source}:${volume.target}`;
                if (volume.read_only) {
                  command += ':ro';
                }
              }
            }
          }

          // Add environment variables
          if (serviceObj.environment) {
            if (Array.isArray(serviceObj.environment)) {
              for (const env of serviceObj.environment) {
                command += ` -e "${env}"`;
              }
            } else if (typeof serviceObj.environment === 'object') {
              for (const [key, value] of Object.entries(serviceObj.environment)) {
                command += ` -e "${key}=${value}"`;
              }
            }
          }

          // Add restart policy
          if (serviceObj.restart) {
            command += ` --restart ${serviceObj.restart}`;
          }

          // Add networks
          if (serviceObj.networks) {
            if (Array.isArray(serviceObj.networks)) {
              for (const network of serviceObj.networks) {
                command += ` --network ${network}`;
              }
            } else if (typeof serviceObj.networks === 'object') {
              for (const networkName of Object.keys(serviceObj.networks)) {
                command += ` --network ${networkName}`;
              }
            }
          }

          // Add working directory
          if (serviceObj.working_dir) {
            command += ` -w ${serviceObj.working_dir}`;
          }

          // Add user
          if (serviceObj.user) {
            command += ` --user ${serviceObj.user}`;
          }

          // Add image
          if (serviceObj.image) {
            command += ` ${serviceObj.image}`;
          } else {
            command += ` <image-name>`;
          }

          // Add command/entrypoint
          if (serviceObj.command) {
            if (Array.isArray(serviceObj.command)) {
              command += ` ${serviceObj.command.join(' ')}`;
            } else {
              command += ` ${serviceObj.command}`;
            }
          }

          commands.push(command);
        }

        return {
          content: [
            {
              type: "text",
              text: commands.join('\n\n'),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting Docker Compose to run commands: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
