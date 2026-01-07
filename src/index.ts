#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
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
      mcpLog('error', `Tool error for ${identifier}`, error instanceof Error ? error.message : 'Unknown error');

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
  // Use module-level __dirname (correctly handles Windows paths via fileURLToPath)
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

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MCP_DEV_MODE === 'true';
const isTest = process.env.NODE_ENV === 'test';

// MCP Logging Implementation
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  notice: 2,
  warning: 3,
  error: 4,
  critical: 5,
  alert: 6,
  emergency: 7
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Current minimum log level (default to info in production, debug in development)
let currentLogLevel: number = isDevelopment ? LOG_LEVELS.debug : LOG_LEVELS.info;
let mcpTransportReady = false;

// Progress tracking
const activeProgressTokens = new Map<string | number, boolean>();

// Request cancellation tracking
const activeRequests = new Map<string | number, { abortController: AbortController; startTime: number }>();

const server = new McpServer({
  name: "it-tools-mcp",
  version: packageInfo.version,
  title: "IT Tools MCP Server - a comprehensive collection of IT utilities",
  websiteUrl: packageInfo.homepage
}, {
  capabilities: {
    tools: {
      listChanged: true
    },
    resources: {
      listChanged: true
    },
    prompts: {
      listChanged: true
    },
    logging: {},
    completions: {}
  }
});

// MCP Logging Functions
function mcpLog(level: LogLevel, message: string, data?: any): void {
  const levelValue = LOG_LEVELS[level];

  // Only send if level meets minimum threshold
  if (levelValue >= currentLogLevel && mcpTransportReady) {
    try {
      // Prepare safe data for notification
      let safeData: any = undefined;
      try {
        if (data instanceof Error) {
          safeData = { error: data.message, stack: data.stack };
        } else if (typeof data === 'object' && data !== null) {
          safeData = data;
        } else if (data !== undefined) {
          safeData = { info: data };
        }
      } catch (e) {
        safeData = { info: String(data) };
      }

      // Send MCP logging notification (notifications/message)
      server.server.notification({
        method: "notifications/message",
        params: {
          level,
          logger: packageInfo.name || 'it-tools-mcp',
          data: {
            message,
            ...(safeData !== undefined ? { details: safeData } : {}),
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      // Fallback to console if MCP notification fails
      console.error(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  // Also log to console for development/debugging
  if (isDevelopment || level === 'error' || level === 'critical' || level === 'emergency') {
    console.error(`[${level.toUpperCase()}] ${message}`, data || '');
  }
}

// Register logging/setLevel handler using the tool registration pattern
server.registerTool("logging_setLevel", {
  description: "Set the minimum logging level for MCP logging notifications. Available levels: debug, info, notice, warning, error, critical, alert, emergency",
  inputSchema: {
    level: z.enum(['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency']).describe("The minimum log level to report")
  }
}, async (args) => {
  const { level } = args;
  const oldLevelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k as LogLevel] === currentLogLevel) as LogLevel;
  currentLogLevel = LOG_LEVELS[level as LogLevel];

  mcpLog('info', `Log level changed from ${oldLevelName} to ${level}`);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        previousLevel: oldLevelName,
        newLevel: level,
        message: `Logging level set to ${level}`,
        availableLevels: Object.keys(LOG_LEVELS),
        currentLevelValue: currentLogLevel
      }, null, 2)
    }]
  };
});

// Also register the JSON-RPC method name expected by the MCP spec so
// clients that call "logging/setLevel" receive a proper response instead
// of a Method Not Found (-32601). This bridges the tool-style registration
// with the spec-compliant JSON-RPC method name.
server.server.setRequestHandler(
  z.object({
    method: z.literal("logging/setLevel"),
    params: z.object({ level: z.enum(['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency']) })
  }),
  async (request) => {
    const { level } = request.params as { level: LogLevel };
    const oldLevelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k as LogLevel] === currentLogLevel) as LogLevel;
    currentLogLevel = LOG_LEVELS[level as LogLevel];
    mcpLog('info', `Log level changed from ${oldLevelName} to ${level}`);

    // Per-spec the server may return an empty result. Returning an empty
    // object here avoids surprising clients/tools that strictly validate
    // response shapes (the Inspector/CLI validates responses and will
    // reject unknown keys). If clients need details, they can call the
    // `logging_status` tool or rely on logging notifications.
    return {};
  }
);

// Add logging status tool
server.registerTool("logging_status", {
  description: "Get current MCP logging configuration and status",
  inputSchema: {}
}, async (args) => {
  const currentLevelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k as LogLevel] === currentLogLevel) as LogLevel;

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        currentLevel: currentLevelName,
        currentLevelValue: currentLogLevel,
        transportReady: mcpTransportReady,
        environment: isDevelopment ? 'development' : 'production',
        availableLevels: Object.entries(LOG_LEVELS).map(([name, value]) => ({
          name,
          value,
          active: value >= currentLogLevel
        })),
        logLevelDescriptions: {
          debug: "Detailed debug information (level 0)",
          info: "General information messages (level 1)",
          notice: "Normal but significant events (level 2)",
          warning: "Warning conditions (level 3)",
          error: "Error conditions (level 4)",
          critical: "Critical conditions (level 5)",
          alert: "Action must be taken immediately (level 6)",
          emergency: "System is unusable (level 7)"
        }
      }, null, 2)
    }]
  };
});

// MCP Utilities Implementation

// Ping utility - connection health check
server.server.setRequestHandler(
  z.object({ method: z.literal("ping") }),
  async () => {
    mcpLog('debug', 'Ping request received');
    return {}; // Empty response as per spec
  }
);

// Progress notification function
function sendProgressNotification(progressToken: string | number, progress: number, total?: number, message?: string): void {
  if (!mcpTransportReady || !activeProgressTokens.has(progressToken)) {
    return;
  }

  try {
    server.server.notification({
      method: "notifications/progress",
      params: {
        progressToken,
        progress,
        ...(total !== undefined && { total }),
        ...(message && { message })
      }
    });
    mcpLog('debug', `Progress notification sent for token ${progressToken}: ${progress}${total ? `/${total}` : ''}`);
  } catch (error) {
    mcpLog('warning', `Failed to send progress notification for token ${progressToken}`, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Cancellation notification handler
server.server.setNotificationHandler(
  z.object({
    method: z.literal("notifications/cancelled"),
    params: z.object({
      requestId: z.union([z.string(), z.number()]),
      reason: z.string().optional()
    })
  }),
  async (notification) => {
    const { requestId, reason } = notification.params;

    mcpLog('info', `Cancellation requested for request ${requestId}`, reason ? { reason } : undefined);

    const activeRequest = activeRequests.get(requestId);
    if (activeRequest) {
      // Cancel the request using AbortController
      activeRequest.abortController.abort(reason || 'Request cancelled');
      activeRequests.delete(requestId);
      mcpLog('info', `Request ${requestId} cancelled successfully`);
    } else {
      mcpLog('debug', `Cancellation notification for unknown or completed request: ${requestId}`);
    }
  }
);

// Helper function to extract progress token from request metadata
function extractProgressToken(params: any): string | number | undefined {
  return params?._meta?.progressToken;
}

// Helper function to register active request for cancellation support
function registerActiveRequest(requestId: string | number): AbortController {
  const abortController = new AbortController();
  activeRequests.set(requestId, {
    abortController,
    startTime: Date.now()
  });
  return abortController;
}

// Helper function to unregister active request
function unregisterActiveRequest(requestId: string | number): void {
  activeRequests.delete(requestId);
}

// Enhanced tool handler with cancellation and progress support
export function mcpToolHandler<T extends Record<string, any>>(
  handler: (params: T, options?: { signal?: AbortSignal; progressCallback?: (progress: number, total?: number, message?: string) => void }) => Promise<any>,
  identifier: string = 'default'
) {
  return async (params: T, extra?: { signal?: AbortSignal; requestId?: string | number }) => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(identifier)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Extract progress token if provided
    const progressToken = extractProgressToken(params);
    if (progressToken) {
      activeProgressTokens.set(progressToken, true);
    }

    // Register request for cancellation if requestId provided
    let abortController: AbortController | undefined;
    if (extra?.requestId) {
      abortController = registerActiveRequest(extra.requestId);
    }

    // Create combined abort signal
    const signals = [extra?.signal, abortController?.signal].filter(Boolean) as AbortSignal[];
    let combinedSignal: AbortSignal | undefined;

    if (signals.length > 0) {
      const combinedController = new AbortController();
      combinedSignal = combinedController.signal;

      signals.forEach(signal => {
        if (signal.aborted) {
          combinedController.abort(signal.reason);
        } else {
          signal.addEventListener('abort', () => {
            combinedController.abort(signal.reason);
          });
        }
      });
    }

    // Progress callback
    const progressCallback = progressToken
      ? (progress: number, total?: number, message?: string) => {
        sendProgressNotification(progressToken, progress, total, message);
      }
      : undefined;

    try {
      const result = await handler(params, {
        signal: combinedSignal,
        progressCallback
      });

      return result;
    } catch (error) {
      // Log error without exposing sensitive information
      mcpLog('error', `Tool error for ${identifier}`, error instanceof Error ? error.message : 'Unknown error');

      // Return safe error message
      throw new Error('Tool execution failed. Please check your input and try again.');
    } finally {
      // Cleanup
      if (progressToken) {
        activeProgressTokens.delete(progressToken);
      }
      if (extra?.requestId) {
        unregisterActiveRequest(extra.requestId);
      }
    }
  };
}

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
  new ResourceTemplate("docs://{category}", {
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
    // For this simpler template, we only handle category-level documentation
    const docs = await getToolDocumentation(category);
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

// VS Code MCP Compliance: Completions are declared in capabilities
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

// Helper function to extract tool documentation from the main README table
function extractToolFromReadme(readmeContent: string, toolName: string): string | null {
  // Look for the tool in the Available Tools table
  const lines = readmeContent.split('\n');
  const toolRegex = new RegExp(`\\|\\s*\`${toolName}\`\\s*\\|`, 'i');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (toolRegex.test(line)) {
      // Found the tool, extract the row
      const parts = line.split('|').map(part => part.trim()).filter(part => part.length > 0);
      if (parts.length >= 2) {
        const cleanToolName = parts[0].replace(/`/g, ''); // Remove backticks from tool name
        const descCell = parts[1]; // Description cell
        const paramsCell = parts.length > 2 ? parts[2] : ''; // Parameters cell

        return `# ${cleanToolName} Documentation\n\n**Description:** ${descCell}\n\n${paramsCell ? `**Parameters:** ${paramsCell}\n\n` : ''}**Usage:** ${descCell}`;
      }
    }
  }

  return null;
}

// Helper function to extract category section from the main README 
function extractCategoryFromReadme(readmeContent: string, category: string): string | null {
  // Map category names to README section names
  const categoryMappings: Record<string, string> = {
    'ansible': 'Ansible Tools',
    'color': 'Color Tools',
    'data_format': 'Data Format',
    'development': 'Development Tools',
    'docker': 'Docker Tools',
    'encoding': 'Encoding & Decoding',
    'forensic': 'Forensic Tools',
    'id_generators': 'ID & Code Generators',
    'math': 'Math & Calculations',
    'network': 'Network & System',
    'physics': 'Physics',
    'crypto': 'Security & Crypto',
    'text': 'Text Processing',
    'utility': 'Utility Tools'
  };

  const sectionName = categoryMappings[category];
  if (!sectionName) {
    return null;
  }

  // Find the section in the README table
  const lines = readmeContent.split('\n');
  let inTargetSection = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the target section
    if (line.includes(`**${sectionName}**`)) {
      inTargetSection = true;
      continue;
    }

    // Check if we're entering a new section (exit current)
    if (inTargetSection && line.includes('**') && line.includes('**') && !line.includes(sectionName)) {
      break;
    }

    // Collect table rows while in target section
    if (inTargetSection && line.includes('|') && !line.includes('---')) {
      tableRows.push(line);
    }
  }

  if (tableRows.length === 0) {
    return null;
  }

  // Parse and clean up the table
  const cleanedContent: string[] = [`# ${sectionName} Documentation\n`];

  for (const row of tableRows) {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);

    if (cells.length >= 2) {
      const toolName = cells[0].replace(/`/g, ''); // Remove backticks
      const description = cells[1];
      const parameters = cells.length > 2 ? cells[2] : '';

      cleanedContent.push(`## ${toolName}`);
      cleanedContent.push(`**Description:** ${description}`);
      if (parameters) {
        cleanedContent.push(`**Parameters:** ${parameters}`);
      }
      cleanedContent.push(''); // Add empty line for spacing
    }
  }

  return cleanedContent.join('\n');
}

async function getToolDocumentation(category: string, tool?: string): Promise<string> {
  // When compiled, __dirname will be the build/ directory, so we need to go up one level
  const readmePath = path.join(__dirname, '../README.md');

  if (tool) {
    // For specific tools, try to find them in the README table
    try {
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');
      const toolSection = extractToolFromReadme(readmeContent, tool);
      if (toolSection) {
        return toolSection;
      }
    } catch (error) {
      mcpLog('warning', `Failed to read README for tool documentation: ${readmePath}`, error instanceof Error ? error.message : 'Unknown error');
    }
    return `# ${tool} Documentation\n\nCategory: ${category}\n\nThis tool provides ${category} functionality.\n\nUsage: See tool description for specific parameters and examples.`;
  }

  // Try to read category documentation from README
  try {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const categorySection = extractCategoryFromReadme(readmeContent, category);
    if (categorySection) {
      return categorySection;
    }
  } catch (error) {
    mcpLog('warning', `Failed to read README for category documentation: ${readmePath}`, error instanceof Error ? error.message : 'Unknown error');
  }

  // Fallback to dynamic generation
  const { toolCategories } = await discoverTools();
  const categoryInfo = toolCategories[category];

  if (!categoryInfo) {
    return `# Category Not Found\n\nThe category '${category}' was not found.\n\nAvailable categories: ${Object.keys(toolCategories).join(', ')}`;
  }

  return `# ${category} Category Documentation\n\n${categoryInfo.description}\n\n## Available Tools\n\n${categoryInfo.tools.map(t => `- ${t}`).join('\n')}\n\n*This documentation was generated automatically. For detailed documentation, see the main README.md file.*`;
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
    if (isDevelopment) {
      mcpLog('warning', `Category directory does not exist: ${toolsDir}`);
    }
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
          try {
            registerFunction(server);
            // Only log tool loading in development mode
            if (isDevelopment) {
              mcpLog('debug', `Loaded tool: ${category}/${toolDir}`);
            }
          } catch (regError) {
            // Always log errors
            mcpLog('error', `Failed to register tool ${category}/${toolDir}`,
              regError instanceof Error ? regError.message : 'Unknown registration error');
          }
        } else {
          // Only warn in development mode
          if (isDevelopment) {
            mcpLog('warning', `No register function found in ${toolPath}`);
          }
        }
      } catch (error) {
        // Always log errors
        mcpLog('error', `Failed to load tool ${category}/${toolDir}`,
          error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      // Only warn in development mode
      if (isDevelopment) {
        mcpLog('warning', `Tool index file does not exist: ${toolPath}`);
      }
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
    if (isDevelopment) {
      mcpLog('warning', 'Tools directory does not exist', toolsBaseDir);
    }
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
    const isTest = process.env.NODE_ENV === 'test' && process.env.MCP_TEST_MODE === 'true';

    mcpLog('info', 'Starting IT Tools MCP Server', {
      version: packageInfo.version,
      environment: isDevelopment ? 'development' : 'production',
      nodeVersion: process.version
    });

    // Add error handling for unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      // Only log to stderr in development or for critical errors
      if (isDevelopment) {
        mcpLog('error', 'Unhandled Rejection', { promise: promise.toString(), reason });
      }
    });

    process.on('uncaughtException', (error) => {
      mcpLog('critical', 'Uncaught Exception', error.message);
      process.exit(1);
    });

    // Register tools and connect
    mcpLog('debug', 'Registering tools...');
    const startTime = Date.now();
    await registerAllTools(server);
    const toolLoadTime = Date.now() - startTime;

    const { totalToolCount, toolCategories } = await discoverTools();
    mcpLog('info', 'Tools registered successfully', {
      totalTools: totalToolCount,
      categories: Object.keys(toolCategories).length,
      loadTimeMs: toolLoadTime
    });

    mcpLog('debug', 'Connecting to MCP transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Mark MCP transport as ready for logging
    mcpTransportReady = true;
    mcpLog('info', 'MCP Server started successfully', {
      transport: 'stdio',
      ready: true
    });

    // Exit handler for test automation
    if (isTest) {
      mcpLog('debug', 'Test mode: Setting up exit handler');
      process.stdin.on('end', () => {
        mcpLog('debug', 'Test mode: stdin ended, exiting...');
        setTimeout(() => process.exit(0), 100);
      });
    }

    // Production monitoring (every 5 minutes) - no logging unless critical
    if (!isTest) {
      mcpLog('debug', 'Setting up production monitoring');
      setInterval(() => {
        const usage = getResourceUsage();
        if (usage.memory.heapUsedBytes > 200 * 1024 * 1024) {
          // Critical memory issues
          mcpLog('critical', 'High memory usage detected', usage.memory);
        }
      }, 5 * 60 * 1000);
    }

    // Handle graceful shutdown
    const shutdown = () => {
      mcpLog('info', 'Graceful shutdown initiated');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    mcpLog('emergency', 'Fatal error starting MCP server', error instanceof Error ? error.message : 'Unknown error');
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

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});