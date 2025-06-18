# Docker Usage Guide for IT Tools MCP Server

This document provides instructions for building, running, and using the IT Tools MCP Server with Docker.

## Quick Start

### Build the Docker Image

```bash
docker build -t it-tools-mcp .
```

### Run with Docker

```bash
# Interactive mode (for testing)
docker run -i --rm it-tools-mcp

# With input piped from file
cat input.jsonl | docker run -i --rm it-tools-mcp

# One-liner test
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | docker run -i --rm it-tools-mcp
```

### Run with Docker Compose

```bash
# Build and run
docker-compose up --build

# Run with input
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | docker-compose run --rm -T it-tools-mcp
```

## Available Commands

### NPM Scripts for Docker

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## Example Usage

### 1. Initialize the Server

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | docker run -i --rm it-tools-mcp
```

### 2. List Available Tools

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}' | docker run -i --rm it-tools-mcp
```

### 3. Use a Tool (Base64 Encoding)

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "base64-encode", "arguments": {"text": "Hello World!"}}}' | docker run -i --rm it-tools-mcp
```

### 4. Generate a Password

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "password-generate", "arguments": {"length": 20, "includeSymbols": true}}}' | docker run -i --rm it-tools-mcp
```

## Available Tools

The following tools are available in the container:

- **Encoding/Decoding**: `base64-encode`, `base64-decode`, `url-encode`, `url-decode`, `html-encode`, `html-decode`
- **JSON Tools**: `json-format`, `json-minify`
- **Hashing**: `hash-md5`, `hash-sha1`, `hash-sha256`, `hash-sha512`
- **Text Conversion**: `text-uppercase`, `text-lowercase`, `text-capitalize`, `text-camelcase`, `text-pascalcase`, `text-kebabcase`, `text-snakecase`
- **Utilities**: `uuid-generate`, `password-generate`, `timestamp-convert`, `text-stats`

## Integration with MCP Clients

To use this server with MCP clients, configure the client to run the Docker container:

### VS Code MCP Configuration

Add to your VS Code MCP configuration:

```json
{
  "mcpServers": {
    "it-tools": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "it-tools-mcp"]
    }
  }
}
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "it-tools": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "it-tools-mcp"]
    }
  }
}
```

## Docker Image Details

- **Base Image**: Node.js 18 Alpine Linux
- **Size**: Optimized for production with only runtime dependencies
- **Security**: Runs as non-root user (`nodejs`)
- **Health Check**: Built-in health check for monitoring
- **Port**: 3000 (for documentation, MCP uses stdio)

## Troubleshooting

### Common Issues

1. **Permission denied**: Make sure Docker is running and you have permissions
2. **Image not found**: Run `docker build -t it-tools-mcp .` first
3. **TTY issues**: Use `-T` flag with docker-compose: `docker-compose run --rm -T it-tools-mcp`

### Debugging

To debug the container:

```bash
# Run with shell
docker run -it --rm --entrypoint=/bin/sh it-tools-mcp

# Check logs
docker logs <container_id>
```

## Performance

The Docker container is optimized for:
- Fast startup time
- Minimal memory footprint
- Secure execution environment
- Easy deployment and scaling
