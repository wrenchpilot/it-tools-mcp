import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client as SSHClient } from "ssh2";
import ping from "ping";
import dns from "dns";
import psList from "ps-list";
import fs from "fs";
import readLastLines from "read-last-lines";
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

export function registerSsh(server: McpServer) {
  server.tool(
    "ssh",
    "Connect to a target via SSH",
    {
      target: z.string().describe("Target host"),
      user: z.string().describe("Username"),
      command: z.string().describe("Command to run on remote host"),
      privateKey: z.string().optional().describe("Private key for authentication (PEM format, optional, or path to key file)")
    },
    async ({ target, user, command, privateKey }) => {
      return new Promise((resolve) => {
        let resolvedKey: string | undefined;
        try {
          resolvedKey = resolvePrivateKey(privateKey);
        } catch (err: any) {
          resolve({ content: [{ type: "text", text: `SSH key error: ${err.message}` }] });
          return;
        }
        const conn = new SSHClient();
        let output = "";
        conn.on("ready", () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              resolve({ content: [{ type: "text", text: `SSH error: ${err.message}` }] });
              conn.end();
              return;
            }
            stream.on("close", () => {
              conn.end();
              resolve({ content: [{ type: "text", text: output }] });
            }).on("data", (data: Buffer) => {
              output += data.toString();
            }).stderr.on("data", (data: Buffer) => {
              output += data.toString();
            });
          });
        }).on("error", (err) => {
          resolve({ content: [{ type: "text", text: `SSH connection error: ${err.message}` }] });
        }).connect({
          host: target,
          username: user,
          ...(resolvedKey ? { privateKey: resolvedKey } : {})
        });
      });
    }
  );
}
