# IT Tools MCP Server

[![CI/CD Pipeline](https://github.com/wrenchpilot/it-tools-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/wrenchpilot/it-tools-mcp/actions/workflows/main.yml)
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

> **📝 Note**: A condensed version of this README is automatically synced to [Docker Hub](https://hub.docker.com/r/wrenchpilot/it-tools-mcp) due to character limits.

A comprehensive Model Context Protocol (MCP) server that provides access to 112 IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## 📦 Installation & Setup

### Using with VS Code

[![Install IT Tools](https://img.shields.io/badge/Install%20in%20VS%20Code-blue?logo=visual-studio-code)](vscode:mcp/install?%7B%22name%22%3A%22it-tools-mcp%22%2C%22gallery%22%3Atrue%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22it-tools-mcp%22%5D%7D)

Add to your VS Code `settings.json`:

#### Node

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

This MCP server provides **112 tools** across **14 categories**:

- **� Ansible Tools** (5 tools): Vault encryption/decryption, inventory parser, playbook validator, reference
- **🎨 Color Tools** (2 tools): Hex ↔ RGB conversion
- **📝 Data Format** (12 tools): JSON, XML, YAML, SQL, TOML, Markdown ↔ HTML conversion, phone formatting
- **�️ Development Tools** (6 tools): Regex testing, cron generation, list conversion, code prettifiers, markdown TOC
- **🐳 Docker Tools** (5 tools): Compose validation, conversion tools, Traefik generator, reference
- **🔧 Encoding & Decoding** (8 tools): Base64, URL, HTML entities, text-to-binary
- **🔍 Forensic Tools** (3 tools): File type identification, safelink decoding, URL fanger
- **🆔 ID & Code Generators** (4 tools: UUID, ULID, QR codes, SVG placeholders
- **🔢 Math & Calculations** (6 tools): Expression evaluation, base conversion, temperature, percentages, Unix timestamps, Roman numerals
- **🌐 Network & System** (23 tools): IPv4/IPv6 subnets, URL parsing, MAC addresses, ps, top, cat, head, tail, grep, ping, nslookup, telnet, dig, ssh, scp, curl, IBAN validation
- **⚡ Physics** (3 tools): Angle, energy, and power unit conversions
- **🔐 Security & Crypto** (12 tools): Hashing (MD5, SHA1, SHA256, SHA512), HMAC, JWT, bcrypt, passwords, tokens, OTP, BIP39
- **✨ Text Processing** (19 tools): Case conversion, stats, diff, ASCII art, NATO alphabet, slugify, Unicode
- **🛠️ Utility Tools** (7 tools): Email normalization, MIME types, HTTP status codes, device info, CSS prettifier, rem/px converter

## 📸 Screenshot Examples

### Password Hash Generation Example

![Password Hash Example](screenshots/password-hash-example.png)

### ASCII Art Text Generation Example

![ASCII Art Text Example](screenshots/ascii-art-text-example.png)

Examples of using the IT Tools MCP server with VS Code Copilot Chat for secure password hashing and creative ASCII art generation.

## Available Tools

| Tool                        | Description                            | Parameters                                                                                                                                                                                                |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ansible Tools**           |                                        |                                                                                                                                                                                                           |
| `ansible-inventory-generator` | Generate Ansible inventory           | `hosts: string[]`, `groups?: Record<string, string[]>`, `variables?: Record<string, any>`                                                                                                                |
| `ansible-playbook-validator` | Validate Ansible playbook YAML       | `playbook: string`                                                                                                                                                                                        |
| `ansible-reference`         | Ansible syntax and module reference   | `query?: string`                                                                                                                                                                                          |
| `ansible-vault-decrypt`     | Decrypt Ansible Vault data            | `data: string`, `password: string`                                                                                                                                                                        |
| `ansible-vault-encrypt`     | Encrypt data with Ansible Vault       | `data: string`, `password: string`                                                                                                                                                                        |
| **Color Tools**             |                                        |                                                                                                                                                                                                           |
| `color-hex-to-rgb`          | Convert HEX to RGB                     | `hex: string`                                                                                                                                                                                             |
| `color-rgb-to-hex`          | Convert RGB to HEX                     | `r: number`, `g: number`, `b: number`                                                                                                                                                                     |
| **Data Format**             |                                        |                                                                                                                                                                                                           |
| `html-to-markdown`          | Convert HTML to Markdown               | `html: string`                                                                                                                                                                                            |
| `json-diff`                 | Compare JSON objects                   | `json1: string`, `json2: string`                                                                                                                                                                          |
| `json-format`               | Format and validate JSON               | `json: string`, `indent?: number`                                                                                                                                                                         |
| `json-minify`               | Minify JSON                            | `json: string`                                                                                                                                                                                            |
| `json-to-csv`               | Convert JSON to CSV                    | `json: string`, `delimiter?: string`                                                                                                                                                                      |
| `json-to-toml`              | Convert JSON to TOML                   | `json: string`                                                                                                                                                                                            |
| `markdown-to-html`          | Convert Markdown to HTML               | `markdown: string`                                                                                                                                                                                        |
| `phone-format`              | Parse and format phone numbers         | `phoneNumber: string`, `countryCode?: string`                                                                                                                                                             |
| `sql-format`                | Format SQL                             | `sql: string`, `dialect?: 'sql' \| 'mysql' \| 'postgresql' \| 'sqlite' \| 'mariadb' \| 'db2' \| 'plsql' \| 'n1ql' \| 'redshift' \| 'spark' \| 'tsql' \| 'trino' \| 'bigquery'` (optional, default: 'sql') |
| `toml-to-json`              | Convert TOML to JSON                   | `toml: string`                                                                                                                                                                                            |
| `xml-format`                | Format XML                             | `xml: string`, `indent?: number`                                                                                                                                                                          |
| `yaml-format`               | Format YAML                            | `yaml: string`                                                                                                                                                                                            |
| **Development Tools**       |                                        |                                                                                                                                                                                                           |
| `crontab-generate`          | Generate cron expressions              | `minute?: string`, `hour?: string`, `dayOfMonth?: string`, `month?: string`, `dayOfWeek?: string`                                                                                                         |
| `html-prettifier`           | Format and prettify HTML               | `html: string`, `indent?: number`                                                                                                                                                                         |
| `javascript-prettifier`     | Format and prettify JavaScript         | `javascript: string`, `indent?: number`                                                                                                                                                                   |
| `list-converter`            | Convert list formats                   | `list: string`, `inputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe'`, `outputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe' \| 'json' \| 'quoted'`, `trim?: boolean` |
| `markdown-toc-generator`    | Generate table of contents for Markdown | `markdown: string`, `maxDepth?: number`                                                                                                                                                                 |
| `regex-tester`              | Test regular expressions               | `pattern: string`, `text: string`, `flags?: string`                                                                                                                                                       |
| **Docker Tools**            |                                        |                                                                                                                                                                                                           |
| `docker-compose-to-docker-run` | Convert Compose to Docker run command | `compose: string`, `service?: string`                                                                                                                                                                   |
| `docker-compose-validator`  | Validate Docker Compose YAML          | `compose: string`                                                                                                                                                                                         |
| `docker-reference`          | Docker command and syntax reference    | `query?: string`                                                                                                                                                                                          |
| `docker-run-to-docker-compose` | Convert Docker run to Compose        | `command: string`                                                                                                                                                                                         |
| `traefik-compose-generator` | Generate Traefik Docker Compose       | `domain: string`, `service: string`, `port?: number`, `network?: string`                                                                                                                                 |
| **Encoding & Decoding**     |                                        |                                                                                                                                                                                                           |
| `base64-decode`             | Decode Base64 text                     | `text: string`                                                                                                                                                                                            |
| `base64-encode`             | Encode text to Base64                  | `text: string`                                                                                                                                                                                            |
| `html-decode`               | Decode HTML entities                   | `text: string`                                                                                                                                                                                            |
| `html-encode`               | Encode HTML entities                   | `text: string`                                                                                                                                                                                            |
| `html-entities-extended`    | Extended HTML entity encoding/decoding | `text: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                         |
| `text-to-binary`            | Convert text to binary and vice versa  | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| `text-to-unicode`           | Convert text to Unicode and vice versa | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| `url-decode`                | URL decode text                        | `text: string`                                                                                                                                                                                            |
| `url-encode`                | URL encode text                        | `text: string`                                                                                                                                                                                            |
| **Forensic Tools**          |                                        |                                                                                                                                                                                                           |
| `file-type-identifier`      | Identify file type from content        | `data: string`, `filename?: string`                                                                                                                                                                       |
| `safelink-decoder`          | Decode Microsoft SafeLinks            | `url: string`                                                                                                                                                                                             |
| `url-fanger`                | Fang and defang URLs for analysis     | `text: string`, `operation: 'fang' \| 'defang'`                                                                                                                                                          |
| **ID & Code Generators**    |                                        |                                                                                                                                                                                                           |
| `qr-generate`               | Generate QR codes for any content      | `text: string`, `size?: number` - Supports URLs, WiFi (WIFI:T:WPA;S:network;P:password;;), contact info, etc.                                                                                             |
| `svg-placeholder-generator` | Generate SVG placeholder               | `width?: number`, `height?: number`, `text?: string`, `backgroundColor?: string`, `textColor?: string`                                                                                                    |
| `ulid-generate`             | Generate ULID                          | None                                                                                                                                                                                                      |
| `uuid-generate`             | Generate UUID v4                       | None                                                                                                                                                                                                      |
| **Math & Calculations**     |                                        |                                                                                                                                                                                                           |
| `math-evaluate`             | Evaluate expressions                   | `expression: string`                                                                                                                                                                                      |
| `number-base-converter`     | Convert number bases                   | `number: string`, `fromBase: number`, `toBase: number`                                                                                                                                                    |
| `percentage-calculator`     | Calculate percentages                  | `operation: 'percentage-of' \| 'what-percentage' \| 'percentage-change'`, `value1: number`, `value2: number`                                                                                              |
| `roman-numeral-converter`   | Convert Roman numerals                 | `input: string`                                                                                                                                                                                           |
| `temperature-converter`     | Convert temperatures                   | `temperature: number`, `from: 'celsius' \| 'fahrenheit' \| 'kelvin'`, `to: 'celsius' \| 'fahrenheit' \| 'kelvin'`                                                                                         |
| `unix-timestamp-converter`  | Convert timestamps                     | `input: string`                                                                                                                                                                                           |
| **Network & System**        |                                        |                                                                                                                                                                                                           |
| `cat`                       | Display file content                   | `file: string`                                                                                                                                                                                            |
| `curl`                      | HTTP client (GET, POST, etc.)         | `url: string`, `method?: string`, `headers?: Record<string, string>`, `body?: string`                                                                                                                     |
| `dig`                       | DNS query (custom type)                | `target: string`, `type?: string`                                                                                                                                                                         |
| `grep`                      | Search for pattern in file             | `file: string`, `pattern: string`                                                                                                                                                                         |
| `head`                      | Show first N lines of file             | `file: string`, `lines?: number`                                                                                                                                                                          |
| `iban-validate`             | Validate IBAN                          | `iban: string`                                                                                                                                                                                            |
| `ip-subnet-calculator`      | Calculate IPv4 subnet                  | `ip: string`, `cidr: number`                                                                                                                                                                              |
| `ipv4-subnet-calc`          | Enhanced IPv4 subnet calc              | `cidr: string`                                                                                                                                                                                            |
| `ipv6-ula-generator`        | Generate IPv6 ULA                      | `globalId?: string`                                                                                                                                                                                       |
| `mac-address-generate`      | Generate MAC address                   | `prefix?: string`, `separator?: ':' \| '-'`                                                                                                                                                               |
| `nslookup`                  | DNS lookup (A/AAAA/CNAME)              | `target: string`                                                                                                                                                                                          |
| `ping`                      | Ping a host                            | `target: string`, `count?: number`                                                                                                                                                                        |
| `ps`                        | List running processes                 | None                                                                                                                                                                                                      |
| `random-port`               | Generate random ports                  | `count?: number`, `min?: number`, `max?: number`, `exclude?: number[]`                                                                                                                                    |
| `scp`                       | Copy files to/from remote host (SFTP) | `target: string`, `user: string`, `direction: 'upload'\|'download'`, `localPath: string`, `remotePath: string`, `privateKey?: string`                                                                  |
| `ssh`                       | SSH command execution                  | `target: string`, `user: string`, `command: string`                                                                                                                                                       |
| `tail`                      | Show last N lines of file              | `file: string`, `lines?: number`                                                                                                                                                                          |
| `telnet`                    | Test TCP connectivity                  | `target: string`, `port: number`                                                                                                                                                                          |
| `top`                       | Show top processes (by CPU)            | None                                                                                                                                                                                                      |
| `url-parse`                 | Parse URL components                   | `url: string`                                                                                                                                                                                             |
| **Physics**                 |                                        |                                                                                                                                                                                                           |
| `angle-converter`           | Convert angle units                    | `value: number`, `from: 'degrees' \| 'radians' \| 'gradians'`, `to: 'degrees' \| 'radians' \| 'gradians'`                                                                                               |
| `energy-converter`          | Convert energy units                   | `value: number`, `from: 'joules' \| 'calories' \| 'kwh' \| 'btu'`, `to: 'joules' \| 'calories' \| 'kwh' \| 'btu'`                                                                                       |
| `power-converter`           | Convert power units                    | `value: number`, `from: 'watts' \| 'kilowatts' \| 'horsepower' \| 'btu_per_hour'`, `to: 'watts' \| 'kilowatts' \| 'horsepower' \| 'btu_per_hour'`                                                     |
| **Security & Crypto**       |                                        |                                                                                                                                                                                                           |
| `basic-auth-generator`      | Generate Basic Auth header             | `username: string`, `password: string`                                                                                                                                                                    |
| `bcrypt-hash`               | Generate/verify bcrypt hash            | `password: string`, `rounds?: number`, `hash?: string`                                                                                                                                                    |
| `bip39-generate`            | Generate BIP39 mnemonic                | `wordCount?: '12' \| '15' \| '18' \| '21' \| '24'`                                                                                                                                                        |
| `hash-md5`                  | Generate MD5 hash                      | `text: string`                                                                                                                                                                                            |
| `hash-sha1`                 | Generate SHA1 hash                     | `text: string`                                                                                                                                                                                            |
| `hash-sha256`               | Generate SHA256 hash                   | `text: string`                                                                                                                                                                                            |
| `hash-sha512`               | Generate SHA512 hash                   | `text: string`                                                                                                                                                                                            |
| `hmac-generator`            | Generate HMAC                          | `message: string`, `key: string`, `algorithm?: 'sha1' \| 'sha256' \| 'sha512'`                                                                                                                            |
| `jwt-decode`                | Decode JWT token                       | `token: string`                                                                                                                                                                                           |
| `otp-code-generator`        | Generate TOTP codes                    | `secret: string`, `digits?: number`, `period?: number`                                                                                                                                                    |
| `password-generate`         | Generate secure password               | `length?: number`, `includeUppercase?: boolean`, `includeLowercase?: boolean`, `includeNumbers?: boolean`, `includeSymbols?: boolean`                                                                     |
| `token-generator`           | Generate secure token                  | `length?: number`, `charset?: 'alphanumeric' \| 'hex' \| 'base64' \| 'custom'`, `customChars?: string`                                                                                                    |
| **Text Processing**         |                                        |                                                                                                                                                                                                           |
| `ascii-art-text`            | Generate ASCII art                     | `text: string`, `font?: string` (supports 295+ figlet fonts)                                                                                                                                              |
| `distinct-words`            | Extract unique words from text         | `text: string`, `caseSensitive?: boolean`                                                                                                                                                                 |
| `emoji-search`              | Search emojis                          | `query: string`                                                                                                                                                                                           |
| `lorem-ipsum-generator`     | Generate Lorem Ipsum                   | `type?: 'words' \| 'sentences' \| 'paragraphs'`, `count?: number`                                                                                                                                         |
| `numeronym-generator`       | Generate numeronyms                    | `text: string`                                                                                                                                                                                            |
| `slugify-string`            | Convert to URL slug                    | `text: string`, `separator?: string`, `lowercase?: boolean`                                                                                                                                               |
| `string-obfuscator`         | Obfuscate text                         | `text: string`, `method?: 'html-entities' \| 'unicode' \| 'base64'`                                                                                                                                       |
| `text-camelcase`            | Convert to camelCase                   | `text: string`                                                                                                                                                                                            |
| `text-capitalize`           | Capitalize words                       | `text: string`                                                                                                                                                                                            |
| `text-diff`                 | Compare texts                          | `text1: string`, `text2: string`                                                                                                                                                                          |
| `text-kebabcase`            | Convert to kebab-case                  | `text: string`                                                                                                                                                                                            |
| `text-lowercase`            | Convert to lowercase                   | `text: string`                                                                                                                                                                                            |
| `text-pascalcase`           | Convert to PascalCase                  | `text: string`                                                                                                                                                                                            |
| `text-snakecase`            | Convert to snake_case                  | `text: string`                                                                                                                                                                                            |
| `text-stats`                | Get text statistics                    | `text: string`                                                                                                                                                                                            |
| `text-to-nato-alphabet`     | Convert to NATO alphabet               | `text: string`                                                                                                                                                                                            |
| `text-to-unicode-names`     | Convert text to Unicode character names | `text: string`                                                                                                                                                                                           |
| `text-uppercase`            | Convert to uppercase                   | `text: string`                                                                                                                                                                                            |
| **Utility Tools**           |                                        |                                                                                                                                                                                                           |
| `css-prettifier`            | Format and prettify CSS                | `css: string`, `indent?: number`                                                                                                                                                                          |
| `device-info`               | Get system information                 | None                                                                                                                                                                                                      |
| `email-normalizer`          | Normalize email addresses              | `email: string`                                                                                                                                                                                           |
| `http-status-codes`         | HTTP status reference                  | `code?: number`                                                                                                                                                                                           |
| `mime-types`                | Look up MIME types                     | `input: string`, `lookupType?: 'extension-to-mime' \| 'mime-to-extension'`                                                                                                                                |
| `port-numbers`              | Look up port number assignments        | `port?: number`, `service?: string`                                                                                                                                                                       |
| `rem-px-converter`          | Convert between REM and PX units       | `value: number`, `conversion: 'rem-to-px' \| 'px-to-rem'`, `baseFontSize?: number`                                                                                                                        |

## 🏗️ Architecture & Development

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, demonstrating the power of AI-assisted software development:

- **Intelligent Code Generation**: Claude Sonnet analyzed requirements and generated comprehensive tool implementations
- **Schema Validation**: Automatically identified and resolved JSON schema validation issues across 112 tools
- **Docker Optimization**: Created production-ready Docker workflows and multi-stage builds
- **Documentation**: Generated comprehensive README with examples and tool reference tables
- **Testing**: Implemented robust error handling and validation throughout the codebase

**Key AI Contributions:**

- 🔧 **Tool Implementation**: All 112 tools designed and implemented with AI assistance
- 📦 **Docker Setup**: Complete containerization with GitHub Actions CI/CD pipeline
- 🔍 **Schema Cleanup**: Systematic removal of unsupported Zod keywords from all tool definitions
- 📚 **Documentation**: Comprehensive README with usage examples and tool catalogs
- 🚀 **Production Ready**: Docker Hub publishing, badges, and professional deployment setup

This showcases how AI can accelerate development while maintaining code quality, proper architecture, and comprehensive testing.

### Adding New Tools

1. Create a tool directory in appropriate category under `src/tools/`
2. Define tool with input schema using Zod in its `index.ts`
3. Export registration function for dynamic loading
4. Rebuild with `npm run build`

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

## 🤝 Contributing

Contributions are welcome! Please follow the guidelines below:

### Commit Message Format

This project uses **Conventional Commits** for clear, consistent commit messages.

**Version Management:**

- 🤖 **Automatic version bumping** - Git hooks automatically bump versions based on commit message types
- 🤖 **Automatic publishing** - CI/CD detects changes and publishes automatically
- 🏷️ **Git tags** - Created automatically based on conventional commit messages

**Examples:**

```bash
git commit -m "feat: add new encryption tool"    # → minor version bump
git commit -m "fix: resolve base64 decoding issue"  # → patch version bump
git commit -m "docs: improve README examples"   # → patch version bump
git commit -m "feat!: breaking API change"      # → major version bump

# Version is automatically bumped and committed by git hooks
# No manual npm version commands needed!
git push
```

📖 See [COMMIT_TEMPLATE_SETUP.md](COMMIT_TEMPLATE_SETUP.md) for setup instructions.

### Development Process

1. Fork the repository
2. Run `./setup-commit-template.sh` (recommended)
3. Create a feature branch
4. Make your changes following the project structure
5. Use conventional commit messages
6. Submit a Pull Request

The CI/CD pipeline will automatically:

- ✅ Build and test your changes
- 🏷️ Bump version based on commit messages (on merge to main)
- 📦 Publish to Docker Hub and NPM
- 🚀 Create GitHub releases

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related

Inspired by [IT Tools](https://github.com/CorentinTh/it-tools) - online tools for developers.

This project incorporates select tools from the [@sharevb fork](https://github.com/sharevb/it-tools) which extends IT Tools with additional utilities and enhancements.
