#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// Get package metadata for enhanced server info
function getPackageMetadata() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkgRaw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(pkgRaw);
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    keywords: pkg.keywords,
    author: pkg.author,
    repository: pkg.repository,
    homepage: pkg.homepage
  };
}

// Create server instance with enhanced metadata
const packageInfo = getPackageMetadata();
const server = new McpServer({
  name: "it-tools-mcp",
  version: packageInfo.version,
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function to dynamically load modular tools from a category directory
async function loadModularTools(server: McpServer, category: string) {
  const toolsDir = path.join(__dirname, 'tools', category);
  
  if (!fs.existsSync(toolsDir)) {
    console.warn(`Category directory does not exist: ${toolsDir}`);
    return;
  }

  const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const toolDir of toolDirs) {
    const toolPath = path.join(toolsDir, toolDir, 'index.js');
    
    if (fs.existsSync(toolPath)) {
      try {
        const toolModule = await import(`./${path.relative(__dirname, toolPath).replace(/\\/g, '/')}`);
        
        // Find the register function in the module
        const registerFunction = Object.values(toolModule).find(
          (fn: any) => typeof fn === 'function' && fn.name.startsWith('register')
        ) as ((server: McpServer) => void) | undefined;

        if (registerFunction) {
          registerFunction(server);
        } else {
          console.warn(`No register function found in ${toolPath}`);
        }
      } catch (error) {
        console.error(`Failed to load tool ${category}/${toolDir}:`, error);
      }
    } else {
      console.warn(`Tool index file does not exist: ${toolPath}`);
    }
  }
}

// Dynamic tool discovery and metadata generation
async function discoverTools() {
  const toolsBaseDir = path.join(__dirname, 'tools');
  
  if (!fs.existsSync(toolsBaseDir)) {
    return { toolCategories: {}, totalToolCount: 0 };
  }

  // Discover categories dynamically from the filesystem
  const categories = fs.readdirSync(toolsBaseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort(); // Sort for consistent ordering

  const toolCategories: Record<string, { description: string; tools: string[] }> = {};
  let totalToolCount = 0;

  for (const category of categories) {
    const toolsDir = path.join(toolsBaseDir, category);
    
    const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort(); // Sort tools within category

    if (toolDirs.length > 0) {
      toolCategories[category] = {
        description: await getCategoryDescription(category, toolDirs),
        tools: toolDirs
      };
      totalToolCount += toolDirs.length;
    }
  }

  return { toolCategories, totalToolCount };
}

// Generate category description by examining actual tool metadata
async function getCategoryDescription(category: string, toolNames: string[]): Promise<string> {
  const toolsDir = path.join(__dirname, 'tools', category);
  const toolDescriptions: string[] = [];
  
  // Try to extract descriptions from a few sample tools in the category
  const samplesToCheck = Math.min(3, toolNames.length); // Check up to 3 tools for description
  
  for (let i = 0; i < samplesToCheck; i++) {
    const toolDir = toolNames[i];
    const toolPath = path.join(toolsDir, toolDir, 'index.js');
    
    if (fs.existsSync(toolPath)) {
      try {
        const toolModule = await import(`./${path.relative(__dirname, toolPath).replace(/\\/g, '/')}`);
        
        // Look for description in the tool registration
        const registerFunction = Object.values(toolModule).find(
          (fn: any) => typeof fn === 'function' && fn.name.startsWith('register')
        ) as any;
        
        if (registerFunction) {
          // Create a mock server to capture the tool registration
          const mockServer = {
            registerTool: (name: string, config: any) => {
              if (config.description && typeof config.description === 'string') {
                toolDescriptions.push(config.description);
              }
            }
          };
          
          try {
            registerFunction(mockServer as any);
          } catch (error) {
            // Ignore errors in mock registration
          }
        }
      } catch (error) {
        // Continue if we can't load a tool
      }
    }
  }
  
  // Generate category description based on collected tool descriptions
  if (toolDescriptions.length > 0) {
    // Create a summary from the actual tool descriptions
    const uniqueDescriptions = [...new Set(toolDescriptions)];
    
    if (uniqueDescriptions.length === 1) {
      // If all tools have the same description, use it directly
      return uniqueDescriptions[0];
    } else if (uniqueDescriptions.length <= 3) {
      // If we have 2-3 unique descriptions, combine them
      return `${category.charAt(0).toUpperCase() + category.slice(1)} tools: ${uniqueDescriptions.join(', ')}`;
    } else {
      // If we have many descriptions, provide a generic summary
      return `${category.charAt(0).toUpperCase() + category.slice(1)} category with ${toolNames.length} tools including: ${uniqueDescriptions.slice(0, 2).join(', ')} and more`;
    }
  }
  
  // Fallback: generate description from category name and tool count
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return `${categoryTitle} tools and utilities (${toolNames.length} tools available)`;
}

// Register server info tool with dynamic metadata
server.registerTool("server-info", {
  description: "Get comprehensive information about the IT Tools MCP server, including available tool categories, version, and capabilities",
  inputSchema: {
    include_tools: z.boolean().optional().describe("Include detailed information about all available tools"),
    category: z.string().optional().describe("Get information about a specific category (dynamically discovered)")
  }
}, async (args) => {
  const { include_tools = false, category } = args;
  
  // Discover tools dynamically
  const { toolCategories, totalToolCount } = await discoverTools();
  
  // Get system info
  const systemInfo = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };

  // Server metadata from package.json
  const serverMetadata = {
    name: "IT Tools MCP Server",
    version: packageInfo.version,
    description: packageInfo.description,
    author: packageInfo.author,
    repository: packageInfo.repository?.url,
    homepage: packageInfo.homepage,
    keywords: packageInfo.keywords,
    protocol: "Model Context Protocol (MCP)",
    transport: "stdio"
  };

  const baseResult = {
    server: serverMetadata,
    system: systemInfo,
    categories: Object.keys(toolCategories).length,
    totalTools: totalToolCount,
    installation: {
      vscode: "Use VS Code install button in README or manual configuration",
      claude: "Add to claude_desktop_config.json",
      npm: `npm install -g ${packageInfo.name}`
    }
  };

  let result: any = baseResult;

  // Add category-specific information
  if (category && toolCategories[category]) {
    result = {
      ...result,
      categoryDetails: {
        name: category,
        ...toolCategories[category]
      }
    };
  } else if (!category) {
    result = {
      ...result,
      availableCategories: toolCategories
    };
  }

  // Include detailed tool information if requested
  if (include_tools) {
    result = {
      ...result,
      toolsBreakdown: Object.entries(toolCategories).map(([cat, info]) => ({
        category: cat,
        count: info.tools.length,
        tools: info.tools
      }))
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
});

// Register all tools dynamically by discovering categories from filesystem
async function registerAllTools(server: McpServer) {
  const toolsBaseDir = path.join(__dirname, 'tools');
  
  if (!fs.existsSync(toolsBaseDir)) {
    console.warn('Tools directory does not exist:', toolsBaseDir);
    return;
  }

  // Discover categories dynamically from the filesystem
  const categories = fs.readdirSync(toolsBaseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort(); // Sort for consistent ordering

  for (const category of categories) {
    await loadModularTools(server, category);
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
            version: packageInfo.version,
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
  await registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup (stderr only, no resource usage)
  if (process.env.NODE_ENV === 'test' && process.env.MCP_TEST_MODE === 'true') {
    console.error("IT Tools MCP Server running on stdio");
    // Exit after stdin closes (for test automation)
    process.stdin.on('end', () => {
      setTimeout(() => process.exit(0), 100);
    });
  }
  
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
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});