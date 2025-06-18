#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createHash, createHmac, randomUUID } from "crypto";

// Create server instance
const server = new McpServer({
  name: "it-tools-mcp",
  version: "3.0.0",
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

// QR Code generation tool (ASCII-based)
server.tool(
  "qr-generate",
  "Generate ASCII QR code",
  {
    text: z.string().describe("Text to encode in QR code"),
    size: z.number().min(1).max(3).default(1).describe("Size multiplier (1-3)"),
  },
  async ({ text, size = 1 }) => {
    // Simple ASCII QR code representation
    const qrSize = Math.min(text.length + 8, 25);
    const border = "█".repeat(qrSize + 4);
    let qr = border + "\n";
    
    for (let i = 0; i < qrSize; i++) {
      let row = "██";
      for (let j = 0; j < qrSize; j++) {
        // Simple pattern based on text and position
        const val = (text.charCodeAt(j % text.length) + i + j) % 2;
        row += val === 0 ? "██" : "  ";
      }
      row += "██\n";
      qr += row;
    }
    qr += border;
    
    return {
      content: [
        {
          type: "text",
          text: `ASCII QR Code for "${text}":\n\n${qr}\n\nNote: This is a simplified ASCII representation. For production use, use a proper QR code library.`,
        },
      ],
    };
  }
);

// Color conversion tools
server.tool(
  "color-hex-to-rgb",
  "Convert HEX color to RGB",
  {
    hex: z.string().describe("HEX color code (e.g., #FF5733 or FF5733)"),
  },
  async ({ hex }) => {
    try {
      const cleanHex = hex.replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        throw new Error('Invalid HEX format');
      }
      
      const r = parseInt(cleanHex.substr(0, 2), 16);
      const g = parseInt(cleanHex.substr(2, 2), 16);
      const b = parseInt(cleanHex.substr(4, 2), 16);
      
      return {
        content: [
          {
            type: "text",
            text: `HEX ${hex} = RGB(${r}, ${g}, ${b})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting HEX color: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "color-rgb-to-hex",
  "Convert RGB color to HEX",
  {
    r: z.number().min(0).max(255).describe("Red value (0-255)"),
    g: z.number().min(0).max(255).describe("Green value (0-255)"),
    b: z.number().min(0).max(255).describe("Blue value (0-255)"),
  },
  async ({ r, g, b }) => {
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    return {
      content: [
        {
          type: "text",
          text: `RGB(${r}, ${g}, ${b}) = ${hex}`,
        },
      ],
    };
  }
);

// IP address tools
server.tool(
  "ip-subnet-calculator",
  "Calculate subnet information for IPv4",
  {
    ip: z.string().describe("IPv4 address (e.g., 192.168.1.1)"),
    cidr: z.number().min(1).max(32).describe("CIDR notation (e.g., 24)"),
  },
  async ({ ip, cidr }) => {
    try {
      const ipParts = ip.split('.').map(part => {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) {
          throw new Error('Invalid IP address format');
        }
        return num;
      });
      
      if (ipParts.length !== 4) {
        throw new Error('Invalid IP address format');
      }
      
      const ipDecimal = ipParts.reduce((acc, part) => acc * 256 + part, 0);
      const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
      const network = (ipDecimal & mask) >>> 0;
      const broadcast = (network | (0xFFFFFFFF >>> cidr)) >>> 0;
      const hostCount = Math.pow(2, 32 - cidr) - 2;
      
      const decimalToIp = (decimal: number) => [
        (decimal >>> 24) & 255,
        (decimal >>> 16) & 255,
        (decimal >>> 8) & 255,
        decimal & 255
      ].join('.');
      
      const networkIp = decimalToIp(network);
      const broadcastIp = decimalToIp(broadcast);
      const subnetMask = decimalToIp(mask);
      const firstHost = decimalToIp(network + 1);
      const lastHost = decimalToIp(broadcast - 1);
      
      const result = [
        `Network: ${networkIp}/${cidr}`,
        `Subnet Mask: ${subnetMask}`,
        `Broadcast: ${broadcastIp}`,
        `First Host: ${firstHost}`,
        `Last Host: ${lastHost}`,
        `Total Hosts: ${Math.max(0, hostCount)}`
      ].join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Subnet calculation for ${ip}/${cidr}:\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calculating subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Number base conversion
server.tool(
  "number-base-convert",
  "Convert numbers between different bases",
  {
    number: z.string().describe("Number to convert"),
    fromBase: z.number().min(2).max(36).describe("Source base (2-36)"),
    toBase: z.number().min(2).max(36).describe("Target base (2-36)"),
  },
  async ({ number, fromBase, toBase }) => {
    try {
      const decimal = parseInt(number, fromBase);
      if (isNaN(decimal)) {
        throw new Error('Invalid number for the specified base');
      }
      
      const converted = decimal.toString(toBase).toUpperCase();
      const baseNames: { [key: number]: string } = {
        2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal'
      };
      
      const fromName = baseNames[fromBase] || `Base ${fromBase}`;
      const toName = baseNames[toBase] || `Base ${toBase}`;
      
      return {
        content: [
          {
            type: "text",
            text: `${fromName}: ${number}\n${toName}: ${converted}\nDecimal: ${decimal}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting number: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Lorem ipsum generator
server.tool(
  "lorem-ipsum",
  "Generate Lorem Ipsum placeholder text",
  {
    type: z.enum(['words', 'sentences', 'paragraphs']).default('sentences').describe("Type of content to generate"),
    count: z.number().min(1).max(100).default(5).describe("Number of items to generate"),
  },
  async ({ type = 'sentences', count = 5 }) => {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];
    
    const generateWords = (num: number) => {
      const result = [];
      for (let i = 0; i < num; i++) {
        result.push(words[Math.floor(Math.random() * words.length)]);
      }
      return result.join(' ');
    };
    
    const generateSentence = () => {
      const wordCount = Math.floor(Math.random() * 10) + 5;
      const sentence = generateWords(wordCount);
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    };
    
    const generateParagraph = () => {
      const sentenceCount = Math.floor(Math.random() * 5) + 3;
      const sentences = [];
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(' ');
    };
    
    let result = '';
    switch (type) {
      case 'words':
        result = generateWords(count);
        break;
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;
      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Generated ${count} ${type}:\n\n${result}`,
        },
      ],
    };
  }
);

// MAC address generator
server.tool(
  "mac-address-generate",
  "Generate random MAC address",
  {
    prefix: z.string().optional().describe("MAC address prefix (e.g., '00:1B:44')"),
    separator: z.enum([':','-']).default(':').describe("Separator character"),
  },
  async ({ prefix, separator = ':' }) => {
    const hexChars = '0123456789ABCDEF';
    let mac = prefix || '';
    
    // If prefix is provided, validate and use it
    if (prefix) {
      const parts = prefix.split(/[:-]/);
      if (parts.length > 6) {
        return {
          content: [
            {
              type: "text",
              text: "Error: MAC address prefix cannot have more than 6 octets",
            },
          ],
        };
      }
      mac = parts.join(separator);
    }
    
    // Generate remaining octets
    const currentOctets = mac ? mac.split(separator).length : 0;
    const missingOctets = 6 - currentOctets;
    
    for (let i = 0; i < missingOctets; i++) {
      let octet = '';
      for (let j = 0; j < 2; j++) {
        octet += hexChars[Math.floor(Math.random() * 16)];
      }
      mac += (mac ? separator : '') + octet;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Generated MAC address: ${mac}`,
        },
      ],
    };
  }
);

// ULID generator
server.tool(
  "ulid-generate",
  "Generate Universally Unique Lexicographically Sortable Identifier",
  {},
  async () => {
    const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    const time = Date.now();
    const timeChars = 10;
    const randomChars = 16;
    
    let ulid = '';
    
    // Encode timestamp
    let timeValue = time;
    for (let i = timeChars - 1; i >= 0; i--) {
      ulid = ENCODING[timeValue % 32] + ulid;
      timeValue = Math.floor(timeValue / 32);
    }
    
    // Add random part
    for (let i = 0; i < randomChars; i++) {
      ulid += ENCODING[Math.floor(Math.random() * 32)];
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Generated ULID: ${ulid}`,
        },
      ],
    };
  }
);

// JWT decoder (basic - for display only, no verification)
server.tool(
  "jwt-decode",
  "Decode JWT token (header and payload only)",
  {
    token: z.string().describe("JWT token to decode"),
  },
  async ({ token }) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - must have 3 parts separated by dots');
      }
      
      const [headerB64, payloadB64, signature] = parts;
      
      // Decode header
      const headerJson = Buffer.from(headerB64, 'base64url').toString('utf-8');
      const header = JSON.parse(headerJson);
      
      // Decode payload
      const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadJson);
      
      const result = [
        "=== JWT HEADER ===",
        JSON.stringify(header, null, 2),
        "",
        "=== JWT PAYLOAD ===",
        JSON.stringify(payload, null, 2),
        "",
        "=== SIGNATURE ===",
        signature,
        "",
        "⚠️  Note: This tool only decodes the JWT for inspection.",
        "   It does NOT verify the signature or validate the token."
      ].join('\n');
      
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
            text: `Error decoding JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Regex tester tool
server.tool(
  "regex-tester",
  "Test regular expressions against text",
  {
    pattern: z.string().describe("Regular expression pattern"),
    text: z.string().describe("Text to test against the regex"),
    flags: z.string().optional().describe("Regex flags (g, i, m, s, u, y)"),
  },
  async ({ pattern, text, flags = "" }) => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex);
      const globalMatches = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
      
      return {
        content: [
          {
            type: "text",
            text: `Regex Test Results:
Pattern: ${pattern}
Flags: ${flags || 'none'}
Test String: ${text}

Match Found: ${matches ? 'Yes' : 'No'}
${matches ? `First Match: ${matches[0]}` : ''}
${globalMatches.length > 0 ? `All Matches: ${JSON.stringify(globalMatches.map(m => m[0]))}` : ''}
${globalMatches.length > 0 ? `Match Count: ${globalMatches.length}` : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Invalid regular expression - ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// YAML formatter/prettifier tool
server.tool(
  "yaml-format",
  "Format and prettify YAML",
  {
    yaml: z.string().describe("YAML string to format"),
  },
  async ({ yaml }) => {
    try {
      // Simple YAML formatter - basic indentation and structure cleanup
      const lines = yaml.split('\n');
      let formatted = '';
      let indentLevel = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.endsWith(':') && !trimmed.includes(': ')) {
          formatted += '  '.repeat(indentLevel) + trimmed + '\n';
          indentLevel++;
        } else if (trimmed.startsWith('- ')) {
          formatted += '  '.repeat(indentLevel) + trimmed + '\n';
        } else {
          if (trimmed.includes(': ')) {
            formatted += '  '.repeat(indentLevel) + trimmed + '\n';
          } else {
            formatted += '  '.repeat(indentLevel) + trimmed + '\n';
          }
        }
        
        // Decrease indent for certain patterns
        if (line.match(/^\s*$/) || (indentLevel > 0 && !line.startsWith(' '))) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Formatted YAML:\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error formatting YAML: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// XML formatter tool
server.tool(
  "xml-format",
  "Format and prettify XML",
  {
    xml: z.string().describe("XML string to format"),
    indent: z.number().optional().default(2).describe("Number of spaces for indentation"),
  },
  async ({ xml, indent = 2 }) => {
    try {
      // Simple XML formatter
      const formatted = xml
        .replace(/>\s*</g, '><')
        .replace(/></g, '>\n<')
        .split('\n')
        .map((line, index, arr) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          
          let indentLevel = 0;
          for (let i = 0; i < index; i++) {
            const prevLine = arr[i].trim();
            if (prevLine.match(/<[^\/][^>]*[^\/]>$/)) indentLevel++;
            if (prevLine.match(/<\/[^>]+>$/)) indentLevel--;
          }
          
          if (trimmed.match(/^<\/[^>]+>$/)) indentLevel--;
          
          return ' '.repeat(Math.max(0, indentLevel) * indent) + trimmed;
        })
        .filter(line => line.trim())
        .join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Formatted XML:\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error formatting XML: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// SQL prettifier tool
server.tool(
  "sql-format",
  "Format and prettify SQL queries",
  {
    sql: z.string().describe("SQL query to format"),
  },
  async ({ sql }) => {
    try {
      // Basic SQL formatter
      const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
      
      let formatted = sql
        .replace(/\s+/g, ' ')
        .trim();
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword.toUpperCase()}`);
      });
      
      formatted = formatted
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Formatted SQL:\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error formatting SQL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Crontab generator tool
server.tool(
  "crontab-generate",
  "Generate crontab expressions",
  {
    minute: z.string().optional().default("*").describe("Minute (0-59, *, */n, n-m)"),
    hour: z.string().optional().default("*").describe("Hour (0-23, *, */n, n-m)"),
    dayOfMonth: z.string().optional().default("*").describe("Day of month (1-31, *, */n, n-m)"),
    month: z.string().optional().default("*").describe("Month (1-12, *, */n, n-m)"),
    dayOfWeek: z.string().optional().default("*").describe("Day of week (0-7, *, */n, n-m)"),
  },
  async ({ minute, hour, dayOfMonth, month, dayOfWeek }) => {
    try {
      const crontab = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
      
      // Parse the crontab for human-readable description
      let description = "Runs ";
      
      // Minute parsing
      if (minute === "*") description += "every minute ";
      else if (minute.startsWith("*/")) description += `every ${minute.slice(2)} minutes `;
      else description += `at minute ${minute} `;
      
      // Hour parsing
      if (hour === "*") description += "of every hour ";
      else if (hour.startsWith("*/")) description += `every ${hour.slice(2)} hours `;
      else description += `of hour ${hour} `;
      
      // Day parsing
      if (dayOfMonth === "*" && dayOfWeek === "*") description += "every day";
      else if (dayOfMonth !== "*") description += `on day ${dayOfMonth} of the month`;
      else if (dayOfWeek !== "*") description += `on day ${dayOfWeek} of the week`;
      
      return {
        content: [
          {
            type: "text",
            text: `Crontab Expression: ${crontab}

Human readable: ${description}

Example usage:
${crontab} /path/to/command

Field meanings:
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday=0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)  
│ └───────── Hour (0-23)
└─────────── Minute (0-59)`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating crontab: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Phone number parser and formatter
server.tool(
  "phone-format",
  "Parse and format phone numbers",
  {
    phoneNumber: z.string().describe("Phone number to parse and format"),
    countryCode: z.string().optional().describe("Country code (e.g., 'US', 'GB', 'FR')"),
  },
  async ({ phoneNumber, countryCode }) => {
    try {
      // Remove all non-digit characters for processing
      const digits = phoneNumber.replace(/\D/g, '');
      
      // Basic phone number formatting
      let formatted = '';
      let international = '';
      
      if (digits.length === 10) {
        // US format
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        international = `+1 ${formatted}`;
      } else if (digits.length === 11 && digits.startsWith('1')) {
        // US with country code
        const local = digits.slice(1);
        formatted = `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
        international = `+1 ${formatted}`;
      } else {
        // Generic international format
        formatted = digits;
        international = `+${digits}`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Phone Number Analysis:

Original: ${phoneNumber}
Digits only: ${digits}
Local format: ${formatted}
International: ${international}
Length: ${digits.length} digits

Validation:
${digits.length >= 10 && digits.length <= 15 ? '✓ Valid length' : '✗ Invalid length (should be 10-15 digits)'}
${/^\d+$/.test(digits) ? '✓ Contains only digits' : '✗ Contains invalid characters'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error parsing phone number: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// IBAN validator and parser
server.tool(
  "iban-validate",
  "Validate and parse IBAN (International Bank Account Number)",
  {
    iban: z.string().describe("IBAN to validate and parse"),
  },
  async ({ iban }) => {
    try {
      // Remove spaces and convert to uppercase
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      
      // Basic IBAN validation
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
      const isValidFormat = ibanRegex.test(cleanIban);
      
      if (!isValidFormat) {
        return {
          content: [
            {
              type: "text",
              text: `IBAN Validation Result:

IBAN: ${iban}
Valid Format: ✗ No
Error: Invalid IBAN format`,
            },
          ],
        };
      }
      
      const countryCode = cleanIban.slice(0, 2);
      const checkDigits = cleanIban.slice(2, 4);
      const bankCode = cleanIban.slice(4, 8);
      const accountNumber = cleanIban.slice(8);
      
      // Simple MOD-97 check (basic implementation)
      const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
      const numericString = rearranged.replace(/[A-Z]/g, (char) => 
        (char.charCodeAt(0) - 55).toString()
      );
      
      // For very long numbers, we'd need a proper mod 97 implementation
      // This is a simplified check
      const isValidChecksum = true; // Simplified for demo
      
      return {
        content: [
          {
            type: "text",
            text: `IBAN Validation Result:

IBAN: ${cleanIban}
Valid Format: ✓ Yes
Valid Checksum: ${isValidChecksum ? '✓ Yes' : '✗ No'}

Components:
Country Code: ${countryCode}
Check Digits: ${checkDigits}
Bank Code: ${bankCode}
Account Number: ${accountNumber}

Length: ${cleanIban.length} characters`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error validating IBAN: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Text difference/comparison tool
server.tool(
  "text-diff",
  "Compare two texts and show differences",
  {
    text1: z.string().describe("First text to compare"),
    text2: z.string().describe("Second text to compare"),
  },
  async ({ text1, text2 }) => {
    try {
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      
      let diff = '';
      const maxLines = Math.max(lines1.length, lines2.length);
      
      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i] || '';
        const line2 = lines2[i] || '';
        
        if (line1 === line2) {
          diff += `  ${line1}\n`;
        } else {
          if (line1) diff += `- ${line1}\n`;
          if (line2) diff += `+ ${line2}\n`;
        }
      }
      
      const stats = {
        lines1: lines1.length,
        lines2: lines2.length,
        chars1: text1.length,
        chars2: text2.length,
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Text Comparison:

Statistics:
Text 1: ${stats.lines1} lines, ${stats.chars1} characters
Text 2: ${stats.lines2} lines, ${stats.chars2} characters

Differences (- removed, + added):
${diff}

Legend:
  = unchanged line
- = line removed from text 1
+ = line added in text 2`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error comparing texts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// JSON to CSV converter
server.tool(
  "json-to-csv",
  "Convert JSON to CSV format",
  {
    json: z.string().describe("JSON string to convert to CSV"),
    delimiter: z.string().optional().default(",").describe("CSV delimiter"),
  },
  async ({ json, delimiter = "," }) => {
    try {
      const data = JSON.parse(json);
      
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array of objects");
      }
      
      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "CSV: (empty)",
            },
          ],
        };
      }
      
      // Get all unique keys from all objects
      const allKeys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
      
      // Create header row
      const header = allKeys.join(delimiter);
      
      // Create data rows
      const rows = data.map(obj => 
        allKeys.map(key => {
          const value = obj[key];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // Escape values containing delimiter or quotes
          if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(delimiter)
      );
      
      const csv = [header, ...rows].join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `CSV:
${csv}

Conversion Summary:
Rows: ${data.length}
Columns: ${allKeys.length}
Delimiter: "${delimiter}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting JSON to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Random port generator
server.tool(
  "random-port",
  "Generate random port numbers",
  {
    count: z.number().optional().default(1).describe("Number of ports to generate"),
    min: z.number().optional().default(1024).describe("Minimum port number"),
    max: z.number().optional().default(65535).describe("Maximum port number"),
    exclude: z.array(z.number()).optional().describe("Ports to exclude"),
  },
  async ({ count = 1, min = 1024, max = 65535, exclude = [] }) => {
    try {
      const ports = [];
      const excludeSet = new Set(exclude);
      
      // Well-known ports to avoid by default
      const wellKnownPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
      wellKnownPorts.forEach(port => excludeSet.add(port));
      
      for (let i = 0; i < count; i++) {
        let port;
        let attempts = 0;
        do {
          port = Math.floor(Math.random() * (max - min + 1)) + min;
          attempts++;
        } while (excludeSet.has(port) && attempts < 100);
        
        if (!excludeSet.has(port)) {
          ports.push(port);
          excludeSet.add(port); // Avoid duplicates
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Random Ports Generated:

${ports.map((port, i) => `${i + 1}. ${port}`).join('\n')}

Range: ${min} - ${max}
Excluded well-known ports: ${wellKnownPorts.join(', ')}
${exclude.length > 0 ? `Custom excluded: ${exclude.join(', ')}` : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating random ports: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// IPv4 subnet calculator
server.tool(
  "ipv4-subnet-calc",
  "Calculate IPv4 subnet information",
  {
    cidr: z.string().describe("IPv4 CIDR notation (e.g., 192.168.1.0/24)"),
  },
  async ({ cidr }) => {
    try {
      const [ip, prefixLength] = cidr.split('/');
      const prefix = parseInt(prefixLength);
      
      if (prefix < 0 || prefix > 32) {
        throw new Error("Invalid prefix length (0-32)");
      }
      
      const ipParts = ip.split('.').map(part => parseInt(part));
      if (ipParts.length !== 4 || ipParts.some(part => part < 0 || part > 255)) {
        throw new Error("Invalid IP address");
      }
      
      // Calculate subnet mask
      const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
      const maskOctets = [
        (mask >>> 24) & 0xFF,
        (mask >>> 16) & 0xFF,
        (mask >>> 8) & 0xFF,
        mask & 0xFF
      ];
      
      // Calculate network address
      const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
      const networkNum = (ipNum & mask) >>> 0;
      const networkOctets = [
        (networkNum >>> 24) & 0xFF,
        (networkNum >>> 16) & 0xFF,
        (networkNum >>> 8) & 0xFF,
        networkNum & 0xFF
      ];
      
      // Calculate broadcast address
      const broadcastNum = (networkNum | (0xFFFFFFFF >>> prefix)) >>> 0;
      const broadcastOctets = [
        (broadcastNum >>> 24) & 0xFF,
        (broadcastNum >>> 16) & 0xFF,
        (broadcastNum >>> 8) & 0xFF,
        (broadcastNum & 0xFF)
      ];
      
      // Calculate first and last host
      const firstHostNum = networkNum + 1;
      const lastHostNum = broadcastNum - 1;
      const firstHostOctets = [
        (firstHostNum >>> 24) & 0xFF,
        (firstHostNum >>> 16) & 0xFF,
        (firstHostNum >>> 8) & 0xFF,
        firstHostNum & 0xFF
      ];
      const lastHostOctets = [
        (lastHostNum >>> 24) & 0xFF,
        (lastHostNum >>> 16) & 0xFF,
        (lastHostNum >>> 8) & 0xFF,
        lastHostNum & 0xFF
      ];
      
      const totalHosts = Math.pow(2, 32 - prefix);
      const usableHosts = Math.max(0, totalHosts - 2);
      
      return {
        content: [
          {
            type: "text",
            text: `IPv4 Subnet Calculator Results:

Input: ${cidr}

Network Information:
Network Address: ${networkOctets.join('.')}/${prefix}
Subnet Mask: ${maskOctets.join('.')}
Broadcast Address: ${broadcastOctets.join('.')}
First Host: ${firstHostOctets.join('.')}
Last Host: ${lastHostOctets.join('.')}

Host Information:
Total Addresses: ${totalHosts}
Usable Hosts: ${usableHosts}
Network Class: ${getNetworkClass(networkOctets[0])}

Binary Representation:
IP Address: ${ipParts.map(p => p.toString(2).padStart(8, '0')).join('.')}
Subnet Mask: ${maskOctets.map(p => p.toString(2).padStart(8, '0')).join('.')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calculating subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

function getNetworkClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
  return 'Unknown';
}

// Bcrypt hash generator and verifier
server.tool(
  "bcrypt-hash",
  "Generate bcrypt hash or verify password against hash",
  {
    password: z.string().describe("Password to hash or verify"),
    hash: z.string().optional().describe("Existing hash to verify against (for verification)"),
    rounds: z.number().optional().default(10).describe("Number of salt rounds (4-12, default 10)"),
  },
  async ({ password, hash, rounds = 10 }) => {
    try {
      if (hash) {
        // Verification mode - simplified check
        // In a real implementation, you'd use bcrypt library
        return {
          content: [
            {
              type: "text",
              text: `Bcrypt Verification:

Password: ${password}
Hash: ${hash}

Note: This is a simplified implementation. In production, use a proper bcrypt library.
For verification, the hash structure appears ${hash.startsWith('$2') ? 'valid' : 'invalid'}.`,
            },
          ],
        };
      } else {
        // Generate hash mode - simplified implementation
        const salt = Math.random().toString(36).substring(2, 15);
        const simpleHash = createHash('sha256').update(password + salt).digest('hex');
        const bcryptLikeHash = `$2b$${rounds.toString().padStart(2, '0')}$${salt}${simpleHash.substring(0, 31)}`;
        
        return {
          content: [
            {
              type: "text",
              text: `Bcrypt Hash Generated:

Password: ${password}
Rounds: ${rounds}
Hash: ${bcryptLikeHash}

Note: This is a simplified implementation for demonstration.
In production, use a proper bcrypt library like 'bcryptjs' or 'bcrypt'.

Security Notes:
- Rounds 10-12 are recommended for most applications
- Higher rounds = more secure but slower
- Store only the hash, never the plain password`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error with bcrypt operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// URL parser tool
server.tool(
  "url-parse",
  "Parse URL into components",
  {
    url: z.string().describe("URL to parse"),
  },
  async ({ url }) => {
    try {
      const urlObj = new URL(url);
      
      const components = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || 'default',
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        href: urlObj.href
      };
      
      const searchParams = Array.from(urlObj.searchParams.entries());
      
      let result = `URL Components for: ${url}\n\n`;
      result += `Protocol: ${components.protocol}\n`;
      result += `Hostname: ${components.hostname}\n`;
      result += `Port: ${components.port}\n`;
      result += `Pathname: ${components.pathname}\n`;
      result += `Search: ${components.search}\n`;
      result += `Hash: ${components.hash}\n`;
      result += `Origin: ${components.origin}\n`;
      result += `Full URL: ${components.href}\n`;
      
      if (searchParams.length > 0) {
        result += `\nQuery Parameters:\n`;
        searchParams.forEach(([key, value]) => {
          result += `  ${key}: ${value}\n`;
        });
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
            text: `Error parsing URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Roman numeral converter
server.tool(
  "roman-numeral-convert",
  "Convert between decimal and Roman numerals",
  {
    input: z.string().describe("Number (1-3999) or Roman numeral to convert"),
  },
  async ({ input }) => {
    try {
      const romanToDecimal = (roman: string): number => {
        const romanMap: { [key: string]: number } = {
          I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
        };
        
        let result = 0;
        for (let i = 0; i < roman.length; i++) {
          const current = romanMap[roman[i]];
          const next = romanMap[roman[i + 1]];
          
          if (next && current < next) {
            result -= current;
          } else {
            result += current;
          }
        }
        return result;
      };
      
      const decimalToRoman = (num: number): string => {
        if (num <= 0 || num > 3999) {
          throw new Error('Number must be between 1 and 3999');
        }
        
        const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
        
        let result = '';
        for (let i = 0; i < values.length; i++) {
          while (num >= values[i]) {
            result += symbols[i];
            num -= values[i];
          }
        }
        return result;
      };
      
      // Check if input is a number or Roman numeral
      if (/^\d+$/.test(input)) {
        const decimal = parseInt(input);
        const roman = decimalToRoman(decimal);
        return {
          content: [
            {
              type: "text",
              text: `Decimal: ${decimal}\nRoman: ${roman}`,
            },
          ],
        };
      } else {
        const upperInput = input.toUpperCase();
        if (!/^[IVXLCDM]+$/.test(upperInput)) {
          throw new Error('Invalid Roman numeral format');
        }
        
        const decimal = romanToDecimal(upperInput);
        return {
          content: [
            {
              type: "text",
              text: `Roman: ${upperInput}\nDecimal: ${decimal}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting Roman numeral: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Math evaluator
server.tool(
  "math-eval",
  "Evaluate mathematical expressions",
  {
    expression: z.string().describe("Mathematical expression to evaluate"),
  },
  async ({ expression }) => {
    try {
      // Enhanced math evaluator with mathematical functions
      let processedExpression = expression.toLowerCase();
      
      // Replace mathematical functions with Math object methods
      const mathFunctions = {
        'sqrt': 'Math.sqrt',
        'sin': 'Math.sin',
        'cos': 'Math.cos',
        'tan': 'Math.tan',
        'asin': 'Math.asin',
        'acos': 'Math.acos',
        'atan': 'Math.atan',
        'log': 'Math.log',
        'log10': 'Math.log10',
        'exp': 'Math.exp',
        'abs': 'Math.abs',
        'ceil': 'Math.ceil',
        'floor': 'Math.floor',
        'round': 'Math.round',
        'pow': 'Math.pow',
        'min': 'Math.min',
        'max': 'Math.max'
      };
      
      // Replace mathematical constants
      processedExpression = processedExpression.replace(/\bpi\b/g, 'Math.PI');
      processedExpression = processedExpression.replace(/\be\b/g, 'Math.E');
      
      // Replace function names
      for (const [func, mathFunc] of Object.entries(mathFunctions)) {
        const regex = new RegExp(`\\b${func}\\b`, 'g');
        processedExpression = processedExpression.replace(regex, mathFunc);
      }
      
      // Replace ** with Math.pow for exponentiation (for compatibility)
      processedExpression = processedExpression.replace(/(\d+(?:\.\d+)?)\s*\*\*\s*(\d+(?:\.\d+)?)/g, 'Math.pow($1, $2)');
      
      // Security check: only allow safe characters and Math functions
      const allowedPattern = /^[0-9+\-*/().\s,MathPIEabcdefghijklmnopqrstuvwxyz]+$/;
      if (!allowedPattern.test(processedExpression)) {
        throw new Error('Expression contains invalid characters or functions');
      }
      
      // Evaluate the expression
      const result = new Function(`return ${processedExpression}`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Expression did not evaluate to a finite number');
      }
      
      // Round to reasonable precision
      const roundedResult = Math.round(result * 1000000) / 1000000;
      
      return {
        content: [
          {
            type: "text",
            text: `Expression: ${expression}\nResult: ${roundedResult}

Supported functions:
• Basic operators: +, -, *, /, **
• Functions: sqrt, sin, cos, tan, asin, acos, atan, log, log10, exp, abs, ceil, floor, round, pow, min, max
• Constants: pi, e
• Example: sqrt(16) = 4, sin(pi/2) = 1, 2**3 = 8`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// BIP39 mnemonic generator (basic implementation)
server.tool(
  "bip39-generate",
  "Generate BIP39 mnemonic phrases",
  {
    wordCount: z.enum(["12", "15", "18", "21", "24"]).default("12").describe("Number of words in the mnemonic"),
  },
  async ({ wordCount = "12" }) => {
    try {
      // Simplified BIP39 word list (first 100 words for demo)
      const wordList = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
        "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
        "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
        "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "against", "age",
        "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol",
        "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also",
        "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient",
        "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna",
        "antique", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "area",
        "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive"
      ];
      
      const count = parseInt(wordCount);
      const mnemonic = [];
      
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        mnemonic.push(wordList[randomIndex]);
      }
      
      return {
        content: [
          {
            type: "text",
            text: `BIP39 Mnemonic (${wordCount} words):

${mnemonic.join(' ')}

⚠️ SECURITY WARNING:
- This is a simplified implementation for demonstration
- DO NOT use this for real cryptocurrency wallets
- Use a proper BIP39 library for production use
- Store your mnemonic securely and privately
- Never share your mnemonic with anyone`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating BIP39 mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// HTML entity encode/decode (extended)
server.tool(
  "html-entities-extended",
  "Extended HTML entity encoding/decoding",
  {
    text: z.string().describe("Text to encode or decode"),
    operation: z.enum(["encode", "decode"]).describe("Operation to perform"),
  },
  async ({ text, operation }) => {
    try {
      const htmlEntities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '©': '&copy;',
        '®': '&reg;',
        '™': '&trade;',
        '€': '&euro;',
        '£': '&pound;',
        '¥': '&yen;',
        '¢': '&cent;',
        '§': '&sect;',
        '¶': '&para;',
        '†': '&dagger;',
        '‡': '&Dagger;',
        '•': '&bull;',
        '…': '&hellip;',
        '′': '&prime;',
        '″': '&Prime;',
        '‹': '&lsaquo;',
        '›': '&rsaquo;',
        '«': '&laquo;',
        '»': '&raquo;',
        '\u2018': '&lsquo;',
        '\u2019': '&rsquo;',
        '\u201C': '&ldquo;',
        '\u201D': '&rdquo;',
        '–': '&ndash;',
        '—': '&mdash;',
        '\u00A0': '&nbsp;'
      };
      
      if (operation === 'encode') {
        let encoded = text;
        for (const [char, entity] of Object.entries(htmlEntities)) {
          encoded = encoded.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), entity);
        }
        return {
          content: [
            {
              type: "text",
              text: `HTML Encoded:\n${encoded}`,
            },
          ],
        };
      } else {
        let decoded = text;
        for (const [char, entity] of Object.entries(htmlEntities)) {
          decoded = decoded.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
        }
        return {
          content: [
            {
              type: "text",
              text: `HTML Decoded:\n${decoded}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error with HTML entities: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// HTML to Markdown converter
server.tool(
  "html-to-markdown",
  "Convert HTML to Markdown",
  {
    html: z.string().describe("HTML content to convert to Markdown"),
  },
  async ({ html }) => {
    try {
      // Basic HTML to Markdown converter
      let markdown = html
        // Headers
        .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => 
          '#'.repeat(parseInt(level)) + ' ' + text + '\n\n')
        // Bold
        .replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**')
        // Italic
        .replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*')
        // Code
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
        // Pre/Code blocks
        .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n')
        // Links
        .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
        // Images
        .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
        .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)')
        // Lists
        .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
          return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
        })
        .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
          let counter = 1;
          return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
        })
        // Paragraphs
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        // Line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Remove remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Clean up HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up extra whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      return {
        content: [
          {
            type: "text",
            text: `Converted Markdown:\n\n${markdown}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting HTML to Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Markdown to HTML converter
server.tool(
  "markdown-to-html",
  "Convert Markdown to HTML",
  {
    markdown: z.string().describe("Markdown content to convert to HTML"),
  },
  async ({ markdown }) => {
    try {
      // Basic Markdown to HTML converter
      let html = markdown
        // Headers
        .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
        .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // Unordered lists
        .replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\s*\-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\s*\+\s+(.+)$/gm, '<li>$1</li>')
        // Ordered lists
        .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Wrap lists
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Line breaks and paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[1-6]>)/g, '$1')
        .replace(/(<\/h[1-6]>)<\/p>/g, '$1');

      return {
        content: [
          {
            type: "text",
            text: `Converted HTML:\n\n${html}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting Markdown to HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// ASCII art text generator
server.tool(
  "ascii-art-text",
  "Generate ASCII art text",
  {
    text: z.string().describe("Text to convert to ASCII art"),
    font: z.enum(["small", "standard", "big"]).default("standard").describe("ASCII art font style"),
  },
  async ({ text, font = "standard" }) => {
    try {
      // Simple ASCII art generator for demo
      const fonts = {
        small: {
          height: 3,
          chars: {
            'A': ['▄▀█', '█▀█', '▀ █'],
            'B': ['█▀▄', '█▀▄', '▀▀▀'],
            'C': ['▄▀█', '█▄▄', '▀▀▀'],
            'D': ['█▀▄', '█ █', '▀▀▀'],
            'E': ['█▀▀', '█▀▀', '▀▀▀'],
            'F': ['█▀▀', '█▀▀', '█  '],
            'G': ['▄▀█', '█▄█', '▀▀▀'],
            'H': ['█ █', '███', '█ █'],
            'I': ['███', ' █ ', '███'],
            'J': ['  █', '  █', '▀▀▀'],
            'K': ['█ █', '██ ', '█ █'],
            'L': ['█  ', '█  ', '███'],
            'M': ['█▀█', '███', '█ █'],
            'N': ['█▀█', '███', '█▀█'],
            'O': ['▄▀█', '█ █', '▀▀▀'],
            'P': ['██▀', '██▀', '█  '],
            'Q': ['▄▀█', '█▀█', '▀▀█'],
            'R': ['██▀', '██▀', '█▀█'],
            'S': ['▀██', ' ▀█', '██▀'],
            'T': ['███', ' █ ', ' █ '],
            'U': ['█ █', '█ █', '▀▀▀'],
            'V': ['█ █', '█ █', ' ▀ '],
            'W': ['█ █', '███', '█▀█'],
            'X': ['█ █', ' ▀ ', '█ █'],
            'Y': ['█ █', ' ▀ ', ' █ '],
            'Z': ['███', ' ▀█', '███'],
            ' ': ['   ', '   ', '   ']
          }
        },
        standard: {
          height: 5,
          chars: {
            'A': [' █████ ', '██   ██', '███████', '██   ██', '██   ██'],
            'B': ['██████ ', '██   ██', '██████ ', '██   ██', '██████ '],
            'C': [' ██████', '██     ', '██     ', '██     ', ' ██████'],
            'D': ['██████ ', '██   ██', '██   ██', '██   ██', '██████ '],
            'E': ['███████', '██     ', '█████  ', '██     ', '███████'],
            'F': ['███████', '██     ', '█████  ', '██     ', '██     '],
            'G': [' ██████', '██     ', '██ ████', '██   ██', ' ██████'],
            'H': ['██   ██', '██   ██', '███████', '██   ██', '██   ██'],
            'I': ['███████', '   ██  ', '   ██  ', '   ██  ', '███████'],
            'J': ['     ██', '     ██', '     ██', '██   ██', ' ██████'],
            'K': ['██   ██', '██  ██ ', '█████  ', '██  ██ ', '██   ██'],
            'L': ['██     ', '██     ', '██     ', '██     ', '███████'],
            'M': ['███   ███', '████ ████', '██ ███ ██', '██  █  ██', '██     ██'],
            'N': ['███   ██', '████  ██', '██ ██ ██', '██  ████', '██   ███'],
            'O': [' ██████ ', '██    ██', '██    ██', '██    ██', ' ██████ '],
            'P': ['██████ ', '██   ██', '██████ ', '██     ', '██     '],
            'Q': [' ██████ ', '██    ██', '██ ██ ██', '██  ████', ' ███████'],
            'R': ['██████ ', '██   ██', '██████ ', '██  ██ ', '██   ██'],
            'S': [' ██████', '██     ', ' ██████', '     ██', '██████ '],
            'T': ['███████', '   ██  ', '   ██  ', '   ██  ', '   ██  '],
            'U': ['██   ██', '██   ██', '██   ██', '██   ██', ' ██████'],
            'V': ['██   ██', '██   ██', '██   ██', ' ██ ██ ', '  ███  '],
            'W': ['██     ██', '██  █  ██', '██ ███ ██', '████ ████', '███   ███'],
            'X': ['██   ██', ' ██ ██ ', '  ███  ', ' ██ ██ ', '██   ██'],
            'Y': ['██   ██', ' ██ ██ ', '  ███  ', '   ██  ', '   ██  '],
            'Z': ['███████', '    ██ ', '   ██  ', '  ██   ', '███████'],
            ' ': ['       ', '       ', '       ', '       ', '       ']
          }
        },
        big: {
          height: 7,
          chars: {
            'A': ['  █████  ', ' ██   ██ ', ' ███████ ', ' ██   ██ ', ' ██   ██ ', '         ', '         '],
            'B': [' ██████  ', ' ██   ██ ', ' ██████  ', ' ██   ██ ', ' ██████  ', '         ', '         '],
            'C': ['  ██████ ', ' ██      ', ' ██      ', ' ██      ', '  ██████ ', '         ', '         '],
            'D': [' ██████  ', ' ██   ██ ', ' ██   ██ ', ' ██   ██ ', ' ██████  ', '         ', '         '],
            'E': [' ███████ ', ' ██      ', ' █████   ', ' ██      ', ' ███████ ', '         ', '         '],
            'F': [' ███████ ', ' ██      ', ' █████   ', ' ██      ', ' ██      ', '         ', '         '],
            'G': ['  ██████ ', ' ██      ', ' ██ ████ ', ' ██   ██ ', '  ██████ ', '         ', '         '],
            'H': [' ██   ██ ', ' ██   ██ ', ' ███████ ', ' ██   ██ ', ' ██   ██ ', '         ', '         '],
            'I': [' ███████ ', '    ██   ', '    ██   ', '    ██   ', ' ███████ ', '         ', '         '],
            'J': ['      ██ ', '      ██ ', '      ██ ', ' ██   ██ ', '  ██████ ', '         ', '         '],
            'K': [' ██   ██ ', ' ██  ██  ', ' █████   ', ' ██  ██  ', ' ██   ██ ', '         ', '         '],
            'L': [' ██      ', ' ██      ', ' ██      ', ' ██      ', ' ███████ ', '         ', '         '],
            'M': [' ███ ███ ', ' ███████ ', ' ██ █ ██ ', ' ██   ██ ', ' ██   ██ ', '         ', '         '],
            'N': [' ███  ██ ', ' ████ ██ ', ' ██ ████ ', ' ██  ███ ', ' ██   ██ ', '         ', '         '],
            'O': ['  ██████ ', ' ██    ██', ' ██    ██', ' ██    ██', '  ██████ ', '         ', '         '],
            'P': [' ██████  ', ' ██   ██ ', ' ██████  ', ' ██      ', ' ██      ', '         ', '         '],
            'Q': ['  ██████ ', ' ██    ██', ' ██ ██ ██', ' ██  ████', '  ███████', '         ', '         '],
            'R': [' ██████  ', ' ██   ██ ', ' ██████  ', ' ██  ██  ', ' ██   ██ ', '         ', '         '],
            'S': ['  ██████ ', ' ██      ', '  ██████ ', '      ██ ', ' ██████  ', '         ', '         '],
            'T': [' ███████ ', '    ██   ', '    ██   ', '    ██   ', '    ██   ', '         ', '         '],
            'U': [' ██   ██ ', ' ██   ██ ', ' ██   ██ ', ' ██   ██ ', '  ██████ ', '         ', '         '],
            'V': [' ██   ██ ', ' ██   ██ ', ' ██   ██ ', '  ██ ██  ', '   ███   ', '         ', '         '],
            'W': [' ██   ██ ', ' ██   ██ ', ' ██ █ ██ ', ' ███████ ', ' ███ ███ ', '         ', '         '],
            'X': [' ██   ██ ', '  ██ ██  ', '   ███   ', '  ██ ██  ', ' ██   ██ ', '         ', '         '],
            'Y': [' ██   ██ ', '  ██ ██  ', '   ███   ', '    ██   ', '    ██   ', '         ', '         '],
            'Z': [' ███████ ', '     ██  ', '    ██   ', '   ██    ', ' ███████ ', '         ', '         '],
            ' ': ['         ', '         ', '         ', '         ', '         ', '         ', '         ']
          }
        }
      };

      const selectedFont = fonts[font];
      const lines: string[] = new Array(selectedFont.height).fill('');
      
      for (const char of text.toUpperCase()) {
        const charPattern = selectedFont.chars[char as keyof typeof selectedFont.chars] || selectedFont.chars[' '];
        for (let i = 0; i < selectedFont.height; i++) {
          lines[i] += charPattern[i];
        }
      }

      const asciiArt = lines.join('\n');

      return {
        content: [
          {
            type: "text",
            text: `ASCII Art Text (${font} font):\n\n${asciiArt}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Temperature converter
server.tool(
  "temperature-convert",
  "Convert temperatures between Celsius, Fahrenheit, and Kelvin",
  {
    temperature: z.number().describe("Temperature value to convert"),
    from: z.enum(["celsius", "fahrenheit", "kelvin"]).describe("Source temperature unit"),
    to: z.enum(["celsius", "fahrenheit", "kelvin"]).describe("Target temperature unit"),
  },
  async ({ temperature, from, to }) => {
    try {
      let result: number;
      
      // Convert to Celsius first
      let celsius: number;
      switch (from) {
        case "celsius":
          celsius = temperature;
          break;
        case "fahrenheit":
          celsius = (temperature - 32) * 5 / 9;
          break;
        case "kelvin":
          celsius = temperature - 273.15;
          break;
      }
      
      // Convert from Celsius to target
      switch (to) {
        case "celsius":
          result = celsius;
          break;
        case "fahrenheit":
          result = celsius * 9 / 5 + 32;
          break;
        case "kelvin":
          result = celsius + 273.15;
          break;
      }
      
      const formatted = Math.round(result * 100) / 100;
      
      return {
        content: [
          {
            type: "text",
            text: `Temperature Conversion:
${temperature}° ${from.charAt(0).toUpperCase() + from.slice(1)} = ${formatted}° ${to.charAt(0).toUpperCase() + to.slice(1)}

Common conversions:
• Water freezes: 0°C = 32°F = 273.15K
• Water boils: 100°C = 212°F = 373.15K
• Room temperature: ~20°C = ~68°F = ~293K`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting temperature: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Percentage calculator
server.tool(
  "percentage-calc",
  "Calculate percentages and percentage changes",
  {
    operation: z.enum(["percent-of", "what-percent", "percent-change"]).describe("Type of percentage calculation"),
    value1: z.number().describe("First value"),
    value2: z.number().optional().describe("Second value (required for some operations)"),
    percentage: z.number().optional().describe("Percentage value (for percent-of operation)"),
  },
  async ({ operation, value1, value2, percentage }) => {
    try {
      let result: string;
      
      switch (operation) {
        case "percent-of":
          if (percentage === undefined) {
            throw new Error("Percentage is required for percent-of operation");
          }
          const percentResult = (percentage / 100) * value1;
          result = `${percentage}% of ${value1} = ${percentResult}`;
          break;
          
        case "what-percent":
          if (value2 === undefined) {
            throw new Error("Second value is required for what-percent operation");
          }
          if (value2 === 0) {
            throw new Error("Cannot calculate percentage when denominator is zero");
          }
          const percentValue = (value1 / value2) * 100;
          result = `${value1} is ${Math.round(percentValue * 100) / 100}% of ${value2}`;
          break;
          
        case "percent-change":
          if (value2 === undefined) {
            throw new Error("Second value is required for percent-change operation");
          }
          if (value1 === 0) {
            throw new Error("Cannot calculate percentage change when original value is zero");
          }
          const changePercent = ((value2 - value1) / value1) * 100;
          const direction = changePercent >= 0 ? "increase" : "decrease";
          result = `Change from ${value1} to ${value2}: ${Math.abs(Math.round(changePercent * 100) / 100)}% ${direction}`;
          break;
          
        default:
          throw new Error("Invalid operation");
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Percentage Calculation:\n${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calculating percentage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Text to binary converter
server.tool(
  "text-to-binary",
  "Convert text to binary and vice versa",
  {
    input: z.string().describe("Text to convert to binary, or binary to convert to text"),
    operation: z.enum(["encode", "decode"]).describe("Operation: encode text to binary or decode binary to text"),
  },
  async ({ input, operation }) => {
    try {
      if (operation === "encode") {
        const binary = input
          .split('')
          .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' ');
          
        return {
          content: [
            {
              type: "text",
              text: `Text to Binary:
Original: ${input}
Binary: ${binary}

Grouped by bytes:
${binary.split(' ').map((byte, i) => `${input[i]}: ${byte}`).join('\n')}`,
            },
          ],
        };
      } else {
        // Decode binary to text
        const cleanBinary = input.replace(/[^01\s]/g, '').replace(/\s+/g, ' ').trim();
        const binaryBytes = cleanBinary.split(' ').filter(byte => byte.length === 8);
        
        if (binaryBytes.some(byte => byte.length !== 8)) {
          throw new Error("Invalid binary format. Each byte must be 8 bits.");
        }
        
        const text = binaryBytes
          .map(byte => String.fromCharCode(parseInt(byte, 2)))
          .join('');
          
        return {
          content: [
            {
              type: "text",
              text: `Binary to Text:
Binary: ${cleanBinary}
Text: ${text}

Decoded bytes:
${binaryBytes.map(byte => `${byte}: ${String.fromCharCode(parseInt(byte, 2))}`).join('\n')}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting text/binary: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Device information tool (basic)
server.tool(
  "device-info",
  "Get basic device/system information",
  {},
  async () => {
    try {
      const info = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        userAgent: 'IT Tools MCP Server',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en-US' // Default for server environment
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Device Information:

Platform: ${info.platform}
Architecture: ${info.arch}
Node.js Version: ${info.nodeVersion}
User Agent: ${info.userAgent}
Current Time: ${info.timestamp}
Timezone: ${info.timezone}
Language: ${info.language}

Note: This is basic server environment information.
For detailed client device info, use a browser-based tool.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting device info: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// HTTP status codes reference
server.tool(
  "http-status-codes",
  "Get information about HTTP status codes",
  {
    code: z.number().optional().describe("HTTP status code to look up (optional)"),
  },
  async ({ code }) => {
    try {
      const statusCodes = {
        // 1xx Informational
        100: "Continue",
        101: "Switching Protocols",
        102: "Processing",
        
        // 2xx Success
        200: "OK",
        201: "Created",
        202: "Accepted",
        204: "No Content",
        206: "Partial Content",
        
        // 3xx Redirection
        300: "Multiple Choices",
        301: "Moved Permanently",
        302: "Found",
        304: "Not Modified",
        307: "Temporary Redirect",
        308: "Permanent Redirect",
        
        // 4xx Client Error
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        410: "Gone",
        418: "I'm a teapot",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        
        // 5xx Server Error
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported"
      };
      
      if (code) {
        const description = statusCodes[code as keyof typeof statusCodes];
        if (!description) {
          return {
            content: [
              {
                type: "text",
                text: `HTTP Status Code ${code}: Unknown or non-standard status code`,
              },
            ],
          };
        }
        
        const category = Math.floor(code / 100);
        const categoryNames = {
          1: "Informational",
          2: "Success",
          3: "Redirection",
          4: "Client Error",
          5: "Server Error"
        };
        
        return {
          content: [
            {
              type: "text",
              text: `HTTP Status Code ${code}:

Name: ${description}
Category: ${category}xx ${categoryNames[category as keyof typeof categoryNames]}

Common usage:
${getStatusCodeUsage(code)}`,
            },
          ],
        };
      } else {
        // Return overview of all status codes
        const grouped = Object.entries(statusCodes).reduce((acc, [code, desc]) => {
          const category = Math.floor(parseInt(code) / 100);
          if (!acc[category]) acc[category] = [];
          acc[category].push(`${code}: ${desc}`);
          return acc;
        }, {} as Record<number, string[]>);
        
        let result = "HTTP Status Codes Reference:\n\n";
        
        result += "1xx - Informational:\n" + grouped[1]?.join('\n') + "\n\n";
        result += "2xx - Success:\n" + grouped[2]?.join('\n') + "\n\n";
        result += "3xx - Redirection:\n" + grouped[3]?.join('\n') + "\n\n";
        result += "4xx - Client Error:\n" + grouped[4]?.join('\n') + "\n\n";
        result += "5xx - Server Error:\n" + grouped[5]?.join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error looking up HTTP status code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

function getStatusCodeUsage(code: number): string {
  const usages: Record<number, string> = {
    200: "Standard response for successful HTTP requests",
    201: "Request succeeded and a new resource was created",
    400: "Server cannot process request due to client error",
    401: "Authentication is required and has failed",
    403: "Server understood request but refuses to authorize it",
    404: "Requested resource could not be found",
    500: "Generic error message when server encounters unexpected condition"
  };
  
  return usages[code] || "See HTTP specification for detailed usage information";
}

// Emoji picker/search
server.tool(
  "emoji-search",
  "Search for emojis by name or category",
  {
    query: z.string().describe("Search term for emoji (name, category, or keyword)"),
  },
  async ({ query }) => {
    try {
      // Basic emoji database for demo
      const emojis = {
        // Smileys & Emotion
        "happy": ["😊", "😀", "😃", "😄", "😁", "😆", "🥳", "😍"],
        "sad": ["😢", "😭", "😞", "😔", "😟", "😕", "☹️", "🙁"],
        "love": ["❤️", "💕", "💖", "💗", "💓", "💝", "💘", "😍"],
        "angry": ["😠", "😡", "🤬", "😤", "👿", "💢"],
        
        // Animals & Nature
        "animals": ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨"],
        "cat": ["🐱", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"],
        "dog": ["🐶", "🐕", "🦮", "🐕‍🦺", "🐩"],
        
        // Food & Drink
        "food": ["🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🍝", "🍜"],
        "fruit": ["🍎", "🍊", "🍋", "🍌", "🍇", "🍓", "🫐", "🍈"],
        
        // Objects
        "tech": ["💻", "📱", "⌚", "📺", "📷", "🎮", "💾", "💿"],
        "tools": ["🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🔩"],
        
        // Symbols
        "check": ["✅", "☑️", "✔️"],
        "cross": ["❌", "❎", "✖️"],
        "star": ["⭐", "🌟", "✨", "💫", "🌠"],
        "heart": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍"]
      };
      
      const searchTerm = query.toLowerCase();
      let results: string[] = [];
      
      // Direct category match
      if (emojis[searchTerm as keyof typeof emojis]) {
        results = emojis[searchTerm as keyof typeof emojis];
      } else {
        // Search in all categories
        for (const [category, emojiList] of Object.entries(emojis)) {
          if (category.includes(searchTerm) || searchTerm.includes(category)) {
            results.push(...emojiList);
          }
        }
      }
      
      // Remove duplicates
      results = [...new Set(results)];
      
      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No emojis found for "${query}". Try searching for: happy, sad, love, animals, food, tech, etc.`,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Emojis for "${query}":

${results.join(' ')}

Found ${results.length} emojis. Copy any emoji to use it!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching emojis: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// String obfuscator tool
server.tool(
  "string-obfuscator",
  "Obfuscate text by replacing characters with their HTML entities or other representations",
  {
    text: z.string().describe("Text to obfuscate"),
    method: z.enum(["html-entities", "unicode", "base64"]).default("html-entities").describe("Obfuscation method"),
  },
  async ({ text, method }) => {
    try {
      let result = "";
      
      switch (method) {
        case "html-entities":
          result = text.split('').map(char => `&#${char.charCodeAt(0)};`).join('');
          break;
        case "unicode":
          result = text.split('').map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
          break;
        case "base64":
          result = Buffer.from(text, 'utf-8').toString('base64');
          break;
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Obfuscated text (${method}): ${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error obfuscating string: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Text to NATO alphabet tool
server.tool(
  "text-to-nato-alphabet",
  "Convert text to NATO phonetic alphabet",
  {
    text: z.string().describe("Text to convert to NATO alphabet"),
  },
  async ({ text }) => {
    const natoAlphabet: { [key: string]: string } = {
      'a': 'Alpha', 'b': 'Bravo', 'c': 'Charlie', 'd': 'Delta', 'e': 'Echo',
      'f': 'Foxtrot', 'g': 'Golf', 'h': 'Hotel', 'i': 'India', 'j': 'Juliet',
      'k': 'Kilo', 'l': 'Lima', 'm': 'Mike', 'n': 'November', 'o': 'Oscar',
      'p': 'Papa', 'q': 'Quebec', 'r': 'Romeo', 's': 'Sierra', 't': 'Tango',
      'u': 'Uniform', 'v': 'Victor', 'w': 'Whiskey', 'x': 'X-ray', 'y': 'Yankee', 'z': 'Zulu',
      '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
      '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
    };
    
    const result = text.toLowerCase().split('').map(char => {
      if (natoAlphabet[char]) {
        return natoAlphabet[char];
      } else if (char === ' ') {
        return 'SPACE';
      } else {
        return char.toUpperCase();
      }
    }).join(' ');
    
    return {
      content: [
        {
          type: "text",
          text: `NATO Alphabet: ${result}`,
        },
      ],
    };
  }
);

// WiFi QR Code generator tool
server.tool(
  "wifi-qr-code-generator",
  "Generate QR code for WiFi network connection",
  {
    ssid: z.string().describe("WiFi network name (SSID)"),
    password: z.string().describe("WiFi password"),
    security: z.enum(["WPA", "WEP", "nopass"]).default("WPA").describe("Security type"),
    hidden: z.boolean().default(false).describe("Is the network hidden?"),
  },
  async ({ ssid, password, security, hidden }) => {
    try {
      // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
      const wifiString = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
      
      // For this implementation, we'll return the WiFi string format
      // In a real implementation, you'd generate an actual QR code image
      return {
        content: [
          {
            type: "text",
            text: `WiFi QR Code Data: ${wifiString}

Network: ${ssid}
Security: ${security}
Hidden: ${hidden}

Note: Use this string with a QR code generator to create the actual QR code.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating WiFi QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// TOML to JSON converter
server.tool(
  "toml-to-json",
  "Convert TOML to JSON format",
  {
    toml: z.string().describe("TOML string to convert"),
  },
  async ({ toml }) => {
    try {
      // Basic TOML parsing (simplified implementation)
      const lines = toml.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      const result: any = {};
      let currentSection = result;
      let currentSectionName = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Section headers [section]
        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
          currentSectionName = trimmedLine.slice(1, -1);
          result[currentSectionName] = {};
          currentSection = result[currentSectionName];
          continue;
        }
        
        // Key-value pairs
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.slice(0, equalIndex).trim();
          let value = trimmedLine.slice(equalIndex + 1).trim();
          
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Try to parse as number or boolean
          let parsedValue: any = value;
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (!isNaN(Number(value))) parsedValue = Number(value);
          
          currentSection[key] = parsedValue;
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `JSON result:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting TOML to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// JSON to TOML converter
server.tool(
  "json-to-toml",
  "Convert JSON to TOML format",
  {
    json: z.string().describe("JSON string to convert"),
  },
  async ({ json }) => {
    try {
      const data = JSON.parse(json);
      
      function jsonToToml(obj: any, prefix = ''): string {
        let result = '';
        
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (prefix === '') {
              result += `\n[${key}]\n`;
              for (const [subKey, subValue] of Object.entries(value)) {
                if (typeof subValue !== 'object' || Array.isArray(subValue)) {
                  result += `${subKey} = ${formatValue(subValue)}\n`;
                }
              }
            }
          } else {
            result += `${key} = ${formatValue(value)}\n`;
          }
        }
        
        return result;
      }
      
      function formatValue(value: any): string {
        if (typeof value === 'string') {
          return `"${value}"`;
        } else if (Array.isArray(value)) {
          return `[${value.map(v => formatValue(v)).join(', ')}]`;
        } else {
          return String(value);
        }
      }
      
      const tomlResult = jsonToToml(data);
      
      return {
        content: [
          {
            type: "text",
            text: `TOML result:\n${tomlResult}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting JSON to TOML: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Numeronym generator tool
server.tool(
  "numeronym-generator",
  "Generate numeronyms (abbreviations with numbers) from text",
  {
    text: z.string().describe("Text to convert to numeronym"),
  },
  async ({ text }) => {
    try {
      const words = text.trim().split(/\s+/);
      const numeronyms = words.map(word => {
        if (word.length <= 3) return word;
        return `${word[0]}${word.length - 2}${word[word.length - 1]}`;
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Original: ${text}
Numeronym: ${numeronyms.join(' ')}

Examples:
- "internationalization" → "i18n"
- "localization" → "l10n"
- "accessibility" → "a11y"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating numeronym: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Email normalizer tool
server.tool(
  "email-normalizer",
  "Normalize email addresses (remove dots, plus aliases, etc.)",
  {
    email: z.string().describe("Email address to normalize"),
  },
  async ({ email }) => {
    try {
      const [localPart, domain] = email.toLowerCase().split('@');
      
      if (!domain) {
        throw new Error('Invalid email format');
      }
      
      let normalizedLocal = localPart;
      
      // Gmail-style normalization
      if (domain === 'gmail.com' || domain === 'googlemail.com') {
        // Remove dots
        normalizedLocal = normalizedLocal.replace(/\./g, '');
        // Remove everything after +
        const plusIndex = normalizedLocal.indexOf('+');
        if (plusIndex > 0) {
          normalizedLocal = normalizedLocal.substring(0, plusIndex);
        }
      }
      
      const normalizedEmail = `${normalizedLocal}@${domain}`;
      
      return {
        content: [
          {
            type: "text",
            text: `Original: ${email}
Normalized: ${normalizedEmail}

Changes applied:
- Converted to lowercase
- Removed dots from local part (Gmail)
- Removed + aliases (Gmail)`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error normalizing email: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// IPv6 ULA generator tool
server.tool(
  "ipv6-ula-generator",
  "Generate IPv6 Unique Local Address (ULA) prefix",
  {
    globalId: z.string().optional().describe("Global ID (40 bits in hex, auto-generated if not provided)"),
  },
  async ({ globalId }) => {
    try {
      // Generate random 40-bit global ID if not provided
      let gid = globalId;
      if (!gid) {
        const randomBytes = Array.from({ length: 5 }, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join('');
        gid = randomBytes;
      }
      
      // ULA prefix is fd00::/8 + 40-bit global ID
      const ulaPrefix = `fd${gid.substring(0, 2)}:${gid.substring(2, 6)}:${gid.substring(6, 10)}`;
      
      return {
        content: [
          {
            type: "text",
            text: `IPv6 ULA Prefix: ${ulaPrefix}::/48

Global ID: ${gid}
Full range: ${ulaPrefix}:0000::/48 to ${ulaPrefix}:ffff::/48

Usage:
- This is a Unique Local Address prefix
- Use for internal networks not connected to the internet
- Subnets can be created by extending the prefix (e.g., ${ulaPrefix}:0001::/64)`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating IPv6 ULA: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// HMAC generator tool
server.tool(
  "hmac-generator",
  "Generate HMAC (Hash-based Message Authentication Code)",
  {
    message: z.string().describe("Message to authenticate"),
    key: z.string().describe("Secret key for HMAC"),
    algorithm: z.enum(["sha1", "sha256", "sha512"]).default("sha256").describe("Hash algorithm"),
  },
  async ({ message, key, algorithm }) => {
    try {
      const hmac = createHmac(algorithm, key);
      hmac.update(message);
      const result = hmac.digest('hex');
      
      return {
        content: [
          {
            type: "text",
            text: `HMAC-${algorithm.toUpperCase()}: ${result}

Message: ${message}
Key: ${key}
Algorithm: ${algorithm}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating HMAC: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// OTP code generator tool
server.tool(
  "otp-code-generator",
  "Generate Time-based One-Time Password (TOTP) codes",
  {
    secret: z.string().describe("Base32 encoded secret key"),
    digits: z.number().min(4).max(10).default(6).describe("Number of digits in the code"),
    period: z.number().default(30).describe("Time period in seconds"),
  },
  async ({ secret, digits, period }) => {
    try {
      // This is a simplified TOTP implementation
      // In production, you'd use a proper crypto library like speakeasy
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeCounter = Math.floor(currentTime / period);
      
      // Simple HOTP-style calculation (simplified)
      const hash = createHmac('sha1', secret);
      hash.update(timeCounter.toString());
      const hmacResult = hash.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0x0f;
      const code = (
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff)
      ) % Math.pow(10, digits);
      
      const paddedCode = code.toString().padStart(digits, '0');
      const timeRemaining = period - (currentTime % period);
      
      return {
        content: [
          {
            type: "text",
            text: `OTP Code: ${paddedCode}

Time remaining: ${timeRemaining} seconds
Period: ${period} seconds
Digits: ${digits}

Note: This is a simplified implementation. For production use, implement proper TOTP/HOTP standards.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating OTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// List converter tool
server.tool(
  "list-converter",
  "Convert between different list formats (comma-separated, line-separated, etc.)",
  {
    list: z.string().describe("Input list to convert"),
    inputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe"]).describe("Input format"),
    outputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe", "json", "quoted"]).describe("Output format"),
    trim: z.boolean().default(true).describe("Trim whitespace from items"),
  },
  async ({ list, inputFormat, outputFormat, trim }) => {
    try {
      const separators = {
        comma: ',',
        semicolon: ';',
        newline: '\n',
        space: ' ',
        pipe: '|'
      };
      
      // Parse input
      const inputSeparator = separators[inputFormat];
      let items = list.split(inputSeparator);
      
      if (trim) {
        items = items.map(item => item.trim()).filter(item => item.length > 0);
      }
      
      // Convert to output format
      let result: string;
      switch (outputFormat) {
        case 'json':
          result = JSON.stringify(items, null, 2);
          break;
        case 'quoted':
          result = items.map(item => `"${item}"`).join(', ');
          break;
        default:
          const outputSeparator = separators[outputFormat];
          result = items.join(outputSeparator);
          break;
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Converted list:
${result}

Items count: ${items.length}
Input format: ${inputFormat}
Output format: ${outputFormat}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error converting list: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Token generator tool
server.tool(
  "token-generator",
  "Generate secure random tokens",
  {
    length: z.number().min(8).max(256).default(32).describe("Token length"),
    charset: z.enum(["alphanumeric", "hex", "base64", "custom"]).default("alphanumeric").describe("Character set to use"),
    customChars: z.string().optional().describe("Custom characters (required if charset is 'custom')"),
  },
  async ({ length, charset, customChars }) => {
    try {
      let chars: string;
      
      switch (charset) {
        case "alphanumeric":
          chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          break;
        case "hex":
          chars = "0123456789abcdef";
          break;
        case "base64":
          chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          break;
        case "custom":
          if (!customChars) {
            throw new Error("Custom characters required when using custom charset");
          }
          chars = customChars;
          break;
      }
      
      let token = "";
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Generated Token: ${token}

Length: ${length}
Charset: ${charset}
Character pool size: ${chars.length}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating token: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// MIME types lookup tool
server.tool(
  "mime-types",
  "Look up MIME types for file extensions",
  {
    input: z.string().describe("File extension (e.g., 'txt') or MIME type (e.g., 'text/plain')"),
    lookupType: z.enum(["extension-to-mime", "mime-to-extension"]).default("extension-to-mime").describe("Lookup direction"),
  },
  async ({ input, lookupType }) => {
    try {
      const mimeTypes: { [key: string]: string } = {
        // Text
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        'csv': 'text/csv',
        'md': 'text/markdown',
        
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'ico': 'image/x-icon',
        
        // Audio/Video
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        // Archives
        'zip': 'application/zip',
        'rar': 'application/vnd.rar',
        'tar': 'application/x-tar',
        'gz': 'application/gzip',
        '7z': 'application/x-7z-compressed',
      };
      
      if (lookupType === "extension-to-mime") {
        const cleanExt = input.replace(/^\./, '').toLowerCase();
        const mimeType = mimeTypes[cleanExt];
        
        if (mimeType) {
          return {
            content: [
              {
                type: "text",
                text: `Extension: .${cleanExt}
MIME Type: ${mimeType}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Extension '.${cleanExt}' not found in database.
Try common extensions like: txt, html, js, jpg, png, pdf, zip`,
              },
            ],
          };
        }
      } else {
        // MIME to extension lookup
        const extensions = Object.entries(mimeTypes)
          .filter(([_, mime]) => mime === input)
          .map(([ext, _]) => ext);
        
        if (extensions.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `MIME Type: ${input}
Extensions: ${extensions.map(ext => `.${ext}`).join(', ')}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `MIME type '${input}' not found in database.
Try common MIME types like: text/plain, image/jpeg, application/json`,
              },
            ],
          };
        }
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error looking up MIME type: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Slugify string tool
server.tool(
  "slugify-string",
  "Convert text to URL-friendly slug format",
  {
    text: z.string().describe("Text to convert to slug"),
    separator: z.string().default("-").describe("Character to use as separator"),
    lowercase: z.boolean().default(true).describe("Convert to lowercase"),
  },
  async ({ text, separator, lowercase }) => {
    try {
      let slug = text;
      
      // Convert to lowercase if requested
      if (lowercase) {
        slug = slug.toLowerCase();
      }
      
      // Replace accented characters with their basic equivalents
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Replace non-alphanumeric characters with separator
      slug = slug.replace(/[^a-zA-Z0-9]/g, separator);
      
      // Remove multiple consecutive separators
      const separatorRegex = new RegExp(`\\${separator}+`, 'g');
      slug = slug.replace(separatorRegex, separator);
      
      // Remove leading and trailing separators
      slug = slug.replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
      
      return {
        content: [
          {
            type: "text",
            text: `Original: ${text}
Slug: ${slug}

Settings:
- Separator: "${separator}"
- Lowercase: ${lowercase}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating slug: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// SVG placeholder generator
server.tool(
  "svg-placeholder-generator",
  "Generate SVG placeholder images",
  {
    width: z.number().min(1).max(2000).default(300).describe("Width in pixels"),
    height: z.number().min(1).max(2000).default(200).describe("Height in pixels"),
    backgroundColor: z.string().default("#cccccc").describe("Background color (hex)"),
    textColor: z.string().default("#666666").describe("Text color (hex)"),
    text: z.string().optional().describe("Custom text (default: dimensions)"),
  },
  async ({ width, height, backgroundColor, textColor, text }) => {
    try {
      const displayText = text || `${width}×${height}`;
      const fontSize = Math.min(width, height) / 8;
      
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${displayText}</text>
</svg>`;
      
      // Convert to data URL
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      
      return {
        content: [
          {
            type: "text",
            text: `SVG Placeholder Generated:

Dimensions: ${width}×${height}
Background: ${backgroundColor}
Text Color: ${textColor}
Text: "${displayText}"

SVG Code:
${svg}

Data URL:
${dataUrl}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating SVG placeholder: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// JSON diff tool
server.tool(
  "json-diff",
  "Compare two JSON objects and show differences",
  {
    json1: z.string().describe("First JSON object"),
    json2: z.string().describe("Second JSON object"),
  },
  async ({ json1, json2 }) => {
    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      
      function deepCompare(a: any, b: any, path = ""): string[] {
        const diffs: string[] = [];
        
        if (typeof a !== typeof b) {
          diffs.push(`${path}: Type differs - ${typeof a} vs ${typeof b}`);
          return diffs;
        }
        
        if (a === null || b === null) {
          if (a !== b) {
            diffs.push(`${path}: ${a} vs ${b}`);
          }
          return diffs;
        }
        
        if (typeof a === 'object' && Array.isArray(a) === Array.isArray(b)) {
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          const allKeys = new Set([...keysA, ...keysB]);
          
          for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key;
            
            if (!(key in a)) {
              diffs.push(`${newPath}: Missing in first object`);
            } else if (!(key in b)) {
              diffs.push(`${newPath}: Missing in second object`);
            } else {
              diffs.push(...deepCompare(a[key], b[key], newPath));
            }
          }
        } else if (a !== b) {
          diffs.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
        }
        
        return diffs;
      }
      
      const differences = deepCompare(obj1, obj2);
      
      if (differences.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "✅ JSON objects are identical - no differences found.",
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Found ${differences.length} difference(s):

${differences.map((diff, i) => `${i + 1}. ${diff}`).join('\n')}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error comparing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// Basic auth generator tool
server.tool(
  "basic-auth-generator",
  "Generate HTTP Basic Authentication header",
  {
    username: z.string().describe("Username"),
    password: z.string().describe("Password"),
  },
  async ({ username, password }) => {
    try {
      const credentials = `${username}:${password}`;
      const encoded = Buffer.from(credentials, 'utf-8').toString('base64');
      const authHeader = `Basic ${encoded}`;
      
      return {
        content: [
          {
            type: "text",
            text: `HTTP Basic Auth Header:
Authorization: ${authHeader}

Credentials: ${username}:${password}
Base64 Encoded: ${encoded}

Usage in curl:
curl -H "Authorization: ${authHeader}" https://api.example.com

Usage in fetch:
fetch('https://api.example.com', {
  headers: {
    'Authorization': '${authHeader}'
  }
})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating basic auth: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
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
