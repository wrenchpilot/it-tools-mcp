#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createHash, randomUUID } from "crypto";

// Create server instance
const server = new McpServer({
  name: "it-tools-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Base64 encoding tool
server.tool(
  "base64-encode",
  "Encode text to Base64",
  {
    text: z.string().describe("Text to encode to Base64"),
  },
  async ({ text }) => {
    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    return {
      content: [
        {
          type: "text",
          text: `Base64 encoded: ${encoded}`,
        },
      ],
    };
  }
);

// Base64 decoding tool
server.tool(
  "base64-decode",
  "Decode Base64 text",
  {
    text: z.string().describe("Base64 text to decode"),
  },
  async ({ text }) => {
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf-8');
      return {
        content: [
          {
            type: "text",
            text: `Base64 decoded: ${decoded}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error decoding Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// URL encoding tool
server.tool(
  "url-encode",
  "URL encode text",
  {
    text: z.string().describe("Text to URL encode"),
  },
  async ({ text }) => {
    const encoded = encodeURIComponent(text);
    return {
      content: [
        {
          type: "text",
          text: `URL encoded: ${encoded}`,
        },
      ],
    };
  }
);

// URL decoding tool
server.tool(
  "url-decode",
  "URL decode text",
  {
    text: z.string().describe("URL encoded text to decode"),
  },
  async ({ text }) => {
    try {
      const decoded = decodeURIComponent(text);
      return {
        content: [
          {
            type: "text",
            text: `URL decoded: ${decoded}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error decoding URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// JSON formatting tool
server.tool(
  "json-format",
  "Format and validate JSON",
  {
    json: z.string().describe("JSON string to format"),
    indent: z.number().min(0).max(10).default(2).describe("Number of spaces for indentation"),
  },
  async ({ json, indent = 2 }) => {
    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, indent);
      return {
        content: [
          {
            type: "text",
            text: `Formatted JSON:\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// JSON minify tool
server.tool(
  "json-minify",
  "Minify JSON by removing whitespace",
  {
    json: z.string().describe("JSON string to minify"),
  },
  async ({ json }) => {
    try {
      const parsed = JSON.parse(json);
      const minified = JSON.stringify(parsed);
      return {
        content: [
          {
            type: "text",
            text: `Minified JSON: ${minified}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Hash generation tools
const hashAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'] as const;

hashAlgorithms.forEach(algorithm => {
  server.tool(
    `hash-${algorithm}`,
    `Generate ${algorithm.toUpperCase()} hash`,
    {
      text: z.string().describe(`Text to hash with ${algorithm.toUpperCase()}`),
    },
    async ({ text }) => {
      const hash = createHash(algorithm);
      hash.update(text);
      const result = hash.digest('hex');
      return {
        content: [
          {
            type: "text",
            text: `${algorithm.toUpperCase()} hash: ${result}`,
          },
        ],
      };
    }
  );
});

// UUID generation tool
server.tool(
  "uuid-generate",
  "Generate a random UUID v4",
  {},
  async () => {
    const uuid = randomUUID();
    return {
      content: [
        {
          type: "text",
          text: `Generated UUID: ${uuid}`,
        },
      ],
    };
  }
);

// Text case conversion tools
server.tool(
  "text-uppercase",
  "Convert text to uppercase",
  {
    text: z.string().describe("Text to convert to uppercase"),
  },
  async ({ text }) => {
    return {
      content: [
        {
          type: "text",
          text: `Uppercase: ${text.toUpperCase()}`,
        },
      ],
    };
  }
);

server.tool(
  "text-lowercase",
  "Convert text to lowercase",
  {
    text: z.string().describe("Text to convert to lowercase"),
  },
  async ({ text }) => {
    return {
      content: [
        {
          type: "text",
          text: `Lowercase: ${text.toLowerCase()}`,
        },
      ],
    };
  }
);

server.tool(
  "text-capitalize",
  "Capitalize first letter of each word",
  {
    text: z.string().describe("Text to capitalize"),
  },
  async ({ text }) => {
    const capitalized = text.replace(/\b\w/g, l => l.toUpperCase());
    return {
      content: [
        {
          type: "text",
          text: `Capitalized: ${capitalized}`,
        },
      ],
    };
  }
);

server.tool(
  "text-camelcase",
  "Convert text to camelCase",
  {
    text: z.string().describe("Text to convert to camelCase"),
  },
  async ({ text }) => {
    const camelCase = text
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
    return {
      content: [
        {
          type: "text",
          text: `camelCase: ${camelCase}`,
        },
      ],
    };
  }
);

server.tool(
  "text-pascalcase",
  "Convert text to PascalCase",
  {
    text: z.string().describe("Text to convert to PascalCase"),
  },
  async ({ text }) => {
    const pascalCase = text
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (chr) => chr.toUpperCase());
    return {
      content: [
        {
          type: "text",
          text: `PascalCase: ${pascalCase}`,
        },
      ],
    };
  }
);

server.tool(
  "text-kebabcase",
  "Convert text to kebab-case",
  {
    text: z.string().describe("Text to convert to kebab-case"),
  },
  async ({ text }) => {
    const kebabCase = text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
    return {
      content: [
        {
          type: "text",
          text: `kebab-case: ${kebabCase}`,
        },
      ],
    };
  }
);

server.tool(
  "text-snakecase",
  "Convert text to snake_case",
  {
    text: z.string().describe("Text to convert to snake_case"),
  },
  async ({ text }) => {
    const snakeCase = text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase()
      .replace(/^_+|_+$/g, '');
    return {
      content: [
        {
          type: "text",
          text: `snake_case: ${snakeCase}`,
        },
      ],
    };
  }
);

// HTML encode/decode tools
server.tool(
  "html-encode",
  "Encode HTML entities",
  {
    text: z.string().describe("Text to HTML encode"),
  },
  async ({ text }) => {
    const encoded = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return {
      content: [
        {
          type: "text",
          text: `HTML encoded: ${encoded}`,
        },
      ],
    };
  }
);

server.tool(
  "html-decode",
  "Decode HTML entities",
  {
    text: z.string().describe("HTML encoded text to decode"),
  },
  async ({ text }) => {
    const decoded = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return {
      content: [
        {
          type: "text",
          text: `HTML decoded: ${decoded}`,
        },
      ],
    };
  }
);

// Password generation tool
server.tool(
  "password-generate",
  "Generate a secure password",
  {
    length: z.number().min(4).max(128).default(16).describe("Password length"),
    includeUppercase: z.boolean().default(true).describe("Include uppercase letters"),
    includeLowercase: z.boolean().default(true).describe("Include lowercase letters"),
    includeNumbers: z.boolean().default(true).describe("Include numbers"),
    includeSymbols: z.boolean().default(true).describe("Include symbols"),
  },
  async ({ length = 16, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true }) => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      return {
        content: [
          {
            type: "text",
            text: "Error: At least one character type must be selected",
          },
        ],
      };
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Generated password: ${password}`,
        },
      ],
    };
  }
);

// Timestamp conversion tool
server.tool(
  "timestamp-convert",
  "Convert between Unix timestamp and human-readable date",
  {
    input: z.string().describe("Unix timestamp (seconds) or ISO date string"),
  },
  async ({ input }) => {
    try {
      let date: Date;
      let result: string;
      
      // Check if input is a number (Unix timestamp)
      if (/^\d+$/.test(input)) {
        const timestamp = parseInt(input, 10);
        date = new Date(timestamp * 1000);
        result = `Unix timestamp ${timestamp} = ${date.toISOString()} (${date.toUTCString()})`;
      } else {
        // Try to parse as date string
        date = new Date(input);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        const timestamp = Math.floor(date.getTime() / 1000);
        result = `Date "${input}" = Unix timestamp ${timestamp}`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Text statistics tool
server.tool(
  "text-stats",
  "Get statistics about text (character count, word count, etc.)",
  {
    text: z.string().describe("Text to analyze"),
  },
  async ({ text }) => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    const stats = [
      `Characters: ${characters}`,
      `Characters (no spaces): ${charactersNoSpaces}`,
      `Words: ${words}`,
      `Lines: ${lines}`,
      `Paragraphs: ${paragraphs}`
    ].join('\n');
    
    return {
      content: [
        {
          type: "text",
          text: `Text Statistics:\n${stats}`,
        },
      ],
    };
  }
);

// Run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IT Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
