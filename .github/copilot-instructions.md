<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# IT Tools MCP Server

This is an MCP (Model Context Protocol) server that provides access to various IT tools and utilities for developers. You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

## Available Tools

This server provides the following developer tools:

- **Encoding/Decoding**: Base64, URL, HTML encoding and decoding
- **JSON Tools**: Format, minify, and validate JSON
- **Hashing**: MD5, SHA1, SHA256, SHA512 hash generation
- **Text Conversion**: Case conversion (uppercase, lowercase, camelCase, PascalCase, kebab-case, snake_case)
- **UUID Generation**: Generate random UUID v4
- **Password Generation**: Secure password generation with customizable options
- **Timestamp Conversion**: Convert between Unix timestamps and human-readable dates
- **Text Statistics**: Analyze text for character count, word count, etc.

## Architecture

- Built with TypeScript and the MCP SDK
- Uses Zod for input validation
- Provides stdio transport for communication
- Can be containerized with Docker for easy deployment

## Development

- Use TypeScript for type safety
- Follow MCP protocol specifications
- Validate all inputs with Zod schemas
- Handle errors gracefully and provide meaningful error messages
