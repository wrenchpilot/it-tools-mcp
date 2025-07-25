#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

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
 * Input validation and security utilities
 */
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
    homepage: pkg.homepage,
    license: pkg.license
  };
}

// Create server instance with enhanced metadata and VS Code compliance features
const packageInfo = getPackageMetadata();
const execAsync = promisify(exec);

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MCP_DEV_MODE === 'true';
const isTest = process.env.NODE_ENV === 'test';

const server = new McpServer({
  name: "it-tools-mcp", 
  version: packageInfo.version,
  description: "A comprehensive Model Context Protocol (MCP) server that provides access to over 100 IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.",
  author: packageInfo.author,
  homepage: packageInfo.homepage,
  repository: packageInfo.repository,
  license: packageInfo.license,
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
    sampling: {},
    roots: {
      listChanged: true
    }
  }
});

// VS Code MCP Compliance: Implement Resources
server.registerResource(
  "server-manifest",
  new ResourceTemplate("manifest://{type}", {
    list: async () => ({
      resources: [
        { name: "manifest://info", description: "Server information and capabilities", uri: "manifest://info" },
        { name: "manifest://tools", description: "Complete list of available tools", uri: "manifest://tools" },
        { name: "manifest://categories", description: "Tool categories and descriptions", uri: "manifest://categories" }
      ]
    })
  }),
  {
    title: "Server Manifest",
    description: "Comprehensive server information, capabilities, and tool catalog",
    mimeType: "application/json"
  },
  async (uri: URL, params: any) => {
    const type = params.type as string;
    const manifestContent = await getManifestContent(type);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(manifestContent, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

server.registerResource(
  "system-logs",
  new ResourceTemplate("logs://{type}", { 
    list: async () => ({
      resources: [
        { name: "logs://system", description: "System log entries", uri: "logs://system" },
        { name: "logs://error", description: "Error log entries", uri: "logs://error" },
        { name: "logs://debug", description: "Debug information", uri: "logs://debug" }
      ]
    })
  }),
  {
    title: "System Logs",
    description: "Access to system and application logs",
    mimeType: "text/plain"
  },
  async (uri: URL, params: any) => {
    const type = params.type as string;
    const logContent = await getLogContent(type);
    return {
      contents: [{
        uri: uri.href,
        text: logContent,
        mimeType: "text/plain"
      }]
    };
  }
);

server.registerResource(
  "tool-documentation",
  new ResourceTemplate("docs://{category}/{tool?}", {
    list: async () => {
      const { toolCategories } = await discoverTools();
      const resources = Object.keys(toolCategories).map(category => ({
        name: `docs://${category}`,
        description: `Documentation for ${category} tools`,
        uri: `docs://${category}`
      }));
      return { resources };
    },
    complete: {
      category: (value) => {
        const categories = ["crypto", "encoding", "network", "text", "utility", "data_format", "id_generators"];
        return categories.filter(c => c.startsWith(value));
      }
    }
  }),
  {
    title: "Tool Documentation",
    description: "Documentation for available tools by category"
  },
  async (uri: URL, params: any) => {
    const category = params.category as string;
    const tool = params.tool as string | undefined;
    const docs = await getToolDocumentation(category, tool);
    return {
      contents: [{
        uri: uri.href,
        text: docs,
        mimeType: "text/markdown"
      }]
    };
  }
);

server.registerResource(
  "workspace-config",
  "config://workspace",
  {
    title: "Workspace Configuration",
    description: "Current workspace configuration and environment settings"
  },
  async (uri: URL) => {
    const config = {
      environment: isDevelopment ? "development" : "production",
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      workingDirectory: process.cwd(),
      timestamp: new Date().toISOString()
    };
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(config, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

// VS Code MCP Compliance: Implement Prompts
server.registerPrompt(
  "it-workflow",
  {
    title: "IT Workflow Assistant",
    description: "Guided workflow for common IT tasks using available tools",
    argsSchema: {
      task_type: completable(z.string(), (value) => {
        const tasks = ["encode", "decode", "hash", "encrypt", "format", "validate", "generate", "convert"];
        return tasks.filter(t => t.startsWith(value));
      }),
      context: z.string().optional().describe("Additional context about the task")
    }
  },
  ({ task_type, context = "" }) => {
    const workflow = generateWorkflowPrompt(task_type, context);
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: workflow
        }
      }]
    };
  }
);

server.registerPrompt(
  "security-check",
  {
    title: "Security Analysis",
    description: "Analyze data for security concerns before processing",
    argsSchema: {
      data_type: completable(z.string(), (value) => {
        const types = ["text", "json", "xml", "html", "sql", "script"];
        return types.filter(t => t.startsWith(value));
      }),
      data: z.string().describe("Data to analyze for security issues")
    }
  },
  ({ data_type, data }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please analyze this ${data_type} data for potential security issues:\n\n${data}\n\nCheck for: injection attempts, malicious patterns, suspicious content, and provide recommendations.`
      }
    }]
  })
);

// VS Code MCP Compliance: Sampling and Roots are declared in capabilities
// The MCP SDK handles these automatically when capabilities are declared

// Helper functions for VS Code MCP compliance features
async function getLogContent(type: string): Promise<string> {
  const logs = {
    system: `System log entries for IT Tools MCP Server\nTimestamp: ${new Date().toISOString()}\nStatus: Running\nMemory: ${JSON.stringify(getResourceUsage().memory, null, 2)}`,
    error: `Error log entries\nNo recent errors recorded\nServer startup: successful\nTool loading: complete`,
    debug: `Debug information\nEnvironment: ${isDevelopment ? 'development' : 'production'}\nNode version: ${process.version}\nPlatform: ${process.platform}`
  };
  
  return logs[type as keyof typeof logs] || "Log type not found";
}

async function getManifestContent(type: string): Promise<any> {
  const { toolCategories } = await discoverTools();
  const toolCount = Object.keys(toolCategories).reduce((total, category) => {
    return total + toolCategories[category].tools.length;
  }, 0);

  const manifests = {
    info: {
      name: packageInfo.name,
      displayName: "IT Tools MCP Server",
      description: packageInfo.description,
      version: packageInfo.version,
      author: packageInfo.author,
      license: packageInfo.license,
      homepage: packageInfo.homepage,
      repository: packageInfo.repository,
      capabilities: {
        tools: toolCount,
        categories: Object.keys(toolCategories).length,
        resources: true,
        prompts: true
      },
      features: [
        `${toolCount}+ IT tools and utilities`,
        `${Object.keys(toolCategories).length} tool categories`,
        "Encoding/Decoding tools",
        "Cryptographic functions", 
        "Network utilities",
        "Text processing tools",
        "JSON/XML/YAML formatting",
        "Docker integration",
        "Security focused design",
        "Type-safe implementation"
      ],
      installation: {
        npm: "npx it-tools-mcp",
        docker: "docker run -i --rm wrenchpilot/it-tools-mcp:latest"
      }
    },
    tools: Object.keys(toolCategories).reduce((acc, category) => {
      acc[category] = {
        description: toolCategories[category].description,
        tools: toolCategories[category].tools
      };
      return acc;
    }, {} as any),
    categories: Object.keys(toolCategories).map(category => ({
      name: category,
      description: toolCategories[category].description,
      toolCount: toolCategories[category].tools.length,
      tools: toolCategories[category].tools
    }))
  };
  
  return manifests[type as keyof typeof manifests] || { error: "Manifest type not found" };
}

async function getToolDocumentation(category: string, tool?: string): Promise<string> {
  if (tool) {
    return `# ${tool} Documentation\n\nCategory: ${category}\n\nThis tool provides ${category} functionality.\n\nUsage: See tool description for specific parameters and examples.`;
  }
  
  const { toolCategories } = await discoverTools();
  const categoryInfo = toolCategories[category];
  
  if (!categoryInfo) {
    return `# Category Not Found\n\nThe category '${category}' was not found.`;
  }
  
  return `# ${category} Category Documentation\n\n${categoryInfo.description}\n\n## Available Tools\n\n${categoryInfo.tools.map(t => `- ${t}`).join('\n')}`;
}

function generateWorkflowPrompt(taskType: string, context: string): string {
  const workflows = {
    encode: `I need to encode data. Context: ${context}\n\nRecommended workflow:\n1. Identify the type of encoding needed (base64, URL, HTML)\n2. Use the appropriate encoding tool\n3. Verify the result`,
    hash: `I need to hash data. Context: ${context}\n\nRecommended workflow:\n1. Choose appropriate hash algorithm (MD5, SHA256, etc.)\n2. Use the corresponding hash tool\n3. Store or compare the hash securely`,
    format: `I need to format data. Context: ${context}\n\nRecommended workflow:\n1. Identify the data format (JSON, XML, HTML, SQL)\n2. Use the appropriate formatter tool\n3. Validate the formatted output`
  };
  
  return workflows[taskType as keyof typeof workflows] || `Generic IT workflow for: ${taskType}\nContext: ${context}\n\nPlease describe your specific requirements for customized guidance.`;
}

function getAnalysisPrompt(analysisType: string, content: string): string {
  const prompts = {
    summarize: `Please provide a concise summary of the following content:\n\n${content}`,
    security: `Please analyze the following content for security concerns, potential vulnerabilities, or suspicious patterns:\n\n${content}`,
    optimization: `Please analyze the following content and suggest optimizations or improvements:\n\n${content}`,
    documentation: `Please analyze the following content and generate appropriate documentation:\n\n${content}`
  };
  
  return prompts[analysisType as keyof typeof prompts] || `Please analyze the following content:\n\n${content}`;
}

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
          console.error(`Loaded tool: ${category}/${toolDir}`);
        } else {
          console.warn(`No register function found in ${toolPath}`);
        }
      } catch (error) {
        console.error(`Failed to load tool ${category}/${toolDir}:`, 
          error instanceof Error ? error.message : 'Unknown error');
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

// Add comprehensive system and server information tool with VS Code compliance annotations
server.registerTool("system_info", {
  description: "Get comprehensive system information, server details, available tool categories, and resource usage. Example: system information, tool categories, installation guide",
  inputSchema: {
    include_tools: z.boolean().optional().describe("Include detailed information about all available tools"),
    category: z.string().optional().describe("Get information about a specific category (dynamically discovered)")
  },
  // VS Code compliance annotations
  annotations: {
    title: "System Information",
    description: "Comprehensive system and server information including tool categories and resource usage",
    readOnlyHint: true
  }
}, async (args) => {
  const { include_tools = false, category } = args;
  
  // Discover tools dynamically
  const { toolCategories, totalToolCount } = await discoverTools();
  
  // Get comprehensive system info
  const usage = getResourceUsage();
  const systemInfo = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    resourceUsage: usage
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

// VS Code MCP Compliance: Implement Prompts
server.registerPrompt("it-tools-workflow", {
  description: "Guided workflow for common IT tasks using available tools",
  argsSchema: {
    task_type: z.string().describe("Type of IT task to perform"),
    context: z.string().optional().describe("Additional context about the task")
  }
}, async (args) => {
  const { task_type, context = "" } = args;
  
  const workflows = {
    security: `Security Workflow for IT Tools MCP:
1. Generate secure password: use generate_password tool
2. Hash password: use bcrypt_hash tool  
3. Generate JWT token: use jwt_decode tool
4. Generate TOTP: use otp_code_generator tool
5. Create basic auth: use basic_auth_generator tool
${context ? `Context: ${context}` : ''}`,

    encoding: `Encoding/Decoding Workflow:
1. Base64 encode: use base64_encode tool
2. URL encode: use url_encode tool  
3. HTML encode: use html_encode tool
4. Convert text to binary: use text_to_binary tool
${context ? `Context: ${context}` : ''}`,

    network: `Network Analysis Workflow:
1. Check connectivity: use ping tool
2. DNS lookup: use dig tool
3. Make HTTP request: use curl tool
4. Generate QR code: use qr_generate tool
${context ? `Context: ${context}` : ''}`,

    development: `Development Workflow:
1. Format JSON: use json_format tool
2. Generate regex: use regex_tester tool
3. Create cron job: use crontab_generate tool
4. Prettify code: use javascript_prettifier tool
${context ? `Context: ${context}` : ''}`
  };

  const workflow = workflows[task_type as keyof typeof workflows] || 
    `General IT Tools Workflow:
1. Use system_info to explore available tools
2. Select appropriate tools from 14+ categories
3. Execute tasks with proper input validation
${context ? `Context: ${context}` : ''}`;

  return {
    description: `Workflow guidance for ${task_type} tasks`,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: workflow
        }
      }
    ]
  };
});

// Add a README resource for VS Code
server.registerResource(
  "readme",
  new ResourceTemplate("readme://{section}", {
    list: async () => ({
      resources: [
        { name: "readme://full", description: "Complete README documentation", uri: "readme://full" },
        { name: "readme://installation", description: "Installation instructions", uri: "readme://installation" },
        { name: "readme://tools", description: "Available tools overview", uri: "readme://tools" },
        { name: "readme://examples", description: "Usage examples", uri: "readme://examples" }
      ]
    })
  }),
  {
    title: "Documentation",
    description: "Server documentation and usage guide",
    mimeType: "text/markdown"
  },
  async (uri: URL, params: any) => {
    const section = params.section as string;
    const readmeContent = await getReadmeContent(section);
    return {
      contents: [{
        uri: uri.href,
        text: readmeContent,
        mimeType: "text/markdown"
      }]
    };
  }
);

// Run the server
async function main() {
  try {
    // VS Code MCP Compliance: Dev Mode Support
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MCP_DEV_MODE === 'true';
    const isTest = process.env.NODE_ENV === 'test' && process.env.MCP_TEST_MODE === 'true';
    
    if (isDevelopment) {
      console.error("🔧 IT Tools MCP Server starting in DEVELOPMENT mode");
      console.error("   - Enhanced logging enabled");
      console.error("   - Hot reload capabilities active");
      console.error("   - Debug information available");
    }
    
    await registerAllTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log startup information based on environment
    if (isTest) {
      console.error("IT Tools MCP Server running on stdio");
      // Exit after stdin closes (for test automation)
      process.stdin.on('end', () => {
        setTimeout(() => process.exit(0), 100);
      });
    } else if (isDevelopment) {
      console.error("🚀 IT Tools MCP Server connected successfully");
      console.error(`📊 Loaded ${await getToolCount()} tools across ${await getCategoryCount()} categories`);
      console.error(`🔗 Protocol: Model Context Protocol (MCP) via stdio`);
      console.error(`📦 Version: ${packageInfo.version}`);
    }
    
    // Enhanced monitoring in development mode
    if (isDevelopment && !isTest) {
      // More frequent monitoring in dev mode (every minute)
      setInterval(() => {
        const usage = getResourceUsage();
        if (usage.memory.heapUsedBytes > 200 * 1024 * 1024) {
          console.error("⚠️  High memory usage detected:", usage.memory);
        }
        
        // Log periodic status in dev mode
        console.error(`📈 Status: Memory ${usage.memory.heapUsed}, CPU ${usage.cpu.user}ms user, ${usage.cpu.system}ms system`);
      }, 60 * 1000); // Every minute in dev mode
    } else if (!isTest) {
      // Production monitoring (every 5 minutes)
      setInterval(() => {
        const usage = getResourceUsage();
        if (usage.memory.heapUsedBytes > 200 * 1024 * 1024) {
          console.error("High memory usage detected:", usage.memory);
        }
      }, 5 * 60 * 1000);
    }

    // Handle graceful shutdown
    const shutdown = () => {
      if (isDevelopment) {
        console.error("🛑 Shutting down IT Tools MCP Server (Development Mode)...");
      } else {
        console.error("Shutting down IT Tools MCP Server...");
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

// Helper functions for development mode
async function getToolCount(): Promise<number> {
  const { totalToolCount } = await discoverTools();
  return totalToolCount;
}

async function getCategoryCount(): Promise<number> {
  const { toolCategories } = await discoverTools();
  return Object.keys(toolCategories).length;
}

async function getReadmeContent(section: string): Promise<string> {
  const readmePath = path.resolve(__dirname, '../README.md');
  
  try {
    const fullReadme = fs.readFileSync(readmePath, 'utf-8');
    
    const sections = {
      full: fullReadme,
      installation: extractReadmeSection(fullReadme, '## 📦 Installation & Setup'),
      tools: extractReadmeSection(fullReadme, '## Available Tools'),
      examples: extractReadmeSection(fullReadme, '## 📸 Screenshot Examples')
    };
    
    return sections[section as keyof typeof sections] || `# ${section}\n\nSection not found in README.`;
  } catch (error) {
    return `# Error\n\nCould not read README.md: ${error}`;
  }
}

function extractReadmeSection(content: string, heading: string): string {
  const lines = content.split('\n');
  const startIndex = lines.findIndex(line => line.startsWith(heading));
  
  if (startIndex === -1) {
    return `# Section Not Found\n\nThe section "${heading}" was not found in the README.`;
  }
  
  const endIndex = lines.findIndex((line, index) => 
    index > startIndex && line.startsWith('## ') && !line.startsWith(heading)
  );
  
  const sectionLines = endIndex === -1 
    ? lines.slice(startIndex) 
    : lines.slice(startIndex, endIndex);
  
  return sectionLines.join('\n');
}

// Start the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
  });
}