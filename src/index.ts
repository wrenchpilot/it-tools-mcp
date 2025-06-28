#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';

/**
 * Security utilities for IT Tools MCP Server
 */

// Input size limits to prevent DoS attacks
export const INPUT_LIMITS = {
  TEXT_MAX: 1000000,      // 1MB for text input
  JSON_MAX: 500000,       // 500KB for JSON
  HTML_MAX: 500000,       // 500KB for HTML
  XML_MAX: 500000,        // 500KB for XML
  YAML_MAX: 100000,       // 100KB for YAML
  CSV_MAX: 1000000,       // 1MB for CSV
  PASSWORD_MAX: 128,      // Max password length
  TOKEN_LENGTH_MAX: 1024, // Max token length
  LIST_ITEMS_MAX: 10000,  // Max list items
  REGEX_MAX: 1000,        // Max regex pattern length
} as const;

// Base schema with common security validations
export const secureTextSchema = (maxLength: number = INPUT_LIMITS.TEXT_MAX) =>
  z.string()
    .max(maxLength, `Input too large (max ${maxLength} characters)`)
    .refine(
      (text) => !text.includes('\0'),
      "Null bytes not allowed"
    );

// Secure schemas for different input types
export const secureSchemas = {
  text: secureTextSchema(),
  shortText: secureTextSchema(1000),
  password: secureTextSchema(INPUT_LIMITS.PASSWORD_MAX),
  json: secureTextSchema(INPUT_LIMITS.JSON_MAX),
  html: secureTextSchema(INPUT_LIMITS.HTML_MAX),
  xml: secureTextSchema(INPUT_LIMITS.XML_MAX),
  yaml: secureTextSchema(INPUT_LIMITS.YAML_MAX),
  csv: secureTextSchema(INPUT_LIMITS.CSV_MAX),
  regex: secureTextSchema(INPUT_LIMITS.REGEX_MAX),
  
  // Numeric with bounds
  positiveInt: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  boundedInt: (min: number, max: number) => 
    z.number().int().min(min).max(max),
    
  // Safe URL validation
  url: z.string().url().max(2048),
  
  // Safe email validation
  email: z.string().email().max(254),
  
  // Base64 validation
  base64: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, "Invalid Base64 format"),
  
  // Hex validation
  hexColor: z.string().regex(/^#?[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  
  // Safe filename
  filename: z.string()
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, "Filename contains invalid characters"),
};

/**
 * Rate limiting for tools (simple in-memory implementation)
 */
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const requests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    if (requests.length >= this.maxRequests) {
      return false;
    }
    
    requests.push(now);
    return true;
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new SimpleRateLimiter();

/**
 * Security wrapper for tool handlers
 */
export function secureToolHandler<T extends Record<string, any>>(
  handler: (params: T) => Promise<any>,
  identifier: string = 'default'
) {
  return async (params: T) => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(identifier)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      return await handler(params);
    } catch (error) {
      // Log error without exposing sensitive information
      console.error(`Tool error for ${identifier}:`, error instanceof Error ? error.message : 'Unknown error');
      
      // Return safe error message
      throw new Error('Tool execution failed. Please check your input and try again.');
    }
  };
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Remove potentially dangerous characters from text
   */
  text: (input: string): string => {
    return input
      .replace(/[\0\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .normalize('NFKC'); // Normalize Unicode
  },

  /**
   * Escape HTML entities
   */
  html: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  /**
   * Safe regex pattern validation
   */
  regex: (pattern: string): string => {
    // Basic validation to prevent ReDoS
    if (pattern.length > INPUT_LIMITS.REGEX_MAX) {
      throw new Error('Regex pattern too long');
    }
    
    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /(\*\+|\+\*|\?\+|\+\?|\*\?|\?\*)/, // Nested quantifiers
      /(\([^)]*){10,}/, // Excessive grouping
      /(\|.*){20,}/, // Excessive alternation
    ];
    
    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        throw new Error('Potentially dangerous regex pattern detected');
      }
    }
    
    return pattern;
  }
};

/**
 * Format bytes as human-readable string (e.g., 1.2 MB, 512 KB)
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Memory and CPU usage monitoring (human-readable + raw values)
 */
export function getResourceUsage() {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  return {
    memory: {
      heapUsed: formatBytes(usage.heapUsed),
      heapUsedBytes: usage.heapUsed,
      heapTotal: formatBytes(usage.heapTotal),
      heapTotalBytes: usage.heapTotal,
      external: formatBytes(usage.external),
      externalBytes: usage.external,
      rss: formatBytes(usage.rss),
      rssBytes: usage.rss,
    },
    cpu: {
      user: `${(cpuUsage.user / 1000).toFixed(1)} ms`, // microseconds to ms
      userMicros: cpuUsage.user,
      system: `${(cpuUsage.system / 1000).toFixed(1)} ms`,
      systemMicros: cpuUsage.system,
    },
    uptime: `${uptime.toFixed(1)} s`,
    uptimeSeconds: uptime,
  };
}

/**
 * Security headers for responses (if applicable)
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

// Helper to read version from package.json at runtime (ESM compatible)
function getPackageVersion() {
  // Use import.meta.url to get the directory in ESM
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkgRaw = fs.readFileSync(pkgPath, 'utf-8');
  return JSON.parse(pkgRaw).version;
}

// Create server instance
const server = new McpServer({
  name: "it-tools-mcp",
  version: getPackageVersion(),
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register all tool modules (dynamically for faster startup, with per-module timing)
async function registerAllTools(server: McpServer) {
  const modules = [
    { name: 'encoding', fn: () => import('./tools/encoding.js').then(m => m.registerEncodingTools(server)) },
    { name: 'crypto', fn: () => import('./tools/crypto.js').then(m => m.registerCryptoTools(server)) },
    { name: 'dataFormat', fn: () => import('./tools/dataFormat.js').then(m => m.registerDataFormatTools(server)) },
    { name: 'text', fn: () => import('./tools/text.js').then(m => m.registerTextTools(server)) },
    { name: 'idGenerators', fn: () => import('./tools/idGenerators.js').then(m => m.registerIdGeneratorTools(server)) },
    { name: 'network', fn: () => import('./tools/network.js').then(m => m.registerNetworkTools(server)) },
    { name: 'math', fn: () => import('./tools/math.js').then(m => m.registerMathTools(server)) },
    { name: 'utility', fn: () => import('./tools/utility.js').then(m => m.registerUtilityTools(server)) },
    { name: 'development', fn: () => import('./tools/development.js').then(m => m.registerDevelopmentTools(server)) },
    { name: 'color', fn: () => import('./tools/color.js').then(m => m.registerColorTools(server)) },
  ];
  for (const mod of modules) {
    console.time(`register:${mod.name}`);
    await mod.fn();
    console.timeEnd(`register:${mod.name}`);
  }
}

// Add resource monitoring tool
server.tool(
  "system-info",
  "Get system resource usage and server information",
  {},
  async () => {
    const usage = getResourceUsage();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            server: "IT Tools MCP Server",
            version: getPackageVersion(),
            uptime: `${Math.floor(usage.uptimeSeconds)} seconds`,
            memory: usage.memory,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }
);

// Run the server
async function main() {
  console.time("Tool registration");
  await registerAllTools(server);
  console.timeEnd("Tool registration");

  const transport = new StdioServerTransport();
  console.time("Server connect");
  await server.connect(transport);
  console.timeEnd("Server connect");

  // Log startup with resource info
  console.error("IT Tools MCP Server running on stdio");
  console.error("Resource usage:", JSON.stringify(getResourceUsage(), null, 2));
  
  // Only start periodic monitoring in production, not in tests
  if (process.env.NODE_ENV !== 'test') {
    // Periodic resource monitoring (every 5 minutes)
    setInterval(() => {
      const usage = getResourceUsage();
      if (usage.memory.heapUsedBytes > 200 * 1024 * 1024) { // Alert if using more than 200MB
        console.error("High memory usage detected:", usage.memory);
      }
    }, 5 * 60 * 1000);
  }
  console.timeEnd("Total startup");
}

console.time("Total startup");
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});