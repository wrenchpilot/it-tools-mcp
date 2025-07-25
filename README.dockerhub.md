# IT Tools MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/wrenchpilot/it-tools-mcp?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/wrenchpilot/it-tools-mcp/latest?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![NPM Version](https://img.shields.io/npm/v/it-tools-mcp?color=blue)](https://www.npmjs.com/package/it-tools-mcp)
[![NPM Downloads](https://img.shields.io/npm/dm/it-tools-mcp?color=green)](https://www.npmjs.com/package/it-tools-mcp)
[![GitHub Release](https://img.shields.io/github/v/release/wrenchpilot/it-tools-mcp?include_prereleases&sort=semver)](https://github.com/wrenchpilot/it-tools-mcp/releases)
[![License](https://img.shields.io/github/license/wrenchpilot/it-tools-mcp)](https://github.com/wrenchpilot/it-tools-mcp/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/wrenchpilot/it-tools-mcp)](https://github.com/wrenchpilot/it-tools-mcp/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/wrenchpilot/it-tools-mcp)](https://github.com/wrenchpilot/it-tools-mcp/commits/main)
[![Docker Platform](https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-blue)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![GitHub Stars](https://img.shields.io/github/stars/wrenchpilot/it-tools-mcp?style=social)](https://github.com/wrenchpilot/it-tools-mcp/stargazers)

A comprehensive Model Context Protocol (MCP) server that provides access to over **100 IT tools and utilities** commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## Using with VS Code

Add to your VS Code `settings.json`:

### Node

```json
{
  "mcp": {
    "servers": {
      "it-tools": {
        "command": "npx",
        "args": [
          "it-tools-mcp"
        ],
        "env": {}
      }
    }
  }
}
```

#### Docker

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

See the complete list of tools with detailed parameters on [GitHub](https://github.com/wrenchpilot/it-tools-mcp#available-tools)

## 📸 Examples in Action

### Password Hash Generation

![Password Hash Example](https://raw.githubusercontent.com/wrenchpilot/it-tools-mcp/master/screenshots/password-hash-example.png)

### ASCII Art Text Generation  

![ASCII Art Text Example](https://raw.githubusercontent.com/wrenchpilot/it-tools-mcp/master/screenshots/ascii-art-text-example.png)

#### Examples of using the IT Tools MCP server with VS Code Copilot Chat

## 🏗️ Architecture

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, showcasing modern AI-assisted software development:

- 🔧 **All 112 tools** designed and implemented with AI assistance
- 📦 **Complete Docker setup** with GitHub Actions CI/CD pipeline
- 🔍 **Schema optimization** with systematic validation cleanup
- 📚 **Comprehensive documentation** and tool catalogs

### Project Structure

```text
src/
├── index.ts              # Main MCP server with dynamic tool loading
└── tools/                # Modular tool categories
    ├── ansible/          # 5 Ansible automation tools
    ├── color/            # 2 Color conversion tools
    ├── crypto/           # 9 Cryptographic & security tools
    ├── dataFormat/       # 12 Data format conversion tools
    ├── development/      # 6 Development utilities
    ├── docker/           # 5 Docker & containerization tools
    ├── encoding/         # 8 Encoding/decoding tools
    ├── forensic/         # 3 Digital forensics tools
    ├── idGenerators/     # 4 ID & code generation tools
    ├── math/             # 6 Mathematical operation tools
    ├── network/          # 23 Network utilities
    ├── physics/          # 3 Physics calculation tools
    ├── text/             # 19 Text manipulation tools
    └── utility/          # 7 General utility tools
```

### Adding New Tools

1. Create a tool directory in appropriate category under `src/tools/`
2. Define tool with input schema using Zod in its `index.ts`
3. Export registration function for dynamic loading
4. Rebuild with `npm run build`

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request on [GitHub](https://github.com/wrenchpilot/it-tools-mcp).

## 📄 License

MIT License - see [LICENSE](https://github.com/wrenchpilot/it-tools-mcp/blob/master/LICENSE) for details.

## 🔗 Links

- **GitHub Repository**: [wrenchpilot/it-tools-mcp](https://github.com/wrenchpilot/it-tools-mcp)
- **Complete Documentation**: [GitHub README](https://github.com/wrenchpilot/it-tools-mcp#readme)
- **Inspired by**: [IT Tools](https://github.com/CorentinTh/it-tools) - online tools for developers
- **Enhanced by**: [sharevb fork](https://github.com/sharevb/it-tools) - incorporates select tools with additional utilities
