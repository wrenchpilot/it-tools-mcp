# IT Tools MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/wrenchpilot/it-tools-mcp?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/wrenchpilot/it-tools-mcp/latest?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Build Status](https://github.com/wrenchpilot/it-tools-mcp/workflows/Build%20and%20Push%20to%20Docker%20Hub/badge.svg)](https://github.com/wrenchpilot/it-tools-mcp/actions)

A comprehensive Model Context Protocol (MCP) server that provides access to **76 IT tools and utilities** commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## 🚀 Quick Start

```bash
# Pull and run the latest version
docker run -it --rm wrenchpilot/it-tools-mcp:latest

# Or use docker-compose
curl -O https://raw.githubusercontent.com/wrenchpilot/it-tools-mcp/main/docker-compose.yml
docker-compose up
```

### Usage Examples

```bash
# Interactive Mode
docker run -it --rm wrenchpilot/it-tools-mcp:latest

# Generate a UUID
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"uuid-generate","arguments":{}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest

# Encode text to Base64
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"base64-encode","arguments":{"text":"Hello World"}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest
```

## 🛠️ Tool Categories

This MCP server provides **76 tools** across **8 categories**:

- **🔧 Encoding & Decoding** (9 tools): Base64, URL, HTML entities, text-to-binary, Unicode
- **📝 Data Format** (11 tools): JSON, XML, YAML, SQL, TOML, Markdown ↔ HTML conversion
- **🔐 Security & Crypto** (12 tools): Hashing (MD5, SHA1-512), HMAC, JWT, bcrypt, passwords, tokens
- **✨ Text Processing** (16 tools): Case conversion, stats, diff, ASCII art, NATO alphabet, slugify
- **🌐 Network & Web** (8 tools): IPv4/IPv6 subnets, URL parsing, MAC addresses, phone formatting
- **🔢 Math & Calculations** (6 tools): Expression evaluation, base conversion, temperature, percentages
- **🆔 ID & Code Generators** (5 tools): UUID, ULID, QR codes, WiFi QR, SVG placeholders
- **🔧 Development & Utilities** (9 tools): Regex testing, cron expressions, color conversion, MIME types

## 📦 Installation & Setup

### Using with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "it-tools": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "wrenchpilot/it-tools-mcp:latest"]
    }
  }
}
```

### Local Development

```bash
git clone https://github.com/wrenchpilot/it-tools-mcp.git
cd it-tools-mcp
npm install
npm run build
npm start
```

## 💡 Usage Examples

Ask Claude to use these tools:

- **Encoding**: "Base64 encode 'Hello World'" → `SGVsbG8gV29ybGQ=`
- **Hashing**: "Generate SHA256 hash for 'password123'"
- **Formatting**: "Format this JSON: {'name':'John','age':30}"
- **Text**: "Convert 'hello world' to camelCase" → `helloWorld`
- **Security**: "Generate a 16-character password with symbols"
- **Network**: "Calculate subnet info for 192.168.1.0/24"
- **Colors**: "Convert HEX color #FF5733 to RGB" → `rgb(255, 87, 51)`
- **IDs**: "Generate a UUID" → `550e8400-e29b-41d4-a716-446655440000`

## 🔧 Sample Tools

| Category     | Tool                   | Description              |
| ------------ | ---------------------- | ------------------------ |
| **Encoding** | `base64-encode/decode` | Base64 encoding/decoding |
| **Security** | `hash-sha256`          | Generate SHA256 hash     |
| **Text**     | `text-camelcase`       | Convert to camelCase     |
| **Network**  | `ip-subnet-calculator` | Calculate IPv4 subnets   |
| **Math**     | `math-evaluate`        | Evaluate expressions     |
| **IDs**      | `uuid-generate`        | Generate UUID v4         |
| **Data**     | `json-format`          | Format and validate JSON |
| **Utility**  | `color-hex-to-rgb`     | Convert HEX to RGB       |

> **📋 Full Tool List**: See the complete list of all 76 tools with detailed parameters on [GitHub](https://github.com/wrenchpilot/it-tools-mcp#available-tools)

## 🏗️ Architecture

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, showcasing modern AI-assisted software development:

- 🔧 **All 76 tools** designed and implemented with AI assistance
- 📦 **Complete Docker setup** with GitHub Actions CI/CD pipeline
- 🔍 **Schema optimization** with systematic validation cleanup
- 📚 **Comprehensive documentation** and tool catalogs

### Project Structure

```text
src/
├── index.ts              # Main MCP server
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

MIT License - see [LICENSE](https://github.com/wrenchpilot/it-tools-mcp/blob/main/LICENSE) for details.

## 🔗 Links

- **GitHub Repository**: [wrenchpilot/it-tools-mcp](https://github.com/wrenchpilot/it-tools-mcp)
- **Complete Documentation**: [GitHub README](https://github.com/wrenchpilot/it-tools-mcp#readme)
- **Inspired by**: [IT Tools](https://github.com/CorentinTh/it-tools) - online tools for developers
