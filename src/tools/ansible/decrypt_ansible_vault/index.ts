import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pbkdf2Sync } from "crypto";

export function registerDecryptAnsibleVault(server: McpServer) {
  server.registerTool("decrypt_ansible_vault", {
  description: "Decrypt Ansible Vault encrypted text",

  inputSchema: {
      encryptedText: z.string().describe("Ansible Vault encrypted text to decrypt"),
      password: z.string().describe("Password for decryption"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Decrypt Ansible Vault",

      
      readOnlyHint: false
    }
}, async ({ encryptedText, password }) => {
      if (!encryptedText?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide encrypted text to decrypt",
            },
          ],
        };
      }

      if (!password?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide a password for decryption",
            },
          ],
        };
      }

      try {
        // Parse Ansible Vault format
        const lines = encryptedText.trim().split('\n');
        
        if (!lines[0].startsWith('$ANSIBLE_VAULT;')) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid Ansible Vault format: missing header",
              },
            ],
          };
        }

        // Extract vault header info
        const headerParts = lines[0].split(';');
        if (headerParts.length < 3) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid Ansible Vault format: malformed header",
              },
            ],
          };
        }

        const version = headerParts[1];
        const cipher = headerParts[2];
        const vaultId = headerParts.length > 3 ? headerParts[3] : null;

        if (version !== '1.1' && version !== '1.2') {
          return {
            content: [
              {
                type: "text",
                text: `Unsupported Ansible Vault version: ${version}`,
              },
            ],
          };
        }

        if (cipher !== 'AES256') {
          return {
            content: [
              {
                type: "text",
                text: `Unsupported cipher: ${cipher}`,
              },
            ],
          };
        }

        // Combine data lines and decode base64
        const dataLines = lines.slice(1).join('');
        const combined = Buffer.from(dataLines, 'base64');
        
        if (combined.length < 80) { // 32 (salt) + 16 (iv) + 32 (mac) = 80 minimum
          return {
            content: [
              {
                type: "text",
                text: "Invalid Ansible Vault format: insufficient data",
              },
            ],
          };
        }

        // Extract components
        const salt = combined.subarray(0, 32);
        const iv = combined.subarray(32, 48);
        const encryptedData = combined.subarray(48, -32);
        const mac = combined.subarray(-32);
        
        // Derive key using PBKDF2
        const key = pbkdf2Sync(password, salt, 10000, 32, 'sha256');
        
        // Verify HMAC
        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(salt);
        hmac.update(iv);
        hmac.update(encryptedData);
        const calculatedMac = hmac.digest();
        
        if (!calculatedMac.equals(mac)) {
          return {
            content: [
              {
                type: "text",
                text: "Decryption failed: invalid password or corrupted data",
              },
            ],
          };
        }
        
        // Decrypt using AES-256-CTR
        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
        let decrypted = decipher.update(encryptedData, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        
        return {
          content: [
            {
              type: "text",
              text: decrypted,
            },
          ],
        };

      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error decrypting text: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
