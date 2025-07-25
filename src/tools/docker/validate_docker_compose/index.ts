import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import yaml from "js-yaml";

export function registerValidateCompose(server: McpServer) {
  server.registerTool("validate_docker_compose", {
    description: "Validate Docker Compose files for syntax errors, compatibility issues, and best practices. Example: check YAML syntax, service configuration, network setup",
    inputSchema: {
      content: z.string().describe("Docker Compose file content to validate"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Validate Docker Compose",
      description: "Validate Docker Compose syntax and configuration",
      readOnlyHint: false
    }
  }, async ({ content }) => {
      if (!content?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide a Docker Compose file content to validate",
            },
          ],
        };
      }

      try {
        // Try to parse as YAML first
        let parsed: any;
        try {
          parsed = yaml.load(content);
        } catch (yamlError: any) {
          return {
            content: [
              {
                type: "text",
                text: `YAML parsing error: ${yamlError.message}`,
              },
            ],
          };
        }

        if (!parsed || typeof parsed !== 'object') {
          return {
            content: [
              {
                type: "text",
                text: "Invalid Docker Compose file: must be a valid YAML object",
              },
            ],
          };
        }

        const errors: string[] = [];

        // Basic Docker Compose validation
        if (!parsed.version && !parsed.services) {
          errors.push('Missing required "version" or "services" field');
        }

        if (parsed.services && typeof parsed.services !== 'object') {
          errors.push('"services" field must be an object');
        }

        if (parsed.services) {
          for (const [serviceName, service] of Object.entries(parsed.services)) {
            if (typeof service !== 'object' || service === null) {
              errors.push(`Service "${serviceName}" must be an object`);
              continue;
            }

            const serviceObj = service as any;
            
            // Check for common required fields or patterns
            if (!serviceObj.image && !serviceObj.build && !serviceObj.dockerfile) {
              errors.push(`Service "${serviceName}" must specify either "image", "build", or "dockerfile"`);
            }

            // Validate ports format
            if (serviceObj.ports) {
              if (!Array.isArray(serviceObj.ports)) {
                errors.push(`Service "${serviceName}": ports must be an array`);
              } else {
                for (const port of serviceObj.ports) {
                  if (typeof port === 'string') {
                    if (!/^\d+(:\d+)?$/.test(port.replace(/^["']|["']$/g, ''))) {
                      errors.push(`Service "${serviceName}": invalid port format "${port}"`);
                    }
                  } else if (typeof port === 'object' && port !== null) {
                    const portObj = port as any;
                    if (!portObj.target && !portObj.published) {
                      errors.push(`Service "${serviceName}": port object must have "target" or "published" field`);
                    }
                  }
                }
              }
            }

            // Validate volumes format
            if (serviceObj.volumes && !Array.isArray(serviceObj.volumes)) {
              errors.push(`Service "${serviceName}": volumes must be an array`);
            }

            // Validate environment format
            if (serviceObj.environment) {
              if (!Array.isArray(serviceObj.environment) && typeof serviceObj.environment !== 'object') {
                errors.push(`Service "${serviceName}": environment must be an array or object`);
              }
            }
          }
        }

        // Check for valid compose file versions
        if (parsed.version) {
          const validVersions = ['2', '2.0', '2.1', '2.2', '2.3', '2.4', '3', '3.0', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9'];
          if (!validVersions.includes(parsed.version.toString())) {
            errors.push(`Unknown Docker Compose version: ${parsed.version}`);
          }
        }

        const resultText = errors.length === 0 
          ? 'Docker Compose file is valid!' 
          : `Validation errors found:\n${errors.map(error => `• ${error}`).join('\n')}`;

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error validating Docker Compose file: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
