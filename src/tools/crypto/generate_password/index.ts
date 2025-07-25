import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGeneratePassword(server: McpServer) {
  server.registerTool("generate_password", {
  description: "Generate a secure password",
  inputSchema: {
      length: z.number().describe("Password length").optional(),
      includeUppercase: z.boolean().describe("Include uppercase letters").optional(),
      includeLowercase: z.boolean().describe("Include lowercase letters").optional(),
      includeNumbers: z.boolean().describe("Include numbers").optional(),
      includeSymbols: z.boolean().describe("Include symbols").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Password",
      description: "Generate a secure password",
      readOnlyHint: false
    }
}, async ({ length = 16, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true }) => {
      if (length < 4 || length > 128) {
        return {
          content: [
            {
              type: "text",
              text: "Length must be between 4 and 128.",
            },
          ],
        };
      }
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
      const { randomBytes } = await import('crypto');
      const randomValues = randomBytes(length);
      
      for (let i = 0; i < length; i++) {
        password += charset.charAt(randomValues[i] % charset.length);
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
}
