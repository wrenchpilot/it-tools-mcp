# IT Tools MCP Server

A comprehensive Model Context Protocol (MCP) server that provides access to 72+ IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.

## Features

### 🔧 Encoding & Decoding Tools (8 tools)
- **Base64**: Encode and decode Base64 strings
- **URL**: URL encoding and decoding  
- **HTML**: HTML entity encoding and decoding (basic and extended)
- **Text to Binary**: Convert text to binary and vice versa

### 📝 Data Format Tools (10 tools)
- **JSON**: Format, minify, validate, and convert JSON to CSV
- **XML**: Format and prettify XML
- **YAML**: Format and prettify YAML
- **SQL**: Format and prettify SQL queries
- **TOML**: Convert between TOML and JSON formats
- **Markdown ↔ HTML**: Convert between Markdown and HTML formats

### 🔐 Security & Crypto Tools (11 tools)
- **Hashing**: Generate MD5, SHA1, SHA256, SHA512 hashes
- **HMAC**: Generate Hash-based Message Authentication Codes
- **Bcrypt**: Generate bcrypt hashes and verify passwords
- **JWT**: Decode JWT tokens (header and payload)
- **Basic Auth**: Generate HTTP Basic Authentication headers
- **BIP39**: Generate Bitcoin mnemonic phrases
- **Password Generator**: Create secure passwords with customizable options
- **Token Generator**: Generate secure random tokens
- **OTP Generator**: Generate Time-based One-Time Password codes

### ✨ Text Processing Tools (13 tools)
- **Case Conversion**: UPPERCASE, lowercase, camelCase, PascalCase, kebab-case, snake_case, Capitalize
- **Text Statistics**: Analyze character count, word count, lines, paragraphs
- **Text Comparison**: Compare two texts and show differences
- **ASCII Art**: Generate ASCII art text in multiple font styles
- **NATO Alphabet**: Convert text to NATO phonetic alphabet
- **String Obfuscation**: Obfuscate text using HTML entities, Unicode, or Base64
- **Slugify**: Convert text to URL-friendly slug format
- **Numeronym Generator**: Generate numeronyms (e.g., "i18n" for "internationalization")
- **Lorem Ipsum**: Generate placeholder text (words, sentences, paragraphs)
- **Emoji Search**: Search for emojis by name or category

### 🌐 Network & Web Tools (8 tools)
- **IPv4 Subnet Calculator**: Calculate subnet information and network details
- **IPv6 ULA Generator**: Generate IPv6 Unique Local Address prefixes
- **URL Parser**: Parse URLs into components (protocol, host, path, etc.)
- **Random Port Generator**: Generate random available port numbers
- **MAC Address Generator**: Generate random MAC addresses with custom prefixes
- **Phone Number Formatter**: Parse and format phone numbers for different countries
- **IBAN Validator**: Validate and parse International Bank Account Numbers

### 🔢 Math & Calculation Tools (6 tools)
- **Math Evaluator**: Evaluate mathematical expressions safely
- **Base Converter**: Convert numbers between different bases (2-36)
- **Roman Numerals**: Convert between decimal and Roman numerals
- **Temperature Converter**: Convert between Celsius, Fahrenheit, and Kelvin
- **Percentage Calculator**: Calculate percentages and percentage changes

### 🆔 ID & Code Generators (6 tools)
- **UUID**: Generate random UUID v4
- **ULID**: Generate Universally Unique Lexicographically Sortable Identifiers
- **QR Code**: Generate ASCII QR codes for text
- **WiFi QR Code**: Generate QR code data for WiFi network connection
- **SVG Placeholder**: Generate SVG placeholder images with custom dimensions

### 🔧 Development Tools (8 tools)
- **Regex Tester**: Test regular expressions against text with flags support
- **Crontab Generator**: Generate cron expressions with human-readable descriptions
- **JSON Diff**: Compare two JSON objects and highlight differences
- **List Converter**: Convert between different list formats (CSV, JSON, etc.)
- **MIME Types**: Look up MIME types for file extensions and vice versa
- **HTTP Status Codes**: Reference lookup for HTTP status codes
- **Device Information**: Get basic system/environment information

### 🎨 Utility Tools (2 tools)
- **Color Conversion**: Convert between HEX and RGB color formats
- **Email Normalizer**: Normalize email addresses (remove dots, aliases, etc.)

### 🔐 JWT Tools
- **JWT Decoder**: Decode JWT tokens (header and payload display only)

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Build from Source

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the server:
   ```bash
   npm start
   ```

## Docker Support

The IT Tools MCP Server supports Docker for easy deployment and consistent environments.

### Quick Start with Docker

```bash
# Build the Docker image
docker build -t it-tools-mcp .

# Run the container
docker run -i --rm it-tools-mcp
```

### Docker Compose

```bash
# Build and run with docker-compose
docker-compose up --build

# Run with input
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | docker-compose run --rm -T it-tools-mcp
```

### NPM Scripts for Docker

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

For detailed Docker usage instructions, see [DOCKER-USAGE.md](DOCKER-USAGE.md).

## Docker Setup for VS Code MCP Integration

The IT Tools MCP Server is now configured to run inside a Docker container for VS Code integration. This provides better isolation and consistency across different environments.

### Configuration Files

#### `.vscode/mcp.json`
```json
{
  "servers": {
    "it-tools-mcp": {
      "type": "stdio",
      "command": "/Volumes/Source/it-tools-mcp/mcp-docker-wrapper.sh"
    }
  }
}
```

#### `docker-compose.yml`
```yaml
services:
  it-tools-mcp:
    build: .
    container_name: it-tools-mcp-server
    stdin_open: true
    tty: true
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - /tmp:/tmp
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge
```

### Docker Scripts

- **`mcp-docker-wrapper.sh`** - Main wrapper script for VS Code MCP integration
- **`start-mcp-docker.sh`** - Manual startup script with status checks
- **`stop-mcp-docker.sh`** - Clean shutdown script
- **`test-docker-mcp.sh`** - Comprehensive testing script

### Usage

1. **Automatic (VS Code)**: The MCP configuration will automatically start the container when VS Code connects
2. **Manual**: Use `./start-mcp-docker.sh` to start the container manually
3. **Testing**: Use `./test-docker-mcp.sh` to verify functionality

### Benefits of Docker Setup

- **Isolation**: Server runs in its own container environment
- **Consistency**: Same environment across different machines
- **Easy Deployment**: Single command deployment
- **Resource Management**: Containerized resource usage
- **Security**: Isolated from host system

## Usage with Claude Desktop

To use this MCP server with Claude Desktop, add the following configuration to your `claude_desktop_config.json`:

### macOS/Linux
```json
{
  "mcpServers": {
    "it-tools": {
      "command": "node",
      "args": ["/absolute/path/to/it-tools-mcp/build/index.js"]
    }
  }
}
```

### Windows
```json
{
  "mcpServers": {
    "it-tools": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\it-tools-mcp\\build\\index.js"]
    }
  }
}
```

### Using Docker with Claude Desktop
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

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `base64-encode` | Encode text to Base64 | `text: string` |
| `base64-decode` | Decode Base64 text | `text: string` |
| `url-encode` | URL encode text | `text: string` |
| `url-decode` | URL decode text | `text: string` |
| `html-encode` | Encode HTML entities | `text: string` |
| `html-decode` | Decode HTML entities | `text: string` |
| `json-format` | Format and validate JSON | `json: string`, `indent?: number` |
| `json-minify` | Minify JSON | `json: string` |
| `hash-md5` | Generate MD5 hash | `text: string` |
| `hash-sha1` | Generate SHA1 hash | `text: string` |
| `hash-sha256` | Generate SHA256 hash | `text: string` |
| `hash-sha512` | Generate SHA512 hash | `text: string` |
| `uuid-generate` | Generate UUID v4 | None |
| `ulid-generate` | Generate ULID | None |
| `password-generate` | Generate secure password | `length?: number`, `includeUppercase?: boolean`, `includeLowercase?: boolean`, `includeNumbers?: boolean`, `includeSymbols?: boolean` |
| `text-uppercase` | Convert to uppercase | `text: string` |
| `text-lowercase` | Convert to lowercase | `text: string` |
| `text-capitalize` | Capitalize words | `text: string` |
| `text-camelcase` | Convert to camelCase | `text: string` |
| `text-pascalcase` | Convert to PascalCase | `text: string` |
| `text-kebabcase` | Convert to kebab-case | `text: string` |
| `text-snakecase` | Convert to snake_case | `text: string` |
| `timestamp-convert` | Convert timestamps | `input: string` |
| `text-stats` | Get text statistics | `text: string` |
| `qr-generate` | Generate ASCII QR code | `text: string`, `size?: number` |
| `color-hex-to-rgb` | Convert HEX to RGB | `hex: string` |
| `color-rgb-to-hex` | Convert RGB to HEX | `r: number`, `g: number`, `b: number` |
| `ip-subnet-calculator` | Calculate IPv4 subnet info | `ip: string`, `cidr: number` |
| `number-base-convert` | Convert number bases | `number: string`, `fromBase: number`, `toBase: number` |
| `lorem-ipsum` | Generate Lorem Ipsum text | `type?: 'words'|'sentences'|'paragraphs'`, `count?: number` |
| `mac-address-generate` | Generate MAC address | `prefix?: string`, `separator?: ':'|'-'` |
| `jwt-decode` | Decode JWT token | `token: string` |

## Complete Tool Reference

### All 72 Available Tools:

**Encoding & Decoding (8 tools):**
- `base64-encode` - Encode text to Base64
- `base64-decode` - Decode Base64 text
- `url-encode` - URL encode text
- `url-decode` - URL decode text
- `html-encode` - Encode HTML entities
- `html-decode` - Decode HTML entities
- `html-entities-extended` - Extended HTML entity encoding/decoding
- `text-to-binary` - Convert text to binary and vice versa

**Data Format Conversion (10 tools):**
- `json-format` - Format and validate JSON
- `json-minify` - Minify JSON by removing whitespace
- `json-to-csv` - Convert JSON to CSV format
- `json-to-toml` - Convert JSON to TOML format
- `json-diff` - Compare two JSON objects and show differences
- `xml-format` - Format and prettify XML
- `yaml-format` - Format and prettify YAML
- `sql-format` - Format and prettify SQL queries
- `toml-to-json` - Convert TOML to JSON format
- `markdown-to-html` - Convert Markdown to HTML
- `html-to-markdown` - Convert HTML to Markdown

**Security & Crypto (11 tools):**
- `hash-md5` - Generate MD5 hash
- `hash-sha1` - Generate SHA1 hash
- `hash-sha256` - Generate SHA256 hash
- `hash-sha512` - Generate SHA512 hash
- `hmac-generator` - Generate HMAC codes
- `bcrypt-hash` - Generate bcrypt hashes and verify passwords
- `jwt-decode` - Decode JWT tokens
- `basic-auth-generator` - Generate HTTP Basic Auth headers
- `bip39-generate` - Generate Bitcoin mnemonic phrases
- `password-generate` - Generate secure passwords
- `token-generator` - Generate secure random tokens
- `otp-code-generator` - Generate TOTP codes

**Text Processing (13 tools):**
- `text-uppercase` - Convert text to UPPERCASE
- `text-lowercase` - Convert text to lowercase
- `text-capitalize` - Capitalize first letter of each word
- `text-camelcase` - Convert text to camelCase
- `text-pascalcase` - Convert text to PascalCase
- `text-kebabcase` - Convert text to kebab-case
- `text-snakecase` - Convert text to snake_case
- `text-stats` - Get text statistics
- `text-diff` - Compare two texts and show differences
- `ascii-art-text` - Generate ASCII art text
- `text-to-nato-alphabet` - Convert text to NATO phonetic alphabet
- `string-obfuscator` - Obfuscate text using various methods
- `slugify-string` - Convert text to URL-friendly slugs
- `numeronym-generator` - Generate numeronyms (e.g., i18n)
- `lorem-ipsum` - Generate Lorem Ipsum placeholder text
- `emoji-search` - Search for emojis by name or category

**Network & Web (8 tools):**
- `ip-subnet-calculator` - Calculate IPv4 subnet information
- `ipv4-subnet-calc` - Enhanced IPv4 subnet calculator
- `ipv6-ula-generator` - Generate IPv6 ULA prefixes
- `url-parse` - Parse URLs into components
- `random-port` - Generate random port numbers
- `mac-address-generate` - Generate random MAC addresses
- `phone-format` - Parse and format phone numbers
- `iban-validate` - Validate and parse IBAN numbers

**Math & Calculations (6 tools):**
- `math-eval` - Evaluate mathematical expressions
- `number-base-convert` - Convert numbers between bases
- `roman-numeral-convert` - Convert between decimal and Roman numerals
- `temperature-convert` - Convert between temperature units
- `percentage-calc` - Calculate percentages and changes

**ID & Code Generators (6 tools):**
- `uuid-generate` - Generate random UUID v4
- `ulid-generate` - Generate ULID identifiers
- `qr-generate` - Generate ASCII QR codes
- `wifi-qr-code-generator` - Generate WiFi QR code data
- `svg-placeholder-generator` - Generate SVG placeholder images

**Development Tools (8 tools):**
- `regex-tester` - Test regular expressions
- `crontab-generate` - Generate cron expressions
- `list-converter` - Convert between list formats
- `mime-types` - Look up MIME types
- `http-status-codes` - HTTP status code reference
- `device-info` - Get system information

**Utility Tools (2 tools):**
- `color-hex-to-rgb` - Convert HEX to RGB colors
- `color-rgb-to-hex` - Convert RGB to HEX colors
- `email-normalizer` - Normalize email addresses

## Architecture

This MCP server is built with:
- **TypeScript** for type safety and better development experience
- **Zod** for robust input validation and schema definition
- **Node.js built-in modules** (crypto, Buffer, etc.) for maximum compatibility
- **MCP SDK** for proper Model Context Protocol implementation
- **Docker support** for easy deployment and containerization

The server implements 72 distinct tools across 8 major categories, providing comprehensive IT utility functionality that matches and extends the popular IT Tools web application.

## Examples

### Using with Claude Desktop

Once configured, you can ask Claude to use these tools:

- "Can you base64 encode the text 'Hello World'?"
- "Generate a SHA256 hash for 'password123'"
- "Format this JSON: {'name':'John','age':30}"
- "Convert 'hello world' to camelCase"
- "Generate a 16-character password with symbols"
- "What's the timestamp 1640995200 in human readable format?"
- "Convert the HEX color #FF5733 to RGB"
- "Calculate subnet info for 192.168.1.0/24"
- "Convert the number FF from hexadecimal to decimal"
- "Generate a random MAC address with prefix 00:1B:44"
- "Generate 3 paragraphs of Lorem Ipsum text"
- "Create an ASCII QR code for 'https://example.com'"
- "Decode this JWT token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

## Development

### Project Structure
```
it-tools-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript output
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   ├── mcp.json         # MCP server configuration
│   └── tasks.json       # VS Code tasks
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
- `npm run build` - Build the TypeScript project
- `npm run start` - Start the server
- `npm run dev` - Build and start in development mode

### Adding New Tools

To add a new tool:

1. Add the tool definition using `server.tool()` in `src/index.ts`
2. Define the input schema using Zod
3. Implement the tool logic
4. Update the README.md with tool documentation
5. Rebuild with `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Related Projects

This MCP server is inspired by [IT Tools](https://github.com/CorentinTh/it-tools) - a collection of handy online tools for developers.
