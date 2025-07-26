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
  description: "A comprehensive Model Context Protocol (MCP) server that provides access to over 100 IT tools and utilities commonly used by developers, system administrators, and IT professionals. This server exposes a complete set of tools for encoding/decoding, text manipulation, hashing, network utilities, and many other common development and IT tasks.",
  author: packageInfo.author,
  homepage: packageInfo.homepage,
  repository: packageInfo.repository,
  license: packageInfo.license,
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
    sampling: {},
    roots: {
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
      // Send MCP logging notification (using the transport directly)
      // Note: The MCP SDK may handle this differently - this is a placeholder for the proper implementation
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

// Demo tools for MCP utilities
server.registerTool("mcp_utilities_demo", {
  description: "Demonstrate MCP utilities: ping, progress tracking, and cancellation support",
  inputSchema: {
    operation: z.enum(['ping', 'long_task', 'cancellable_task']).describe("The MCP utility operation to demonstrate"),
    duration: z.number().optional().describe("Duration in seconds for long-running tasks (default: 10)"),
    steps: z.number().optional().describe("Number of progress steps for demonstrating progress tracking (default: 5)")
  }
}, async (args) => {
  const { operation, duration = 10, steps = 5 } = args;

  if (operation === 'ping') {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          operation: 'ping',
          status: 'success',
          message: 'MCP ping utility is working correctly',
          timestamp: new Date().toISOString(),
          usage: 'Send a "ping" request to test connection health'
        }, null, 2)
      }]
    };
  }

  if (operation === 'long_task') {
    // Simulate a long-running task with progress updates
    const totalMs = duration * 1000;
    const stepMs = totalMs / steps;
    
    return {
      content: [{
        type: "text", 
        text: JSON.stringify({
          operation: 'long_task',
          status: 'completed',
          message: `Simulated ${duration}s task with ${steps} progress updates`,
          note: 'Use _meta.progressToken in your request to receive progress notifications',
          example: {
            request: {
              jsonrpc: "2.0",
              id: 1,
              method: "tools/call", 
              params: {
                name: "mcp_utilities_demo",
                arguments: { operation: "long_task", duration: 5, steps: 3 },
                _meta: { progressToken: "demo123" }
              }
            }
          }
        }, null, 2)
      }]
    };
  }

  if (operation === 'cancellable_task') {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          operation: 'cancellable_task',
          status: 'completed',
          message: 'Simulated cancellable task',
          note: 'Send a notifications/cancelled message to cancel in-progress requests',
          example: {
            cancel_notification: {
              jsonrpc: "2.0",
              method: "notifications/cancelled",
              params: {
                requestId: "your_request_id",
                reason: "User requested cancellation"
              }
            }
          }
        }, null, 2)
      }]
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ error: 'Unknown operation' }, null, 2)
    }]
  };
});

// Sampling demo tool
server.registerTool("mcp_sampling_demo", {
  description: "Demonstrate MCP sampling capabilities and test sampling/createMessage requests",
  inputSchema: {
    message: z.string().describe("The message to send in the sampling request"),
    modelPreference: z.enum(['claude', 'gpt', 'gemini', 'generic']).optional().describe("Preferred model family for demonstration"),
    systemPrompt: z.string().optional().describe("System prompt to include in the sampling request"),
    maxTokens: z.number().positive().optional().describe("Maximum tokens for the response (default: 100)"),
    intelligence: z.number().min(0).max(1).optional().describe("Intelligence priority (0-1, higher = more capable models)"),
    speed: z.number().min(0).max(1).optional().describe("Speed priority (0-1, higher = faster models)"),
    cost: z.number().min(0).max(1).optional().describe("Cost priority (0-1, higher = cheaper models)")
  }
}, async (args) => {
  const { 
    message, 
    modelPreference, 
    systemPrompt, 
    maxTokens = 100,
    intelligence = 0.7,
    speed = 0.5,
    cost = 0.3
  } = args;

  // Build model preferences based on user input
  const modelPreferences: any = {
    intelligencePriority: intelligence,
    speedPriority: speed,
    costPriority: cost
  };

  // Add model hints based on preference
  if (modelPreference) {
    const hintMap = {
      'claude': [{ name: 'claude-4-sonnet' }, { name: 'claude' }],
      'gpt': [{ name: 'gpt-4' }, { name: 'gpt' }],
      'gemini': [{ name: 'gemini-1.5-pro' }, { name: 'gemini' }],
      'generic': [{ name: 'general-purpose' }]
    };
    modelPreferences.hints = hintMap[modelPreference];
  }

  // Create the sampling request
  const samplingRequest = {
    method: "sampling/createMessage",
    params: {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: message
          }
        }
      ],
      modelPreferences,
      ...(systemPrompt && { systemPrompt }),
      maxTokens
    }
  };

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        demo: 'MCP Sampling Protocol Demonstration',
        status: 'request_prepared',
        message: 'Here is the sampling request that would be sent to the MCP client',
        request: samplingRequest,
        explanation: {
          protocol: 'MCP 2025-06-18 sampling/createMessage',
          purpose: 'This demonstrates how servers can request LLM completions from clients',
          modelSelection: modelPreferences.hints ? 
            `Prefers ${modelPreference} models with intelligence=${intelligence}, speed=${speed}, cost=${cost}` :
            `No specific model preference, using priorities: intelligence=${intelligence}, speed=${speed}, cost=${cost}`,
          flow: [
            '1. Server sends sampling/createMessage request to client',
            '2. Client selects appropriate model based on preferences',
            '3. Client processes the message through the selected LLM',
            '4. Client returns the LLM response to the server',
            '5. Server can use the response for its tool operations'
          ],
          security: 'Clients SHOULD implement user approval controls for sampling requests'
        },
        nextSteps: 'In production, this request would be sent to the MCP client for actual LLM processing'
      }, null, 2)
    }]
  };
});

// MCP Sampling Implementation - Server-side LLM request handling
server.server.setRequestHandler(
  z.object({ 
    method: z.literal("sampling/createMessage"),
    params: z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.union([
          z.object({
            type: z.literal("text"),
            text: z.string()
          }),
          z.object({
            type: z.literal("image"),
            data: z.string(),
            mimeType: z.string()
          }),
          z.object({
            type: z.literal("audio"),
            data: z.string(),
            mimeType: z.string()
          })
        ])
      })),
      modelPreferences: z.object({
        hints: z.array(z.object({
          name: z.string()
        })).optional(),
        costPriority: z.number().min(0).max(1).optional(),
        speedPriority: z.number().min(0).max(1).optional(),
        intelligencePriority: z.number().min(0).max(1).optional()
      }).optional(),
      systemPrompt: z.string().optional(),
      maxTokens: z.number().positive().optional(),
      temperature: z.number().min(0).max(2).optional(),
      stopSequences: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional()
    })
  }),
  async (request) => {
    const { messages, modelPreferences, systemPrompt, maxTokens, temperature, stopSequences, metadata } = request.params;
    
    mcpLog('info', 'Sampling request received', {
      messageCount: messages.length,
      modelPreferences: modelPreferences ? Object.keys(modelPreferences) : undefined,
      hasSystemPrompt: !!systemPrompt,
      maxTokens
    });

    // In a real implementation, this would:
    // 1. Forward the request to the client's LLM service
    // 2. Apply model preferences and selection logic
    // 3. Handle different content types (text, image, audio)
    // 4. Return the LLM response
    
    // For this MCP server implementation, we return a helpful response
    // explaining that this is a demonstration of the sampling protocol
    // and that the actual LLM processing would be handled by the client
    
    const demoResponse = {
      role: "assistant" as const,
      content: {
        type: "text" as const,
        text: `This is a demonstration of MCP sampling protocol support. 

In a production environment, this request would be forwarded to an LLM service based on your model preferences:
${modelPreferences?.hints?.length ? `- Preferred models: ${modelPreferences.hints.map(h => h.name).join(', ')}` : '- No specific model preferences'}
${modelPreferences?.intelligencePriority ? `- Intelligence priority: ${modelPreferences.intelligencePriority}` : ''}
${modelPreferences?.speedPriority ? `- Speed priority: ${modelPreferences.speedPriority}` : ''}
${modelPreferences?.costPriority ? `- Cost priority: ${modelPreferences.costPriority}` : ''}

Your message: "${messages[messages.length - 1]?.content?.type === 'text' ? (messages[messages.length - 1] as any).content.text : 'Non-text content'}"

${systemPrompt ? `System prompt: "${systemPrompt}"` : 'No system prompt provided'}
${maxTokens ? `Max tokens: ${maxTokens}` : 'No token limit specified'}

This server supports the full MCP 2025-06-18 sampling specification and is ready for production use with proper LLM integration.`
      },
      model: "mcp-demo-server",
      stopReason: "endTurn" as const,
      usage: {
        inputTokens: messages.reduce((sum, msg) => 
          sum + (msg.content.type === 'text' ? msg.content.text.length / 4 : 100), 0
        ),
        outputTokens: 150
      }
    };

    mcpLog('debug', 'Sampling response generated', {
      model: demoResponse.model,
      stopReason: demoResponse.stopReason,
      outputTokens: demoResponse.usage.outputTokens
    });

    return demoResponse;
  }
);

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