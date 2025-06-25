# Docker Hub Setup Guide

This guide will help you set up automated Docker Hub publishing for your IT Tools MCP Server.

## Prerequisites

1. **Docker Hub Account**: Sign up at [hub.docker.com](https://hub.docker.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Docker Hub Access Token**: Generate from Docker Hub settings

## Step 1: Create Docker Hub Repository

1. Go to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Name: `it-tools-mcp`
4. Description: "Model Context Protocol server providing various IT tools and utilities"
5. Visibility: Public
6. Click "Create"

## Step 2: Generate Docker Hub Access Token

1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Description: "GitHub Actions - it-tools-mcp"
4. Permissions: Read, Write, Delete
5. Copy the generated token (you won't see it again!)

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username (`wrenchpilot`)
   - `DOCKER_PASSWORD`: The access token from Step 2

## Step 4: Test the Setup

### Option A: Push to main branch
```bash
git add .
git commit -m "Add Docker Hub publishing workflow"
git push origin main
```

### Option B: Create a version tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Step 5: Verify the Build

1. Go to your GitHub repository
2. Click on "Actions" tab
3. You should see a workflow running
4. Once complete, check Docker Hub for your published image

## Step 6: Test Your Published Image

```bash
# Pull and test your image
docker pull wrenchpilot/it-tools-mcp:latest
docker run -it --rm wrenchpilot/it-tools-mcp:latest

# Test with a simple command
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker run -i --rm wrenchpilot/it-tools-mcp:latest
```

## Available Commands

### Local Development
```bash
# Build locally
npm run build
docker build -t wrenchpilot/it-tools-mcp:latest .

# Run locally
docker run -it --rm wrenchpilot/it-tools-mcp:latest

# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
# Using docker-compose
docker-compose up -d

# Or direct docker run
docker run -d --name it-tools-mcp --restart unless-stopped wrenchpilot/it-tools-mcp:latest
```

## Versioning Strategy

- **latest**: Automatically built from main branch
- **v1.0.0**: Specific version tags
- **v1.0**: Major.minor tags (automatically created)

## Troubleshooting

### Build Fails
- Check that your code builds locally with `npm run build`
- Verify all dependencies are in package.json
- Check GitHub Actions logs for specific errors

### Docker Hub Login Fails
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set correctly
- Make sure the access token has the right permissions
- Check that the token hasn't expired

### Image Not Found
- Verify the image was pushed successfully in GitHub Actions
- Check Docker Hub repository exists and is public
- Ensure the image name matches exactly: `wrenchpilot/it-tools-mcp`

## Multi-Architecture Support

The workflow builds for both AMD64 and ARM64 architectures, supporting:
- Intel/AMD processors
- Apple Silicon (M1/M2)
- ARM-based servers and devices

## Next Steps

1. **Documentation**: Update your README with usage examples
2. **Testing**: Add comprehensive tests to the workflow
3. **Security**: Scan images for vulnerabilities
4. **Monitoring**: Set up alerts for build failures
5. **Releases**: Create GitHub releases for major versions

## Support

For issues with:
- **Docker Hub**: Check [Docker Hub documentation](https://docs.docker.com/docker-hub/)
- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **This Project**: Open an issue in the GitHub repository
