import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash, createHmac } from "crypto";
import bcryptjs from "bcryptjs";
import * as bip39 from "bip39";
import speakeasy from "speakeasy";
import { z } from "zod";

export function registerBip39Generate(server: McpServer) {
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
}
