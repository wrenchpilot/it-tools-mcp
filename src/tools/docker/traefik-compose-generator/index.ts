import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import yaml from "js-yaml";

export function registerTraefikComposeGenerator(server: McpServer) {
  server.tool(
    "traefik-compose-generator",
    "Generate Traefik Docker Compose configuration",
    {
      domain: z.string().optional().describe("Domain for Traefik services (default: example.com)"),
      email: z.string().optional().describe("Email for Let's Encrypt (default: admin@example.com)"),
      network: z.string().optional().describe("Docker network name (default: traefik)"),
      serviceName: z.string().optional().describe("Example service name (default: webapp)"),
      serviceImage: z.string().optional().describe("Example service image (default: nginx:latest)"),
    },
    async ({ domain = 'example.com', email = 'admin@example.com', network = 'traefik', serviceName = 'webapp', serviceImage = 'nginx:latest' }) => {
      try {
        const compose = {
          version: '3.8',
          services: {
            traefik: {
              image: 'traefik:v2.9',
              container_name: 'traefik',
              command: [
                '--api=true',
                '--api.dashboard=true',
                '--api.insecure=true',
                '--providers.docker=true',
                '--providers.docker.exposedbydefault=false',
                '--entrypoints.web.address=:80',
                '--entrypoints.websecure.address=:443',
                '--certificatesresolvers.letsencrypt.acme.httpchallenge=true',
                '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web',
                `--certificatesresolvers.letsencrypt.acme.email=${email}`,
                '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
              ],
              labels: [
                'traefik.enable=true',
                `traefik.http.routers.traefik.rule=Host(\`traefik.${domain}\`)`,
                'traefik.http.routers.traefik.entrypoints=websecure',
                'traefik.http.routers.traefik.tls.certresolver=letsencrypt',
                'traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https',
                'traefik.http.routers.redirect-https.rule=hostregexp(`{host:.+}`)',
                'traefik.http.routers.redirect-https.entrypoints=web',
                'traefik.http.routers.redirect-https.middlewares=redirect-to-https'
              ],
              ports: [
                '80:80',
                '443:443',
                '8080:8080'
              ],
              volumes: [
                './letsencrypt:/letsencrypt',
                '/var/run/docker.sock:/var/run/docker.sock:ro'
              ],
              networks: [network]
            }
          },
          networks: {
            [network]: {
              external: true
            }
          }
        };

        // Add example service if provided
        if (serviceName && serviceImage) {
          (compose.services as any)[serviceName] = {
            image: serviceImage,
            labels: [
              'traefik.enable=true',
              `traefik.http.routers.${serviceName}.rule=Host(\`${serviceName}.${domain}\`)`,
              `traefik.http.routers.${serviceName}.entrypoints=websecure`,
              `traefik.http.routers.${serviceName}.tls.certresolver=letsencrypt`
            ],
            networks: [network]
          };
        }

        const result = yaml.dump(compose);

        return {
          content: [
            {
              type: "text",
              text: `# Traefik Docker Compose Configuration
# 1. Create the network: docker network create ${network}
# 2. Run: docker-compose up -d
# 3. Access Traefik dashboard at: http://localhost:8080

${result}`,
            },
          ],
        };

      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating Traefik compose: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
