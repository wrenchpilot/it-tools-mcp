# IT Tools MCP Server

A Model Context Protocol (MCP) server that provides access to various IT tools and utilities commonly used by developers. This server exposes a comprehensive set of tools for encoding/decoding, text manipulation, hashing, and other common development tasks.

## Features

### 🔧 Encoding & Decoding Tools
- **Base64**: Encode and decode Base64 strings
- **URL**: URL encoding and decoding
- **HTML**: HTML entity encoding and decoding

### 📝 JSON Tools
- **Format**: Pretty-print JSON with customizable indentation
- **Minify**: Remove whitespace from JSON
- **Validate**: Parse and validate JSON syntax

### 🔐 Security Tools
- **Hashing**: Generate MD5, SHA1, SHA256, SHA512 hashes
- **UUID**: Generate random UUID v4
- **Password**: Generate secure passwords with customizable options

### ✨ Text Manipulation
- **Case Conversion**: 
  - UPPERCASE
  - lowercase
  - camelCase
  - PascalCase
  - kebab-case
  - snake_case
  - Capitalize Words
- **Text Statistics**: Analyze character count, word count, lines, paragraphs

### ⏰ Time Tools
- **Timestamp Conversion**: Convert between Unix timestamps and human-readable dates

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

## Examples

### Using with Claude Desktop

Once configured, you can ask Claude to use these tools:

- "Can you base64 encode the text 'Hello World'?"
- "Generate a SHA256 hash for 'password123'"
- "Format this JSON: {'name':'John','age':30}"
- "Convert 'hello world' to camelCase"
- "Generate a 16-character password with symbols"
- "What's the timestamp 1640995200 in human readable format?"

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
