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

A comprehensive Model Context Protocol (MCP) server that provides access to over 116 IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## 📦 Installation & Setup

### Using with VS Code

**Quick Install:**

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect?url=vscode:mcp/install?%7B%22name%22%3A%22it-tools%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22it-tools-mcp%22%5D%7D) [![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect?url=vscode-insiders:mcp/install?%7B%22name%22%3A%22it-tools%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22it-tools-mcp%22%5D%7D)

**Install:**

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "MCP" and select "MCP: Add Server"
4. Choose "NPM Package" and enter: `it-tools-mcp`

**Or manually add to your VS Code `settings.json`:**

#### Node

```json
{
  "mcp": {
    "servers": {
      "it-tools": {
        "command": "npx",
        "args": ["it-tools-mcp"],
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
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_uuid","arguments":{}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest

# Encode text to Base64
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"encode_base64","arguments":{"text":"Hello World"}}}' | \
  docker run -i --rm wrenchpilot/it-tools-mcp:latest
```

## 🛠️ Tool Categories

This MCP server provides over **116 tools** across **14 categories**:

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

| Tool                           | Description                             | Parameters                                                                                                                                                                                                |
| ------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ansible Tools**              |                                         |                                                                                                                                                                                                           |
| `parse_ansible_inventory`  | Parse Ansible inventory              | `inventory: string`                                                                                                                 |
| `generate_ansible_inventory`   | Generate Ansible inventory              | `hosts: string[]`, `groups?: Record<string, string[]>`, `variables?: Record<string, any>`                                                                                                                 |
| `validate_ansible_playbook`   | Validate Ansible playbook YAML          | `playbook: string`                                                                                                                                                                                        |
| `show_ansible_reference`            | Ansible syntax and module reference     | `query?: string`                                                                                                                                                                                          |
| `decrypt_ansible_vault`        | Decrypt Ansible Vault data              | `data: string`, `password: string`                                                                                                                                                                        |
| `encrypt_ansible_vault`        | Encrypt data with Ansible Vault         | `data: string`, `password: string`                                                                                                                                                                        |
| **Color Tools**                |                                         |                                                                                                                                                                                                           |
| `convert_hex_to_rgb`             | Convert HEX to RGB                      | `hex: string`                                                                                                                                                                                             |
| `convert_rgb_to_hex`             | Convert RGB to HEX                      | `r: number`, `g: number`, `b: number`                                                                                                                                                                     |
| **Data Format**                |                                         |                                                                                                                                                                                                           |
| `convert_html_to_markdown`             | Convert HTML to Markdown                | `html: string`                                                                                                                                                                                            |
| `compare_json`                    | Compare JSON objects                    | `json1: string`, `json2: string`                                                                                                                                                                          |
| `format_json`                  | Format and validate JSON                | `json: string`, `indent?: number`                                                                                                                                                                         |
| `minify_json`                  | Minify JSON                             | `json: string`                                                                                                                                                                                            |
| `convert_json_to_csv`                  | Convert JSON to CSV                     | `json: string`, `delimiter?: string`                                                                                                                                                                      |
| `convert_json_to_toml`                 | Convert JSON to TOML                    | `json: string`                                                                                                                                                                                            |
| `convert_markdown_to_html`             | Convert Markdown to HTML                | `markdown: string`                                                                                                                                                                                        |
| `format_phone`                 | Parse and format phone numbers          | `phoneNumber: string`, `countryCode?: string`                                                                                                                                                             |
| `format_sql`                   | Format SQL                              | `sql: string`, `dialect?: 'sql' \| 'mysql' \| 'postgresql' \| 'sqlite' \| 'mariadb' \| 'db2' \| 'plsql' \| 'n1ql' \| 'redshift' \| 'spark' \| 'tsql' \| 'trino' \| 'bigquery'` (optional, default: 'sql') |
| `convert_toml_to_json`                 | Convert TOML to JSON                    | `toml: string`                                                                                                                                                                                            |
| `format_xml`                   | Format XML                              | `xml: string`, `indent?: number`                                                                                                                                                                          |
| `format_yaml`                  | Format YAML                             | `yaml: string`                                                                                                                                                                                            |
| **Development Tools**          |                                         |                                                                                                                                                                                                           |
| `generate_crontab`             | Generate cron expressions               | `minute?: string`, `hour?: string`, `dayOfMonth?: string`, `month?: string`, `dayOfWeek?: string`                                                                                                         |
| `format_html`              | Format and prettify HTML                | `html: string`, `indent?: number`                                                                                                                                                                         |
| `format_javascript`        | Format and prettify JavaScript          | `javascript: string`, `indent?: number`                                                                                                                                                                   |
| `convert_list`               | Convert list formats                    | `list: string`, `inputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe'`, `outputFormat: 'comma' \| 'semicolon' \| 'newline' \| 'space' \| 'pipe' \| 'json' \| 'quoted'`, `trim?: boolean` |
| `generate_markdown_toc`       | Generate table of contents for Markdown | `markdown: string`, `maxDepth?: number`                                                                                                                                                                   |
| `test_regex`                 | Test regular expressions                | `pattern: string`, `text: string`, `flags?: string`                                                                                                                                                       |
| **Docker Tools**               |                                         |                                                                                                                                                                                                           |
| `convert_docker_compose_to_run` | Convert Compose to Docker run command   | `compose: string`, `service?: string`                                                                                                                                                                     |
| `validate_docker_compose`     | Validate Docker Compose YAML            | `compose: string`                                                                                                                                                                                         |
| `show_docker_reference`             | Docker command and syntax reference     | `query?: string`                                                                                                                                                                                          |
| `convert_docker_run_to_compose` | Convert Docker run to Compose           | `command: string`                                                                                                                                                                                         |
| `generate_traefik_compose`    | Generate Traefik Docker Compose         | `domain: string`, `service: string`, `port?: number`, `network?: string`                                                                                                                                  |
| **Encoding & Decoding**        |                                         |                                                                                                                                                                                                           |
| `decode_base64`                | Decode Base64 text                      | `text: string`                                                                                                                                                                                            |
| `encode_base64`                | Encode text to Base64                   | `text: string`                                                                                                                                                                                            |
| `decode_html`                  | Decode HTML entities                    | `text: string`                                                                                                                                                                                            |
| `encode_html`                  | Encode HTML entities                    | `text: string`                                                                                                                                                                                            |
| `encode_html_entities`       | Extended HTML entity encoding/decoding  | `text: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                         |
| `convert_text_to_binary`               | Convert text to binary and vice versa   | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| `convert_text_to_unicode`              | Convert text to Unicode and vice versa  | `input: string`, `operation: 'encode' \| 'decode'`                                                                                                                                                        |
| `decode_url`                   | URL decode text                         | `text: string`                                                                                                                                                                                            |
| `encode_url`                   | URL encode text                         | `text: string`                                                                                                                                                                                            |
| **Forensic Tools**             |                                         |                                                                                                                                                                                                           |
| `identify_file_type`         | Identify file type from content         | `data: string`, `filename?: string`                                                                                                                                                                       |
| `decode_safelink`             | Decode Microsoft SafeLinks              | `url: string`                                                                                                                                                                                             |
| `fang_url`                   | Fang and defang URLs for analysis       | `text: string`, `operation: 'fang' \| 'defang'`                                                                                                                                                           |
| **ID & Code Generators**       |                                         |                                                                                                                                                                                                           |
| `generate_qr_code`                  | Generate QR codes for any content       | `text: string`, `size?: number` - Supports URLs, WiFi (WIFI:T:WPA;S:network;P:password;;), contact info, etc.                                                                                             |
| `generate_svg_placeholder`    | Generate SVG placeholder                | `width?: number`, `height?: number`, `text?: string`, `backgroundColor?: string`, `textColor?: string`                                                                                                    |
| `generate_ulid`                | Generate ULID                           | None                                                                                                                                                                                                      |
| `generate_uuid`                | Generate UUID v4                        | None                                                                                                                                                                                                      |
| **Math & Calculations**        |                                         |                                                                                                                                                                                                           |
| `evaluate_math`                | Evaluate expressions                    | `expression: string`                                                                                                                                                                                      |
| `convert_number_base`        | Convert number bases                    | `number: string`, `fromBase: number`, `toBase: number`                                                                                                                                                    |
| `calculate_percentage`        | Calculate percentages                   | `operation: 'percentage-of' \| 'what-percentage' \| 'percentage-change'`, `value1: number`, `value2: number`                                                                                              |
| `convert_roman_numerals`      | Convert Roman numerals                  | `input: string`                                                                                                                                                                                           |
| `convert_temperature`        | Convert temperatures                    | `temperature: number`, `from: 'celsius' \| 'fahrenheit' \| 'kelvin'`, `to: 'celsius' \| 'fahrenheit' \| 'kelvin'`                                                                                         |
| `convert_unix_timestamp`     | Convert timestamps                      | `input: string`                                                                                                                                                                                           |
| **Network & System**           |                                         |                                                                                                                                                                                                           |
| `cat`                          | Display file content                    | `file: string`                                                                                                                                                                                            |
| `curl`                         | HTTP client (GET, POST, etc.)           | `url: string`, `method?: string`, `headers?: Record<string, string>`, `body?: string`                                                                                                                     |
| `dig`                          | DNS query (custom type)                 | `target: string`, `type?: string`                                                                                                                                                                         |
| `grep`                         | Search for pattern in file              | `file: string`, `pattern: string`                                                                                                                                                                         |
| `head`                         | Show first N lines of file              | `file: string`, `lines?: number`                                                                                                                                                                          |
| `validate_iban`                | Validate IBAN                           | `iban: string`                                                                                                                                                                                            |
| `calculate_ip_subnet`         | Calculate IPv4 subnet                   | `ip: string`, `cidr: number`                                                                                                                                                                              |
| `calculate_ipv4_subnet`             | Enhanced IPv4 subnet calc               | `cidr: string`                                                                                                                                                                                            |
| `generate_ipv6_ula`           | Generate IPv6 ULA                       | `globalId?: string`                                                                                                                                                                                       |
| `generate_mac_address`         | Generate MAC address                    | `prefix?: string`, `separator?: ':' \| '-'`                                                                                                                                                               |
| `nslookup`                     | DNS lookup (A/AAAA/CNAME)               | `target: string`                                                                                                                                                                                          |
| `ping`                         | Ping a host                             | `target: string`, `count?: number`                                                                                                                                                                        |
| `ps`                           | List running processes                  | None                                                                                                                                                                                                      |
| `generate_random_port`                  | Generate random ports                   | `count?: number`, `min?: number`, `max?: number`, `exclude?: number[]`                                                                                                                                    |
| `scp`                          | Copy files to/from remote host (SFTP)   | `target: string`, `user: string`, `direction: 'upload'\|'download'`, `localPath: string`, `remotePath: string`, `privateKey?: string`                                                                     |
| `ssh`                          | SSH command execution                   | `target: string`, `user: string`, `command: string`                                                                                                                                                       |
| `tail`                         | Show last N lines of file               | `file: string`, `lines?: number`                                                                                                                                                                          |
| `telnet`                       | Test TCP connectivity                   | `target: string`, `port: number`                                                                                                                                                                          |
| `top`                          | Show top processes (by CPU)             | None                                                                                                                                                                                                      |
| `parse_url`                    | Parse URL components                    | `url: string`                                                                                                                                                                                             |
| **Physics**                    |                                         |                                                                                                                                                                                                           |
| `convert_angle`              | Convert angle units                     | `value: number`, `from: 'degrees' \| 'radians' \| 'gradians'`, `to: 'degrees' \| 'radians' \| 'gradians'`                                                                                                 |
| `convert_energy`             | Convert energy units                    | `value: number`, `from: 'joules' \| 'calories' \| 'kwh' \| 'btu'`, `to: 'joules' \| 'calories' \| 'kwh' \| 'btu'`                                                                                         |
| `convert_power`              | Convert power units                     | `value: number`, `from: 'watts' \| 'kilowatts' \| 'horsepower' \| 'btu_per_hour'`, `to: 'watts' \| 'kilowatts' \| 'horsepower' \| 'btu_per_hour'`                                                         |
| **Security & Crypto**          |                                         |                                                                                                                                                                                                           |
| `generate_basic_auth`         | Generate Basic Auth header              | `username: string`, `password: string`                                                                                                                                                                    |
| `hash_bcrypt`                  | Generate/verify bcrypt hash             | `password: string`, `rounds?: number`, `hash?: string`                                                                                                                                                    |
| `generate_bip39`               | Generate BIP39 mnemonic                 | `wordCount?: '12' \| '15' \| '18' \| '21' \| '24'`                                                                                                                                                        |
| `hash_md5`                     | Generate MD5 hash                       | `text: string`                                                                                                                                                                                            |
| `hash_sha1`                    | Generate SHA1 hash                      | `text: string`                                                                                                                                                                                            |
| `hash_sha256`                  | Generate SHA256 hash                    | `text: string`                                                                                                                                                                                            |
| `hash_sha512`                  | Generate SHA512 hash                    | `text: string`                                                                                                                                                                                            |
| `generate_hmac`               | Generate HMAC                           | `message: string`, `key: string`, `algorithm?: 'sha1' \| 'sha256' \| 'sha512'`                                                                                                                            |
| `decode_jwt`                   | Decode JWT token                        | `token: string`                                                                                                                                                                                           |
| `generate_otp`           | Generate TOTP codes                     | `secret: string`, `digits?: number`, `period?: number`                                                                                                                                                    |
| `generate_password`            | Generate secure password                | `length?: number`, `includeUppercase?: boolean`, `includeLowercase?: boolean`, `includeNumbers?: boolean`, `includeSymbols?: boolean`                                                                     |
| `generate_token`              | Generate secure token                   | `length?: number`, `charset?: 'alphanumeric' \| 'hex' \| 'base64' \| 'custom'`, `customChars?: string`                                                                                                    |
| **Text Processing**            |                                         |                                                                                                                                                                                                           |
| `generate_ascii_art`               | Generate ASCII art                      | `text: string`, `font?: string` (supports 295+ figlet fonts)                                                                                                                                              |
| `analyze_distinct_words`               | Extract unique words from text          | `text: string`, `caseSensitive?: boolean`                                                                                                                                                                 |
| `search_emoji`                 | Search emojis                           | `query: string`                                                                                                                                                                                           |
| `generate_lorem_ipsum`        | Generate Lorem Ipsum                    | `type?: 'words' \| 'sentences' \| 'paragraphs'`, `count?: number`                                                                                                                                         |
| `generate_numeronym`          | Generate numeronyms                     | `text: string`                                                                                                                                                                                            |
| `slugify_text`               | Convert to URL slug                     | `text: string`, `separator?: string`, `lowercase?: boolean`                                                                                                                                               |
| `obfuscate_string`            | Obfuscate text                          | `text: string`, `method?: 'html-entities' \| 'unicode' \| 'base64'`                                                                                                                                       |
| `convert_to_camelcase`               | Convert to camelCase                    | `text: string`                                                                                                                                                                                            |
| `capitalize_text`              | Capitalize words                        | `text: string`                                                                                                                                                                                            |
| `compare_text`                    | Compare texts                           | `text1: string`, `text2: string`                                                                                                                                                                          |
| `convert_text_to_kebabcase`               | Convert to kebab-case                   | `text: string`                                                                                                                                                                                            |
| `convert_text_to_lowercase`               | Convert to lowercase                    | `text: string`                                                                                                                                                                                            |
| `convert_text_to_pascalcase`              | Convert to PascalCase                   | `text: string`                                                                                                                                                                                            |
| `text_snakecase`               | Convert to snake_case                   | `text: string`                                                                                                                                                                                            |
| `analyze_text_stats`                   | Get text statistics                     | `text: string`                                                                                                                                                                                            |
| `convert_text_to_nato`        | Convert to NATO alphabet                | `text: string`                                                                                                                                                                                            |
| `show_unicode_names`        | Convert text to Unicode character names | `text: string`                                                                                                                                                                                            |
| `convert_text_to_uppercase`               | Convert to uppercase                    | `text: string`                                                                                                                                                                                            |
| **Utility Tools**              |                                         |                                                                                                                                                                                                           |
| `format_css`               | Format and prettify CSS                 | `css: string`, `indent?: number`                                                                                                                                                                          |
| `show_device_info`                  | Get system information                  | None                                                                                                                                                                                                      |
| `normalize_email`             | Normalize email addresses               | `email: string`                                                                                                                                                                                           |
| `lookup_http_status`            | HTTP status reference                   | `code?: number`                                                                                                                                                                                           |
| `lookup_mime_types`                   | Look up MIME types                      | `input: string`, `lookupType?: 'extension-to-mime' \| 'mime-to-extension'`                                                                                                                                |
| `lookup_port_numbers`                 | Look up port number assignments         | `port?: number`, `service?: string`                                                                                                                                                                       |
| `convert_rem_px`             | Convert between REM and PX units        | `value: number`, `conversion: 'rem-to-px' \| 'px-to-rem'`, `baseFontSize?: number`                                                                                                                        |

## 🏗️ Architecture & Development

Built with **TypeScript**, **Zod** validation, and **MCP SDK** for robust, type-safe operation.

### 🤖 AI-Assisted Development

This project was developed using **VS Code**, **Copilot Chat Agent**, **Playwright MCP**, and the **Claude Sonnet 4 Model**, demonstrating the power of AI-assisted software development:

- **Intelligent Code Generation**: Claude Sonnet analyzed requirements and generated comprehensive tool implementations
- **Schema Validation**: Automatically identified and resolved JSON schema validation issues across tools
- **Docker Optimization**: Created production-ready Docker workflows and multi-stage builds
- **Documentation**: Generated comprehensive README with examples and tool reference tables
- **Testing**: Implemented robust error handling and validation throughout the codebase

**Key AI Contributions:**

- 🔧 **Tool Implementation**: All tools designed and implemented with AI assistance
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
