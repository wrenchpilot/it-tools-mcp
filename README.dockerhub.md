# IT Tools MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/wrenchpilot/it-tools-mcp?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/wrenchpilot/it-tools-mcp/latest?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Build Status](https://github.com/wrenchpilot/it-tools-mcp/workflows/Build%20and%20Push%20to%20Docker%20Hub/badge.svg)](https://github.com/wrenchpilot/it-tools-mcp/actions)

A comprehensive Model Context Protocol (MCP) server that provides access to **86 IT tools and utilities** commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## Using with VS Code

Add to your VS Code `settings.json`:

*Node*

```json
{
  "mcp": {
    "servers": {
      "it-tools": {
        "command": "npx",
        "args": [
          "-y",
          "wrenchpilot/it-tools-mcp"
        ],
        "env": {}
      }
    }
  }
}
```

*Docker*

```json
{
  "mcp": {
    "servers": {
      "it-tools": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "--init",
          "--security-opt", "no-new-privileges:true",
          "--cap-drop", "ALL",
          "--read-only",
          "--user", "1001:1001",
          "--memory=256m",
          "--cpus=0.5",
          "--name", "it-tools-mcp",
          "wrenchpilot/it-tools-mcp:latest"
        ]
      }
  }
}
```

See the complete list of all 86 tools with detailed parameters on [GitHub](https://github.com/wrenchpilot/it-tools-mcp#available-tools)

## 📸 Examples in Action

### Password Hash Generation
![Password Hash Example](https://raw.githubusercontent.com/wrenchpilot/it-tools-mcp/master/screenshots/password-hash-example.png)

### ASCII Art Text Generation  
![ASCII Art Text Example](https://raw.githubusercontent.com/wrenchpilot/it-tools-mcp/master/screenshots/ascii-art-text-example.png)

*Examples of using the IT Tools MCP server with VS Code Copilot Chat*

## 🏗️ Architecture

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, showcasing modern AI-assisted software development:

- 🔧 **All 86 tools** designed and implemented with AI assistance
- 📦 **Complete Docker setup** with GitHub Actions CI/CD pipeline
- 🔍 **Schema optimization** with systematic validation cleanup
- 📚 **Comprehensive documentation** and tool catalogs

### Project Structure

```text
src/
├── index.ts              # Main MCP server
├── security.ts           # Security settings
└── tools/                # Tool modules by category
    ├── encoding.ts       # Base64, URL, HTML encoding
    ├── crypto.ts         # Hashing, JWT, passwords
    ├── dataFormat.ts     # JSON, XML, YAML processing
    ├── text.ts           # Text manipulation tools
    ├── network.ts        # Network utilities
    ├── math.ts           # Mathematical operations
    ├── idGenerators.ts   # UUID, ULID, QR codes
    └── utility.ts        # Color, MIME, HTTP tools
```

### Adding New Tools

1. Choose/create a tool module in `src/tools/`
2. Define tool with input schema using Zod
3. Register in `src/index.ts`
4. Rebuild with `npm run build`

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request on [GitHub](https://github.com/wrenchpilot/it-tools-mcp).

## 📄 License

MIT License - see [LICENSE](https://github.com/wrenchpilot/it-tools-mcp/blob/master/LICENSE) for details.

## 🔗 Links

- **GitHub Repository**: [wrenchpilot/it-tools-mcp](https://github.com/wrenchpilot/it-tools-mcp)
- **Complete Documentation**: [GitHub README](https://github.com/wrenchpilot/it-tools-mcp#readme)
- **Inspired by**: [IT Tools](https://github.com/CorentinTh/it-tools) - online tools for developers
