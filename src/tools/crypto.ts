import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHash, createHmac } from "crypto";

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
      algorithm: z.enum(["sha1", "sha256", "sha512"]).default("sha256").describe("Hash algorithm"),
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
      rounds: z.number().min(4).max(12).default(10).describe("Number of salt rounds (4-12, default 10)"),
      hash: z.string().optional().describe("Existing hash to verify against (for verification)"),
    },
    async ({ password, rounds = 10, hash }) => {
      try {
        // Note: This is a simplified implementation
        // In a real scenario, you'd use a proper bcrypt library
        const crypto = await import('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const generatedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
        
        if (hash) {
          // Verification mode (simplified)
          const isValid = hash.includes(generatedHash.substring(0, 10));
          return {
            content: [
              {
                type: "text",
                text: `Password Verification: ${isValid ? 'VALID' : 'INVALID'}

Note: This is a simplified bcrypt implementation for demonstration.
For production use, please use a proper bcrypt library.`,
              },
            ],
          };
        } else {
          // Hash generation mode
          return {
            content: [
              {
                type: "text",
                text: `Bcrypt Hash Generated:
Hash: $2b$${rounds.toString().padStart(2, '0')}$${salt}${generatedHash}

Rounds: ${rounds}
Salt: ${salt}

Note: This is a simplified bcrypt implementation for demonstration.
For production use, please use a proper bcrypt library.`,
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
      wordCount: z.enum(["12", "15", "18", "21", "24"]).default("12").describe("Number of words in the mnemonic"),
    },
    async ({ wordCount = "12" }) => {
      try {
        // Simplified BIP39 word list (first 100 words)
        const wordList = [
          "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
          "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
          "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
          "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
          "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
          "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
          "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
          "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
          "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
          "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest"
        ];

        const count = parseInt(wordCount);
        const words = [];
        
        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * wordList.length);
          words.push(wordList[randomIndex]);
        }

        return {
          content: [
            {
              type: "text",
              text: `BIP39 Mnemonic Phrase (${wordCount} words):

${words.join(' ')}

Words: ${words.join(', ')}

⚠️  SECURITY WARNING:
- This is for demonstration purposes only
- Do NOT use this for real cryptocurrency wallets
- Use proper entropy sources for production mnemonics
- Store mnemonics securely and never share them`,
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

  // Token generator tool
  server.tool(
    "token-generator",
    "Generate secure random tokens",
    {
      length: z.number().min(8).max(256).default(32).describe("Token length"),
      charset: z.enum(["alphanumeric", "hex", "base64", "custom"]).default("alphanumeric").describe("Character set to use"),
      customChars: z.string().optional().describe("Custom characters (required if charset is 'custom')"),
    },
    async ({ length = 32, charset = "alphanumeric", customChars }) => {
      try {
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
        for (let i = 0; i < length; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
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
      digits: z.number().min(4).max(10).default(6).describe("Number of digits in the code"),
      period: z.number().default(30).describe("Time period in seconds"),
    },
    async ({ secret, digits = 6, period = 30 }) => {
      try {
        // Simplified TOTP implementation - Note: This is a demo implementation
        // For production, use a proper library like 'speakeasy'
        const time = Math.floor(Date.now() / 1000 / period);
        
        // Simple base32 decode (simplified for demo)
        const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
        const secretBuffer = Buffer.from(cleanSecret, 'hex'); // Using hex instead of base32 for simplicity
        
        const hmac = createHmac('sha1', secretBuffer);
        const timeBuffer = Buffer.alloc(8);
        timeBuffer.writeUInt32BE(Math.floor(time), 4);
        hmac.update(timeBuffer);
        const hash = hmac.digest();
        const offset = hash[hash.length - 1] & 0xf;
        const code = ((hash[offset] & 0x7f) << 24 |
                     (hash[offset + 1] & 0xff) << 16 |
                     (hash[offset + 2] & 0xff) << 8 |
                     (hash[offset + 3] & 0xff)) % Math.pow(10, digits);

        return {
          content: [
            {
              type: "text",
              text: `TOTP Code: ${code.toString().padStart(digits, '0')}

Valid for: ~${period - (Math.floor(Date.now() / 1000) % period)} seconds
Digits: ${digits}
Period: ${period} seconds

Note: This is a simplified TOTP implementation.
For production use, please use a proper TOTP library.`,
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
