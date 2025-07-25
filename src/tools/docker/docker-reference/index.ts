import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDockerReference(server: McpServer) {
  server.registerTool("docker-reference", {
  description: "Get Docker commands reference and cheatsheet",
  inputSchema: {}
}, async () => {
      const reference = `# Docker Quick Reference

## Installation & Setup
- Docker Desktop: https://docs.docker.com/desktop
- Linux installation: https://docs.docker.com/engine/install/

## Image Commands
\`\`\`bash
# Build image from Dockerfile
docker build -t <image_name> .

# Build without cache
docker build -t <image_name> . --no-cache

# List images
docker images

# Remove image
docker rmi <image_name>

# Remove all unused images
docker image prune

# Pull image from registry
docker pull <image_name>

# Push image to registry
docker push <username>/<image_name>
\`\`\`

## Container Commands
\`\`\`bash
# Run container
docker run <image_name>

# Run with custom name
docker run --name <container_name> <image_name>

# Run with port mapping
docker run -p <host_port>:<container_port> <image_name>

# Run in background (detached)
docker run -d <image_name>

# Run interactively
docker run -it <image_name> /bin/bash

# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop <container_name>

# Start container
docker start <container_name>

# Remove container
docker rm <container_name>

# Execute command in running container
docker exec -it <container_name> <command>
\`\`\`

## Volume Commands
\`\`\`bash
# Create volume
docker volume create <volume_name>

# List volumes
docker volume ls

# Remove volume
docker volume rm <volume_name>

# Mount volume
docker run -v <volume_name>:<container_path> <image_name>

# Bind mount
docker run -v <host_path>:<container_path> <image_name>
\`\`\`

## Network Commands
\`\`\`bash
# List networks
docker network ls

# Create network
docker network create <network_name>

# Connect container to network
docker network connect <network_name> <container_name>

# Disconnect container from network
docker network disconnect <network_name> <container_name>
\`\`\`

## Docker Compose Commands
\`\`\`bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Build services
docker-compose build

# List services
docker-compose ps
\`\`\`

## Cleanup Commands
\`\`\`bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused
docker system prune

# Remove everything including volumes
docker system prune -a --volumes
\`\`\`

## Dockerfile Best Practices
- Use official base images
- Use specific tags instead of 'latest'
- Minimize layers by combining RUN commands
- Use .dockerignore to exclude unnecessary files
- Run as non-root user when possible
- Use multi-stage builds for smaller images

## Useful Flags
- \`-d\`: Detached mode
- \`-it\`: Interactive with TTY
- \`-p\`: Port mapping
- \`-v\`: Volume/bind mount
- \`-e\`: Environment variable
- \`--name\`: Container name
- \`--rm\`: Remove container on exit
- \`--restart\`: Restart policy

## Environment Variables
- \`DOCKER_HOST\`: Docker daemon host
- \`DOCKER_TLS_VERIFY\`: TLS verification
- \`DOCKER_CERT_PATH\`: TLS certificates path

## Registry & Hub
- Docker Hub: https://hub.docker.com
- Login: \`docker login\`
- Logout: \`docker logout\`
- Search: \`docker search <term>\`

## Troubleshooting
- View logs: \`docker logs <container_name>\`
- Inspect container: \`docker inspect <container_name>\`
- Check resource usage: \`docker stats\`
- Access container shell: \`docker exec -it <container_name> /bin/bash\`
`;

      return {
        content: [
          {
            type: "text",
            text: reference,
          },
        ],
      };
    }
  );
}
