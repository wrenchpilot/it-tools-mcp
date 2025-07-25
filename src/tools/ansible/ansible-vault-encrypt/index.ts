import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pbkdf2Sync, randomBytes } from "crypto";

export function registerAnsibleVaultEncrypt(server: McpServer) {
  server.registerTool("ansible-vault-encrypt", {
  description: "Encrypt text using Ansible Vault format",
  inputSchema: {
      text: z.string().describe("Text to encrypt"),
      password: z.string().describe("Password for encryption"),
      vaultId: z.string().optional().describe("Vault ID for the encrypted content (optional)"),
    }
}, async ({ text, password, vaultId }) => {
      if (!text?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide text to encrypt",
            },
          ],
        };
      }

      if (!password?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide a password for encryption",
            },
          ],
        };
      }

      try {
        // Generate salt and key using PBKDF2
        const salt = randomBytes(32);
        const key = pbkdf2Sync(password, salt, 10000, 32, 'sha256');
        
        // Generate IV
        const iv = randomBytes(16);
        
        // Encrypt using AES-256-CTR
        const crypto = await import('crypto');
        const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Create HMAC for integrity check
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(salt);
        hmac.update(iv);
        hmac.update(Buffer.from(encrypted, 'hex'));
        const mac = hmac.digest();
        
        // Combine salt + iv + encrypted data + mac
        const combined = Buffer.concat([salt, iv, Buffer.from(encrypted, 'hex'), mac]);
        const b64encoded = combined.toString('base64');
        
        // Format as Ansible Vault
        const vaultHeader = vaultId 
          ? `$ANSIBLE_VAULT;1.1;AES256;${vaultId}` 
          : '$ANSIBLE_VAULT;1.1;AES256';
        
        // Split base64 into 80-character lines
        const lines = [];
        for (let i = 0; i < b64encoded.length; i += 80) {
          lines.push(b64encoded.substring(i, i + 80));
        }
        
        const result = vaultHeader + '\n' + lines.join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };

      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error encrypting text: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
