import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerOtpCodeGenerator(server: McpServer) {
  server.registerTool("otp-code-generator", {
  description: "Generate Time-based One-Time Password (TOTP) codes",
  inputSchema: {
      secret: z.string().describe("Base32 encoded secret key"),
      digits: z.number().describe("Number of digits in the code").optional(),
      period: z.number().describe("Time period in seconds").optional(),
    }
}, async ({ secret, digits = 6, period = 30 }) => {
      try {
        if (digits < 4 || digits > 10) {
          return {
            content: [
              {
                type: "text",
                text: "Digits must be between 4 and 10.",
              },
            ],
          };
        }

        // Generate TOTP code using proper speakeasy library
        const token = speakeasy.totp({
          secret: secret,
          encoding: 'base32',
          digits: digits,
          step: period
        });

        // Calculate remaining time for this token
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = period - (now % period);

        // Verify the token is valid (for demonstration)
        const verified = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: token,
          step: period,
          window: 1
        });

        return {
          content: [
            {
              type: "text",
              text: `TOTP Code: ${token}

Valid for: ${timeRemaining} seconds
Digits: ${digits}
Period: ${period} seconds
Secret: ${secret}
Verified: ${verified ? 'Yes ✅' : 'No ❌'}

This code can be used for two-factor authentication.
The token changes every ${period} seconds.`,
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
}
