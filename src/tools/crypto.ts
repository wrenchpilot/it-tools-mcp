import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerCryptoTools(server: McpServer) {
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

  // HMAC generator tool
  server.tool(
    "hmac-generator",
    "Generate HMAC (Hash-based Message Authentication Code)",
    {
      message: z.string().describe("Message to authenticate"),
      key: z.string().describe("Secret key for HMAC"),
      algorithm: z.enum(["sha1", "sha256", "sha512"]).describe("Hash algorithm").optional(),
    },
    async ({ message, key, algorithm = "sha256" }) => {
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
Algorithm: ${algorithm.toUpperCase()}`,
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

  // JWT decode tool (header and payload only)
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
          throw new Error("Invalid JWT format. JWT must have 3 parts separated by dots.");
        }

        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

        return {
          content: [
            {
              type: "text",
              text: `JWT Token Decoded:

Header:
${JSON.stringify(header, null, 2)}

Payload:
${JSON.stringify(payload, null, 2)}

Note: Signature verification is not performed. Do not trust this token without proper verification.`,
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

  // Bcrypt hash tool
  server.tool(
    "bcrypt-hash",
    "Generate bcrypt hash or verify password against hash",
    {
      password: z.string().describe("Password to hash or verify"),
      rounds: z.number().describe("Number of salt rounds (4-12, default 10)").optional(),
      hash: z.string().optional().describe("Existing hash to verify against (for verification)"),
    },
    async ({ password, rounds = 10, hash }) => {
      try {
        if (rounds < 4 || rounds > 12) {
          return {
            content: [
              {
                type: "text",
                text: "Rounds must be between 4 and 12.",
              },
            ],
          };
        }

        if (hash) {
          // Verification mode
          const isValid = await bcryptjs.compare(password, hash);
          return {
            content: [
              {
                type: "text",
                text: `Password Verification: ${isValid ? 'VALID' : 'INVALID'}

Password: ${password}
Hash: ${hash}`,
              },
            ],
          };
        } else {
          // Hash generation mode
          const salt = await bcryptjs.genSalt(rounds);
          const hashedPassword = await bcryptjs.hash(password, salt);
          
          return {
            content: [
              {
                type: "text",
                text: `Bcrypt Hash Generated:
Hash: ${hashedPassword}

Password: ${password}
Rounds: ${rounds}
Algorithm: bcrypt

This hash can be safely stored in databases and used for password verification.`,
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

  // BIP39 mnemonic generator
  server.tool(
    "bip39-generate",
    "Generate BIP39 mnemonic phrases",
    {
      wordCount: z.enum(["12", "15", "18", "21", "24"]).describe("Number of words in the mnemonic").optional(),
    },
    async ({ wordCount = "12" }) => {
      try {
        const count = parseInt(wordCount);
        
        // Generate entropy based on word count
        // 12 words = 128 bits, 15 words = 160 bits, 18 words = 192 bits, 21 words = 224 bits, 24 words = 256 bits
        const entropyBits = Math.floor((count * 11) / 33) * 32;
        const entropyBytes = entropyBits / 8;
        
        // Generate cryptographically secure random entropy
        const { randomBytes } = await import('crypto');
        const entropy = randomBytes(entropyBytes);
        
        // Generate mnemonic using proper BIP39 library
        const mnemonic = bip39.entropyToMnemonic(entropy);
        const words = mnemonic.split(' ');
        
        // Validate the generated mnemonic
        const isValid = bip39.validateMnemonic(mnemonic);
        
        return {
          content: [
            {
              type: "text",
              text: `BIP39 Mnemonic Phrase (${words.length} words):

${mnemonic}

Entropy: ${entropy.toString('hex')}
Valid: ${isValid ? 'Yes ✅' : 'No ❌'}
Entropy Bits: ${entropyBits}

⚠️  SECURITY WARNING:
- This uses cryptographically secure random generation
- Store this mnemonic securely and never share it
- This can be used to generate cryptocurrency wallet seeds
- Anyone with this mnemonic can access associated wallets`,
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

  // Password generator tool
  server.tool(
    "password-generate",
    "Generate a secure password",
    {
      length: z.number().describe("Password length").optional(),
      includeUppercase: z.boolean().describe("Include uppercase letters").optional(),
      includeLowercase: z.boolean().describe("Include lowercase letters").optional(),
      includeNumbers: z.boolean().describe("Include numbers").optional(),
      includeSymbols: z.boolean().describe("Include symbols").optional(),
    },
    async ({ length = 16, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true }) => {
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

  // Token generator tool
  server.tool(
    "token-generator",
    "Generate secure random tokens",
    {
      length: z.number().describe("Token length").optional(),
      charset: z.enum(["alphanumeric", "hex", "base64", "custom"]).describe("Character set to use").optional(),
      customChars: z.string().optional().describe("Custom characters (required if charset is 'custom')"),
    },
    async ({ length = 32, charset = "alphanumeric", customChars }) => {
      try {
        if (length < 8 || length > 256) {
          return {
            content: [
              {
                type: "text",
                text: "Length must be between 8 and 256.",
              },
            ],
          };
        }
        let chars = '';

        switch (charset) {
          case 'alphanumeric':
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            break;
          case 'hex':
            chars = '0123456789abcdef';
            break;
          case 'base64':
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            break;
          case 'custom':
            if (!customChars) {
              return {
                content: [
                  {
                    type: "text",
                    text: "Error: Custom characters required when charset is 'custom'",
                  },
                ],
              };
            }
            chars = customChars;
            break;
        }

        let token = '';
        const { randomBytes } = await import('crypto');
        const randomValues = randomBytes(length);
        
        for (let i = 0; i < length; i++) {
          token += chars.charAt(randomValues[i] % chars.length);
        }

        return {
          content: [
            {
              type: "text",
              text: `Generated Token:
${token}

Length: ${length} characters
Character set: ${charset}
${charset === 'custom' ? `Custom chars: ${customChars}` : ''}`,
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

  // OTP code generator
  server.tool(
    "otp-code-generator",
    "Generate Time-based One-Time Password (TOTP) codes",
    {
      secret: z.string().describe("Base32 encoded secret key"),
      digits: z.number().describe("Number of digits in the code").optional(),
      period: z.number().describe("Time period in seconds").optional(),
    },
    async ({ secret, digits = 6, period = 30 }) => {
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
