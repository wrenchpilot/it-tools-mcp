# IT Tools MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/wrenchpilot/it-tools-mcp?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/wrenchpilot/it-tools-mcp/latest?refresh=1)](https://hub.docker.com/r/wrenchpilot/it-tools-mcp)
[![Build Status](https://github.com/wrenchpilot/it-tools-mcp/workflows/Build%20and%20Push%20to%20Docker%20Hub/badge.svg)](https://github.com/wrenchpilot/it-tools-mcp/actions)

> **📝 Note**: A condensed version of this README is automatically synced to [Docker Hub](https://hub.docker.com/r/wrenchpilot/it-tools-mcp) due to character limits.

A comprehensive Model Context Protocol (MCP) server that provides access to 75 IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## 📦 Installation & Setup

### Using with VS Code

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
          "@wrenchpilot/it-tools-mcp"
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

#### Interactive Mode

```bash
docker run -it --rm wrenchpilot/it-tools-mcp:latest
```

#### Programmatic Usage

```bash
# Generate a UUID
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"uuid-generate","arguments":{}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest

# Encode text to Base64
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"base64-encode","arguments":{"text":"Hello World"}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest
```

## 🛠️ Tool Categories

This MCP server provides **75 tools** across **8 categories**:

- **🔧 Encoding & Decoding** (9 tools): Base64, URL, HTML entities, text-to-binary, Unicode
- **📝 Data Format** (11 tools): JSON, XML, YAML, SQL, TOML, Markdown ↔ HTML conversion
- **🔐 Security & Crypto** (12 tools): Hashing (MD5, SHA1-512), HMAC, JWT, bcrypt, passwords, tokens
- **✨ Text Processing** (16 tools): Case conversion, stats, diff, ASCII art, NATO alphabet, slugify
- **🌐 Network & Web** (8 tools): IPv4/IPv6 subnets, URL parsing, MAC addresses, phone formatting
- **🔢 Math & Calculations** (6 tools): Expression evaluation, base conversion, temperature, percentages
- **🆔 ID & Code Generators** (4 tools): UUID, ULID, QR codes, SVG placeholders
- **🔧 Development & Utilities** (9 tools): Regex testing, cron expressions, color conversion, MIME types

## 📸 Screenshot Examples

### Password Hash Generation Example

![Password Hash Example](screenshots/password-hash-example.png)

### ASCII Art Text Generation Example

![ASCII Art Text Example](screenshots/ascii-art-text-example.png)

*Examples of using the IT Tools MCP server with VS Code Copilot Chat for secure password hashing and creative ASCII art generation*

## Available Tools

| Tool                        | Description                            | Parameters                                                                                                                                                                                                |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Encoding & Decoding**     |                                        |                                                                                                                                                                                                           |
| `base64-encode`             | Encode text to Base64                  | `text: string`                                                                                                                                                                                            |
| `base64-decode`             | Decode Base64 text                     | `text: string`                                                                                                                                                                                            |
| `url-encode`                | URL encode text                        | `text: string`                                                                                                                                                                                            |
| `url-decode`                | URL decode text                        | `text: string`                                                                                                                                                                                            |
| `html-encode`               | Encode HTML entities                   | `text: string`                                                                                                                                                                                            |
| `html-decode`               | Decode HTML entities                   | `text: string`                                                                                                                                                                                            |
| `html-entities-extended`    | Extended HTML entity encoding/decoding | `text: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                         |
| `text-to-binary`            | Convert text to binary and vice versa  | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| `text-to-unicode`           | Convert text to Unicode and vice versa | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| **Data Format**             |                                        |                                                                                                                                                                                                           |
| `json-format`               | Format and validate JSON               | `json: string`, `indent?: number`                                                                                                                                                                         |
| `json-minify`               | Minify JSON                            | `json: string`                                                                                                                                                                                            |
| `json-to-csv`               | Convert JSON to CSV                    | `json: string`, `delimiter?: string`                                                                                                                                                                      |
| `json-to-toml`              | Convert JSON to TOML                   | `json: string`                                                                                                                                                                                            |
| `json-diff`                 | Compare JSON objects                   | `json1: string`, `json2: string`                                                                                                                                                                          |
| `xml-format`                | Format XML                             | `xml: string`, `indent?: number`                                                                                                                                                                          |
| `yaml-format`               | Format YAML                            | `yaml: string`                                                                                                                                                                                            |
| `sql-format`                | Format SQL                             | `sql: string`                                                                                                                                                                                             |
| `toml-to-json`              | Convert TOML to JSON                   | `toml: string`                                                                                                                                                                                            |
| `markdown-to-html`          | Convert Markdown to HTML               | `markdown: string`                                                                                                                                                                                        |
| `html-to-markdown`          | Convert HTML to Markdown               | `html: string`                                                                                                                                                                                            |
| **Security & Crypto**       |                                        |                                                                                                                                                                                                           |
| `hash-md5`                  | Generate MD5 hash                      | `text: string`                                                                                                                                                                                            |
| `hash-sha1`                 | Generate SHA1 hash                     | `text: string`                                                                                                                                                                                            |
| `hash-sha256`               | Generate SHA256 hash                   | `text: string`                                                                                                                                                                                            |
| `hash-sha512`               | Generate SHA512 hash                   | `text: string`                                                                                                                                                                                            |
| `hmac-generator`            | Generate HMAC                          | `message: string`, `key: string`, `algorithm?: 'sha1' \| 'sha256' \| 'sha512'`                                                                                                                            |
| `jwt-decode`                | Decode JWT token                       | `token: string`                                                                                                                                                                                           |
| `basic-auth-generator`      | Generate Basic Auth header             | `username: string`, `password: string`                                                                                                                                                                    |
| `bcrypt-hash`               | Generate/verify bcrypt hash            | `password: string`, `rounds?: number`, `hash?: string`                                                                                                                                                    |
| `bip39-generate`            | Generate BIP39 mnemonic                | `wordCount?: '12' \| '15' \| '18' \| '21' \| '24'`                                                                                                                                                        |
| `password-generate`         | Generate secure password               | `length?: number`, `includeUppercase?: boolean`, `includeLowercase?: boolean`, `includeNumbers?: boolean`, `includeSymbols?: boolean`                                                                     |
| `token-generator`           | Generate secure token                  | `length?: number`, `charset?: 'alphanumeric' \| 'hex' \| 'base64' \| 'custom'`, `customChars?: string`                                                                                                    |
| `otp-code-generator`        | Generate TOTP codes                    | `secret: string`, `digits?: number`, `period?: number`                                                                                                                                                    |
| **Text Processing**         |                                        |                                                                                                                                                                                                           |
| `text-uppercase`            | Convert to uppercase                   | `text: string`                                                                                                                                                                                            |
| `text-lowercase`            | Convert to lowercase                   | `text: string`                                                                                                                                                                                            |
| `text-capitalize`           | Capitalize words                       | `text: string`                                                                                                                                                                                            |
| `text-camelcase`            | Convert to camelCase                   | `text: string`                                                                                                                                                                                            |
| `text-pascalcase`           | Convert to PascalCase                  | `text: string`                                                                                                                                                                                            |
| `text-kebabcase`            | Convert to kebab-case                  | `text: string`                                                                                                                                                                                            |
| `text-snakecase`            | Convert to snake_case                  | `text: string`                                                                                                                                                                                            |
| `text-stats`                | Get text statistics                    | `text: string`                                                                                                                                                                                            |
| `text-diff`                 | Compare texts                          | `text1: string`, `text2: string`                                                                                                                                                                          |
| `ascii-art-text`            | Generate ASCII art                     | `text: string`, `font?: string` (supports 295+ figlet fonts)                                                                                                                                              |
| `text-to-nato-alphabet`     | Convert to NATO alphabet               | `text: string`                                                                                                                                                                                            |
| `string-obfuscator`         | Obfuscate text                         | `text: string`, `method?: 'html-entities' \| 'unicode' \| 'base64'`                                                                                                                                       |
| `slugify-string`            | Convert to URL slug                    | `text: string`, `separator?: string`, `lowercase?: boolean`                                                                                                                                               |
| `lorem-ipsum-generator`     | Generate Lorem Ipsum                   | `type?: 'words' \| 'sentences' \| 'paragraphs'`, `count?: number`                                                                                                                                         |
| `numeronym-generator`       | Generate numeronyms                    | `text: string`                                                                                                                                                                                            |
| `emoji-search`              | Search emojis                          | `query: string`                                                                                                                                                                                           |
| **Network & Web**           |                                        |                                                                                                                                                                                                           |
| `ip-subnet-calculator`      | Calculate IPv4 subnet                  | `ip: string`, `cidr: number`                                                                                                                                                                              |
| `ipv4-subnet-calc`          | Enhanced IPv4 subnet calc              | `cidr: string`                                                                                                                                                                                            |
| `ipv6-ula-generator`        | Generate IPv6 ULA                      | `globalId?: string`                                                                                                                                                                                       |
| `url-parse`                 | Parse URL components                   | `url: string`                                                                                                                                                                                             |
| `random-port`               | Generate random ports                  | `count?: number`, `min?: number`, `max?: number`, `exclude?: number[]`                                                                                                                                    |
| `mac-address-generate`      | Generate MAC address                   | `prefix?: string`, `separator?: ':' \| '-'`                                                                                                                                                               |
| `phone-format`              | Format phone numbers                   | `phoneNumber: string`, `countryCode?: string`                                                                                                                                                             |
| `iban-validate`             | Validate IBAN                          | `iban: string`                                                                                                                                                                                            |
| **Math & Calculations**     |                                        |                                                                                                                                                                                                           |
| `math-evaluate`             | Evaluate expressions                   | `expression: string`                                                                                                                                                                                      |
| `number-base-converter`     | Convert number bases                   | `number: string`, `fromBase: number`, `toBase: number`                                                                                                                                                    |
| `roman-numeral-converter`   | Convert Roman numerals                 | `input: string`                                                                                                                                                                                           |
| `temperature-converter`     | Convert temperatures                   | `temperature: number`, `from: 'celsius' \| 'fahrenheit' \| 'kelvin'`, `to: 'celsius' \| 'fahrenheit' \| 'kelvin'`                                                                                         |
| `percentage-calculator`     | Calculate percentages                  | `operation: 'percentage-of' \| 'what-percentage' \| 'percentage-change'`, `value1: number`, `value2: number`                                                                                              |
| `unix-timestamp-converter`  | Convert timestamps                     | `input: string`                                                                                                                                                                                           |
| **ID & Code Generators**    |                                        |                                                                                                                                                                                                           |
| `uuid-generate`             | Generate UUID v4                       | None                                                                                                                                                                                                      |
| `ulid-generate`             | Generate ULID                          | None                                                                                                                                                                                                      |
| `qr-generate`               | Generate QR codes for any content      | `text: string`, `size?: number` - Supports URLs, WiFi (WIFI:T:WPA;S:network;P:password;;), contact info, etc.                                                                                             |
| `svg-placeholder-generator` | Generate SVG placeholder               | `width?: number`, `height?: number`, `text?: string`, `backgroundColor?: string`, `textColor?: string`                                                                                                    |
| **Development Tools**       |                                        |                                                                                                                                                                                                           |
| `regex-tester`              | Test regular expressions               | `pattern: string`, `text: string`, `flags?: string`                                                                                                                                                       |
| `crontab-generate`          | Generate cron expressions              | `minute?: string`, `hour?: string`, `dayOfMonth?: string`, `month?: string`, `dayOfWeek?: string`                                                                                                         |
| `list-converter`            | Convert list formats                   | `list: string`, `inputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe'`, `outputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe' \| 'json' \| 'quoted'`, `trim?: boolean` |
| **Utility Tools**           |                                        |                                                                                                                                                                                                           |
| `color-hex-to-rgb`          | Convert HEX to RGB                     | `hex: string`                                                                                                                                                                                             |
| `color-rgb-to-hex`          | Convert RGB to HEX                     | `r: number`, `g: number`, `b: number`                                                                                                                                                                     |
| `email-normalizer`          | Normalize email addresses              | `email: string`                                                                                                                                                                                           |
| `mime-types`                | Look up MIME types                     | `input: string`, `lookupType?: 'extension-to-mime' \| 'mime-to-extension'`                                                                                                                                |
| `device-info`               | Get system information                 | None                                                                                                                                                                                                      |
| `http-status-codes`         | HTTP status reference                  | `code?: number`                                                                                                                                                                                           |

## 📱 QR Code Usage Examples

The `qr-generate` tool supports various content types. Here are common usage patterns:

### WiFi Networks

```text
text: "WIFI:T:WPA;S:MyNetwork;P:password123;;"
text: "WIFI:T:WPA;S:GuestNet;P:welcome123;H:true;;" (hidden network)
text: "WIFI:T:;S:OpenNetwork;P:;;" (open network)
```

### Contact Information (MECARD format)

```text
text: "MECARD:N:John Doe;TEL:+1234567890;EMAIL:john@example.com;;"
```

### URLs and Links

```text
text: "https://example.com"
text: "mailto:someone@example.com?subject=Hello&body=Message"
text: "SMS:+1234567890:Hello from QR code!"
```

### Plain Text

```text
text: "Any text content you want to encode"
```

## 🏗️ Architecture & Development

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, demonstrating the power of AI-assisted software development:

- **Intelligent Code Generation**: Claude Sonnet analyzed requirements and generated comprehensive tool implementations
- **Schema Validation**: Automatically identified and resolved JSON schema validation issues across 75 tools
- **Docker Optimization**: Created production-ready Docker workflows and multi-stage builds
- **Documentation**: Generated comprehensive README with examples and tool reference tables
- **Testing**: Implemented robust error handling and validation throughout the codebase

**Key AI Contributions:**

- 🔧 **Tool Implementation**: All 75 tools designed and implemented with AI assistance
- 📦 **Docker Setup**: Complete containerization with GitHub Actions CI/CD pipeline
- 🔍 **Schema Cleanup**: Systematic removal of unsupported Zod keywords from all tool definitions
- 📚 **Documentation**: Comprehensive README with usage examples and tool catalogs
- 🚀 **Production Ready**: Docker Hub publishing, badges, and professional deployment setup

This showcases how AI can accelerate development while maintaining code quality, proper architecture, and comprehensive testing.

### Adding New Tools

1. Choose/create a tool module in `src/tools/`
2. Define tool with input schema using Zod
3. Register in `src/index.ts`
4. Rebuild with `npm run build`

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

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related

Inspired by [IT Tools](https://github.com/CorentinTh/it-tools) - online tools for developers.
