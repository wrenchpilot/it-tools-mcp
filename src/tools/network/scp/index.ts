import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client as SSHClient } from "ssh2";
import fs from "fs";
import path from "path";
import os from "os";

function resolvePrivateKey(privateKeyArg?: string): string | undefined {
  // If not provided, try default keys
  if (!privateKeyArg) {
    const home = os.homedir();
    const defaultKeys = [
      path.join(home, '.ssh', 'id_rsa'),
      path.join(home, '.ssh', 'id_ed25519'),
    ];
    for (const keyPath of defaultKeys) {
      if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
      }
    }
    return undefined;
  }
  // If it looks like a path, try to read it
  if (
    privateKeyArg.startsWith('/') ||
    privateKeyArg.startsWith('~') ||
    privateKeyArg.endsWith('.pem') ||
    privateKeyArg.endsWith('.key')
  ) {
    let keyPath = privateKeyArg;
    if (keyPath.startsWith('~')) {
      keyPath = path.join(os.homedir(), keyPath.slice(1));
    }
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    } else {
      throw new Error('Private key file not found: ' + keyPath);
    }
  }
  // Otherwise, assume it's the key content
  return privateKeyArg;
}

export function registerScp(server: McpServer) {
  server.registerTool("scp", {
  description: "Copy files to or from a remote host using SFTP (SCP-like)",
  inputSchema: {
      target: z.string().describe("Target host"),
      user: z.string().describe("Username"),
      direction: z.enum(["upload", "download"]).describe("Direction: upload (local to remote) or download (remote to local)"),
      localPath: z.string().describe("Local file path (source for upload, destination for download)"),
      remotePath: z.string().describe("Remote file path (destination for upload, source for download)"),
      privateKey: z.string().optional().describe("Private key for authentication (PEM format, optional, or path to key file)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Scp",
      description: "Copy files to or from a remote host using SFTP (SCP-like)",
      readOnlyHint: false
    }
}, async ({ target, user, direction, localPath, remotePath, privateKey }) => {
      try {
        const { Client } = await import("ssh2");
        const fs = await import("fs");
        let resolvedKey: string | undefined;
        try {
          resolvedKey = resolvePrivateKey(privateKey);
        } catch (err: any) {
          return { content: [{ type: "text", text: `SCP key error: ${err.message}` }] };
        }
        return await new Promise((resolve) => {
          const conn = new Client();
          let finished = false;
          const finish = (msg: string) => {
            if (!finished) {
              finished = true;
              try { conn.end(); } catch {}
              resolve({ content: [{ type: "text", text: msg }] });
            }
          };
          // Connection timeout (20s)
          const timeout = setTimeout(() => {
            finish(`SCP connection timed out after 20 seconds`);
          }, 20000);
          conn.on("ready", () => {
            clearTimeout(timeout);
            conn.sftp((err: any, sftp: any) => {
              if (err) {
                finish(`SFTP error: ${err.message}`);
                return;
              }
              if (direction === "upload") {
                let readStream, writeStream;
                try {
                  readStream = fs.createReadStream(localPath);
                  writeStream = sftp.createWriteStream(remotePath);
                } catch (streamErr: any) {
                  finish(`Upload failed: ${streamErr.message}`);
                  return;
                }
                writeStream.on("close", () => finish(`Upload complete: ${localPath} → ${user}@${target}:${remotePath}`));
                writeStream.on("error", (err: any) => finish(`Upload failed: ${err.message}`));
                readStream.on("error", (err: any) => finish(`Upload failed: ${err.message}`));
                readStream.pipe(writeStream);
              } else {
                let readStream, writeStream;
                try {
                  readStream = sftp.createReadStream(remotePath);
                  writeStream = fs.createWriteStream(localPath);
                } catch (streamErr: any) {
                  finish(`Download failed: ${streamErr.message}`);
                  return;
                }
                writeStream.on("close", () => finish(`Download complete: ${user}@${target}:${remotePath} → ${localPath}`));
                writeStream.on("error", (err: any) => finish(`Download failed: ${err.message}`));
                readStream.on("error", (err: any) => finish(`Download failed: ${err.message}`));
                readStream.pipe(writeStream);
              }
            });
          }).on("error", (err: any) => {
            clearTimeout(timeout);
            finish(`SCP connection error: ${err.message}`);
          });
          try {
            conn.connect({
              host: target,
              username: user,
              ...(resolvedKey ? { privateKey: resolvedKey } : {})
            });
          } catch (err: any) {
            clearTimeout(timeout);
            finish(`SCP connect threw: ${err.message}`);
          }
        });
      } catch (fatalErr: any) {
        return { content: [{ type: "text", text: `SCP fatal error: ${fatalErr.message || fatalErr}` }] };
      }
    }
  );
}
