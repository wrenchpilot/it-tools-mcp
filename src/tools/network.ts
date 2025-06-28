import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "child_process";
import { Client as SSHClient } from "ssh2";
import ping from "ping";
import dns from "dns";
import Telnet from "telnet-client";
import psList from "ps-list";
import fs from "fs";
import readLastLines from "read-last-lines";
import shellEscape from "shell-escape";
import path from "path";
import os from "os";

// Fix implicit any types for callbacks and Telnet import

// For ssh2 callbacks
type SSHExecCallback = (err: Error | undefined, stream: any) => void;
type SSHErrorCallback = (err: Error) => void;
type SSHDataCallback = (data: Buffer) => void;

// For Telnet import (telnet-client exports as an object, not a class)
const TelnetClient = (Telnet as any).Telnet || Telnet;

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

export function registerNetworkTools(server: McpServer) {
  // IP address tools
  server.tool(
    "ip-subnet-calculator",
    "Calculate subnet information for IPv4",
    {
      ip: z.string().describe("IPv4 address (e.g., 192.168.1.1)"),
      cidr: z.number().describe("CIDR notation (e.g., 24)"),
    },
    async ({ ip, cidr }) => {
      try {
        if (cidr < 1 || cidr > 32) {
          return {
            content: [
              {
                type: "text",
                text: "CIDR must be between 1 and 32.",
              },
            ],
          };
        }
        const ipParts = ip.split('.').map(part => {
          const num = parseInt(part);
          if (isNaN(num) || num < 0 || num > 255) {
            throw new Error(`Invalid IP address part: ${part}`);
          }
          return num;
        });

        if (ipParts.length !== 4) {
          throw new Error("Invalid IP address format");
        }

        // Calculate subnet mask
        const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
        const maskParts = [
          (mask >>> 24) & 0xFF,
          (mask >>> 16) & 0xFF,
          (mask >>> 8) & 0xFF,
          mask & 0xFF
        ];

        // Calculate network address
        const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const networkNum = (ipNum & mask) >>> 0;
        const networkParts = [
          (networkNum >>> 24) & 0xFF,
          (networkNum >>> 16) & 0xFF,
          (networkNum >>> 8) & 0xFF,
          networkNum & 0xFF
        ];

        // Calculate broadcast address
        const broadcastNum = (networkNum | (0xFFFFFFFF >>> cidr)) >>> 0;
        const broadcastParts = [
          (broadcastNum >>> 24) & 0xFF,
          (broadcastNum >>> 16) & 0xFF,
          (broadcastNum >>> 8) & 0xFF,
          broadcastNum & 0xFF
        ];

        // Calculate first and last usable addresses
        const firstUsableNum = networkNum + 1;
        const lastUsableNum = broadcastNum - 1;
        const firstUsableParts = [
          (firstUsableNum >>> 24) & 0xFF,
          (firstUsableNum >>> 16) & 0xFF,
          (firstUsableNum >>> 8) & 0xFF,
          firstUsableNum & 0xFF
        ];
        const lastUsableParts = [
          (lastUsableNum >>> 24) & 0xFF,
          (lastUsableNum >>> 16) & 0xFF,
          (lastUsableNum >>> 8) & 0xFF,
          lastUsableNum & 0xFF
        ];

        const totalHosts = Math.pow(2, 32 - cidr);
        const usableHosts = totalHosts - 2;

        return {
          content: [
            {
              type: "text",
              text: `IPv4 Subnet Information:

Input: ${ip}/${cidr}

Network Address: ${networkParts.join('.')}
Subnet Mask: ${maskParts.join('.')}
Broadcast Address: ${broadcastParts.join('.')}
First Usable: ${firstUsableParts.join('.')}
Last Usable: ${lastUsableParts.join('.')}

Total Addresses: ${totalHosts}
Usable Addresses: ${usableHosts}
CIDR: /${cidr}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calculating subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Enhanced IPv4 subnet calculator
  server.tool(
    "ipv4-subnet-calc",
    "Calculate IPv4 subnet information",
    {
      cidr: z.string().describe("IPv4 CIDR notation (e.g., 192.168.1.0/24)"),
    },
    async ({ cidr }) => {
      try {
        const [ip, prefixLength] = cidr.split('/');
        const prefix = parseInt(prefixLength);

        if (isNaN(prefix) || prefix < 0 || prefix > 32) {
          throw new Error("Invalid CIDR prefix length");
        }

        const ipParts = ip.split('.').map(part => {
          const num = parseInt(part);
          if (isNaN(num) || num < 0 || num > 255) {
            throw new Error(`Invalid IP address part: ${part}`);
          }
          return num;
        });

        if (ipParts.length !== 4) {
          throw new Error("Invalid IP address format");
        }

        // Calculate all subnet information
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const inverseMask = (0xFFFFFFFF >>> prefix);

        const maskOctets = [
          (mask >>> 24) & 0xFF,
          (mask >>> 16) & 0xFF,
          (mask >>> 8) & 0xFF,
          mask & 0xFF
        ];

        const wildcardOctets = [
          inverseMask >>> 24,
          (inverseMask >>> 16) & 0xFF,
          (inverseMask >>> 8) & 0xFF,
          inverseMask & 0xFF
        ];

        const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const networkNum = (ipNum & mask) >>> 0;
        const broadcastNum = (networkNum | inverseMask) >>> 0;

        const networkOctets = [
          (networkNum >>> 24) & 0xFF,
          (networkNum >>> 16) & 0xFF,
          (networkNum >>> 8) & 0xFF,
          networkNum & 0xFF
        ];

        const broadcastOctets = [
          (broadcastNum >>> 24) & 0xFF,
          (broadcastNum >>> 16) & 0xFF,
          (broadcastNum >>> 8) & 0xFF,
          broadcastNum & 0xFF
        ];

        const totalAddresses = Math.pow(2, 32 - prefix);
        const usableAddresses = Math.max(0, totalAddresses - 2);

        // Determine network class
        let networkClass = 'Unknown';
        const firstOctet = networkOctets[0];
        if (firstOctet >= 1 && firstOctet <= 126) networkClass = 'A';
        else if (firstOctet >= 128 && firstOctet <= 191) networkClass = 'B';
        else if (firstOctet >= 192 && firstOctet <= 223) networkClass = 'C';
        else if (firstOctet >= 224 && firstOctet <= 239) networkClass = 'D (Multicast)';
        else if (firstOctet >= 240 && firstOctet <= 255) networkClass = 'E (Reserved)';

        // Check if private
        const isPrivate = (firstOctet === 10) ||
          (firstOctet === 172 && networkOctets[1] >= 16 && networkOctets[1] <= 31) ||
          (firstOctet === 192 && networkOctets[1] === 168);

        return {
          content: [
            {
              type: "text",
              text: `Enhanced IPv4 Subnet Calculation:

Input CIDR: ${cidr}

Network Information:
Network Address: ${networkOctets.join('.')}
Broadcast Address: ${broadcastOctets.join('.')}
Subnet Mask: ${maskOctets.join('.')}
Wildcard Mask: ${wildcardOctets.join('.')}

Address Range:
First Host: ${networkOctets[0]}.${networkOctets[1]}.${networkOctets[2]}.${networkOctets[3] + 1}
Last Host: ${broadcastOctets[0]}.${broadcastOctets[1]}.${broadcastOctets[2]}.${broadcastOctets[3] - 1}

Capacity:
Total Addresses: ${totalAddresses.toLocaleString()}
Usable Host Addresses: ${usableAddresses.toLocaleString()}

Network Properties:
Class: ${networkClass}
Type: ${isPrivate ? 'Private' : 'Public'}
CIDR Prefix: /${prefix}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calculating IPv4 subnet: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // IPv6 ULA generator
  server.tool(
    "ipv6-ula-generator",
    "Generate IPv6 Unique Local Address (ULA) prefix",
    {
      globalId: z.string().optional().describe("Global ID (40 bits in hex, auto-generated if not provided)"),
    },
    async ({ globalId }) => {
      try {
        // Generate random 40-bit Global ID if not provided
        let gid = globalId;
        if (!gid) {
          const randomBytes = [];
          for (let i = 0; i < 5; i++) {
            randomBytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
          }
          gid = randomBytes.join('');
        }

        // Validate Global ID
        if (!/^[0-9a-fA-F]{10}$/.test(gid)) {
          throw new Error("Global ID must be exactly 10 hexadecimal characters (40 bits)");
        }

        // Format the ULA prefix
        const prefix = `fd${gid.substring(0, 2)}:${gid.substring(2, 6)}:${gid.substring(6, 10)}`;
        const fullPrefix = `${prefix}::/48`;

        // Generate some example subnets
        const subnets = [];
        for (let i = 0; i < 5; i++) {
          const subnetId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
          subnets.push(`${prefix}:${subnetId}::/64`);
        }

        return {
          content: [
            {
              type: "text",
              text: `IPv6 ULA (Unique Local Address) Generated:

ULA Prefix: ${fullPrefix}
Global ID: ${gid}

Example Subnets:
${subnets.map((subnet, i) => `${i + 1}. ${subnet}`).join('\n')}

Properties:
- Scope: Local (not routed on the internet)
- Prefix: fd00::/8 (ULA)
- Global ID: ${gid} (40 bits)
- Subnet ID: 16 bits available
- Interface ID: 64 bits available

Note: ULAs are designed for local communications within a site.
They are not expected to be routable on the global Internet.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating IPv6 ULA: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // URL parser
  server.tool(
    "url-parse",
    "Parse URL into components",
    {
      url: z.string().describe("URL to parse"),
    },
    async ({ url }) => {
      try {
        const urlObj = new URL(url);

        // Parse query parameters
        const params: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return {
          content: [
            {
              type: "text",
              text: `URL Components:

Original URL: ${url}

Protocol: ${urlObj.protocol}
Host: ${urlObj.host}
Hostname: ${urlObj.hostname}
Port: ${urlObj.port || 'default'}
Pathname: ${urlObj.pathname}
Search: ${urlObj.search}
Hash: ${urlObj.hash}
Origin: ${urlObj.origin}

Query Parameters:
${Object.keys(params).length > 0
                  ? Object.entries(params).map(([key, value]) => `  ${key}: ${value}`).join('\n')
                  : '  (none)'}

Path Segments:
${urlObj.pathname.split('/').filter(segment => segment).map((segment, i) => `  ${i + 1}. ${segment}`).join('\n') || '  (none)'}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`,
            },
          ],
        };
      }
    }
  );

  // Random port generator
  server.tool(
    "random-port",
    "Generate random port numbers",
    {
      count: z.number().describe("Number of ports to generate").optional(),
      min: z.number().describe("Minimum port number").optional(),
      max: z.number().describe("Maximum port number").optional(),
      exclude: z.array(z.number()).optional().describe("Ports to exclude"),
    },
    async ({ count = 1, min = 1024, max = 65535, exclude = [] }) => {
      try {
        const ports: number[] = [];
        const excludeSet = new Set(exclude);

        // Well-known ports to avoid by default
        const wellKnownPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
        wellKnownPorts.forEach(port => excludeSet.add(port));

        for (let i = 0; i < count; i++) {
          let port;
          let attempts = 0;
          do {
            port = Math.floor(Math.random() * (max - min + 1)) + min;
            attempts++;
            if (attempts > 1000) {
              throw new Error("Could not generate unique port after 1000 attempts");
            }
          } while (excludeSet.has(port) || ports.includes(port));

          ports.push(port);
        }

        return {
          content: [
            {
              type: "text",
              text: `Random Ports Generated:

${ports.map((port, i) => `${i + 1}. ${port}`).join('\n')}

Range: ${min} - ${max}
Excluded well-known ports: ${wellKnownPorts.join(', ')}
${exclude.length > 0 ? `Custom excluded: ${exclude.join(', ')}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating random ports: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // MAC address generator
  server.tool(
    "mac-address-generate",
    "Generate random MAC address",
    {
      prefix: z.string().optional().describe("MAC address prefix (e.g., '00:1B:44')"),
      separator: z.enum([":", "-"]).describe("Separator character").optional(),
    },
    async ({ prefix, separator = ":" }) => {
      try {
        let macParts = [];

        if (prefix) {
          // Validate and use provided prefix
          const prefixParts = prefix.split(/[:-]/);
          if (prefixParts.length > 6) {
            throw new Error("Prefix cannot have more than 6 parts");
          }

          for (const part of prefixParts) {
            if (!/^[0-9-A-Fa-f]{2}$/.test(part)) {
              throw new Error(`Invalid MAC address part: ${part}`);
            }
            macParts.push(part.toUpperCase());
          }
        }

        // Generate remaining parts
        while (macParts.length < 6) {
          const randomByte = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
          macParts.push(randomByte);
        }

        // Ensure first octet indicates locally administered unicast
        if (!prefix) {
          const firstOctet = parseInt(macParts[0], 16);
          // Set locally administered bit (bit 1) and clear multicast bit (bit 0)
          macParts[0] = ((firstOctet | 0x02) & 0xFE).toString(16).padStart(2, '0').toUpperCase();
        }

        const macAddress = macParts.join(separator);

        // Analyze the MAC address
        const firstOctet = parseInt(macParts[0], 16);
        const isMulticast = (firstOctet & 0x01) !== 0;
        const isLocallyAdministered = (firstOctet & 0x02) !== 0;

        return {
          content: [
            {
              type: "text",
              text: `Generated MAC Address: ${macAddress}

Properties:
Type: ${isMulticast ? 'Multicast' : 'Unicast'}
Administration: ${isLocallyAdministered ? 'Locally Administered' : 'Universally Administered'}
Format: ${separator === ':' ? 'Colon notation' : 'Hyphen notation'}

Binary representation:
${macParts.map(part => parseInt(part, 16).toString(2).padStart(8, '0')).join(' ')}

${prefix ? `Used prefix: ${prefix}` : 'Randomly generated'}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating MAC address: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Phone number formatter tool moved to dataFormat.ts

  // IBAN validator (using iban library)
  server.tool(
    "iban-validate",
    "Validate and parse IBAN (International Bank Account Number)",
    {
      iban: z.string().describe("IBAN to validate and parse"),
    },
    async ({ iban }) => {
      try {
        const IBAN = (await import("iban")).default;

        // Clean the input
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();

        // Validate using the IBAN library
        const isValid = IBAN.isValid(cleanIban);

        if (isValid) {
          // Extract components
          const countryCode = cleanIban.slice(0, 2);
          const checkDigits = cleanIban.slice(2, 4);
          const bban = cleanIban.slice(4); // Basic Bank Account Number

          // Get country information if available (simplified approach)
          const countryInfo = IBAN.countries[countryCode];
          const countryName = countryInfo ? 'Available' : 'Unknown';

          return {
            content: [
              {
                type: "text",
                text: `IBAN Validation Result: ✅ VALID

IBAN: ${iban}
Formatted: ${IBAN.printFormat(cleanIban)}

Components:
Country Code: ${countryCode} (${countryName})
Check Digits: ${checkDigits}
BBAN: ${bban}
Length: ${cleanIban.length} characters

Validation:
Format: ✅ Valid
Length: ✅ Correct for ${countryCode}
Checksum: ✅ Valid (MOD-97)

Electronic Format: ${cleanIban}
Print Format: ${IBAN.printFormat(cleanIban)}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `IBAN Validation Result: ❌ INVALID

IBAN: ${iban}
Cleaned: ${cleanIban}

The provided IBAN is not valid. Please check:
- Country code (first 2 characters)
- Check digits (characters 3-4)
- Bank account number format
- Overall length for the country

Common issues:
- Incorrect country code
- Invalid check digits
- Wrong length for the country
- Invalid characters in BBAN`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error validating IBAN: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // SSH Tool (using ssh2)
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

  // Ping Tool (using ping)
  server.tool(
    "ping",
    "Ping a host to check connectivity",
    {
      target: z.string().describe("Host to ping"),
      count: z.number().default(4).describe("Number of ping attempts")
    },
    async ({ target, count }) => {
      try {
        const res = await ping.promise.probe(target, { min_reply: count });
        return {
          content: [
            { type: "text", text: `Ping to ${target}:\nAlive: ${res.alive}\nTime: ${res.time} ms\nOutput: ${res.output}` }
          ]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Ping failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // nslookup Tool (using dns)
  server.tool(
    "nslookup",
    "Perform DNS lookup on a hostname or IP address",
    {
      target: z.string().describe("Hostname or IP address")
    },
    async ({ target }) => {
      return new Promise((resolve) => {
        dns.lookup(target, (err, address, family) => {
          if (err) {
            resolve({ content: [{ type: "text", text: `nslookup failed: ${err.message}` }] });
          } else {
            resolve({ content: [{ type: "text", text: `Address: ${address}\nFamily: IPv${family}` }] });
          }
        });
      });
    }
  );

  // telnet Tool (using net for raw TCP connectivity)
  server.tool(
    "telnet",
    "Test TCP connectivity to a host and port",
    {
      target: z.string().describe("Host to connect to"),
      port: z.number().describe("Port number")
    },
    async ({ target, port }) => {
      return new Promise(async (resolve) => {
        try {
          const net = (await import('net')).default;
          const socket = new net.Socket();
          let connected = false;
          let banner = '';
          socket.setTimeout(2000);
          socket.connect(port, target, () => {
            connected = true;
          });
          socket.on('data', (data: Buffer) => {
            banner += data.toString();
            // If we get a banner, close immediately
            socket.end();
          });
          socket.on('timeout', () => {
            socket.destroy();
            if (!connected) {
              resolve({ content: [{ type: "text", text: `Telnet failed: Connection timed out` }] });
            } else {
              resolve({ content: [{ type: "text", text: `Telnet to ${target}:${port} succeeded.${banner ? '\nBanner: ' + banner.trim() : ''}` }] });
            }
          });
          socket.on('error', (err: Error) => {
            resolve({ content: [{ type: "text", text: `Telnet failed: ${err.message}` }] });
          });
          socket.on('close', (hadError: boolean) => {
            if (connected) {
              resolve({ content: [{ type: "text", text: `Telnet to ${target}:${port} succeeded.${banner ? '\nBanner: ' + banner.trim() : ''}` }] });
            }
          });
        } catch (error) {
          resolve({ content: [{ type: "text", text: `Telnet failed: ${error instanceof Error ? error.message : error}` }] });
        }
      });
    }
  );

  // dig Tool (using dns.resolve)
  server.tool(
    "dig",
    "Perform DNS lookup with dig command",
    {
      target: z.string().describe("Hostname or IP address"),
      type: z.string().default("A").describe("DNS record type")
    },
    async ({ target, type }) => {
      return new Promise((resolve) => {
        dns.resolve(target, type, (err, addresses) => {
          if (err) {
            resolve({ content: [{ type: "text", text: `dig failed: ${err.message}` }] });
          } else {
            resolve({ content: [{ type: "text", text: `${type} records for ${target}:\n${JSON.stringify(addresses, null, 2)}` }] });
          }
        });
      });
    }
  );

  // ps Tool (using ps-list)
  server.tool(
    "ps",
    "List running processes",
    {},
    async () => {
      try {
        const processes = await psList();
        // Defensive: handle missing properties and filter out bad entries
        const output = processes
          .map(p => {
            const pid = p.pid ?? 'N/A';
            const name = p.name ?? 'N/A';
            return `${pid}\t${name}`;
          })
          .join("\n");
        return { content: [{ type: "text", text: output || 'No processes found.' }] };
      } catch (error) {
        // Log error for debugging
        console.error('ps error:', error);
        return { content: [{ type: "text", text: `ps failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // cat Tool (using fs)
  server.tool(
    "cat",
    "Display content of a file",
    {
      file: z.string().describe("File path")
    },
    async ({ file }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        return { content: [{ type: "text", text: data }] };
      } catch (error) {
        return { content: [{ type: "text", text: `cat failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // top Tool (using ps-list, show top 10 by CPU)
  server.tool(
    "top",
    "Display system processes (snapshot)",
    {},
    async () => {
      try {
        const processes = await psList();
        const sorted = processes.sort((a, b) => (b.cpu || 0) - (a.cpu || 0)).slice(0, 10);
        const output = sorted.map(p => `${p.pid}\t${p.name}\tCPU: ${p.cpu || 0}%\tMEM: ${p.memory || 0}`).join("\n");
        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return { content: [{ type: "text", text: `top failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // grep Tool (using grep-js)
  server.tool(
    "grep",
    "Search for patterns in files",
    {
      pattern: z.string().describe("Pattern to search for"),
      file: z.string().describe("File path")
    },
    async ({ pattern, file }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        const lines = data.split("\n");
        const matches = lines.filter(line => line.includes(pattern));
        return { content: [{ type: "text", text: matches.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text", text: `grep failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // head Tool (using fs)
  server.tool(
    "head",
    "Display the beginning of a file",
    {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    async ({ file, lines }) => {
      try {
        const data = fs.readFileSync(file, "utf8");
        const out = data.split("\n").slice(0, lines).join("\n");
        return { content: [{ type: "text", text: out }] };
      } catch (error) {
        return { content: [{ type: "text", text: `head failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // tail Tool (using read-last-lines)
  server.tool(
    "tail",
    "Display the end of a file",
    {
      file: z.string().describe("File path"),
      lines: z.number().default(10).describe("Number of lines")
    },
    async ({ file, lines }) => {
      try {
        const out = await readLastLines.read(file, lines);
        return { content: [{ type: "text", text: out }] };
      } catch (error) {
        return { content: [{ type: "text", text: `tail failed: ${error instanceof Error ? error.message : error}` }] };
      }
    }
  );

  // SCP Tool (using ssh2 SFTP)
  server.tool(
    "scp",
    "Copy files to or from a remote host using SFTP (SCP-like)",
    {
      target: z.string().describe("Target host"),
      user: z.string().describe("Username"),
      direction: z.enum(["upload", "download"]).describe("Direction: upload (local to remote) or download (remote to local)"),
      localPath: z.string().describe("Local file path (source for upload, destination for download)"),
      remotePath: z.string().describe("Remote file path (destination for upload, source for download)"),
      privateKey: z.string().optional().describe("Private key for authentication (PEM format, optional, or path to key file)")
    },
    async ({ target, user, direction, localPath, remotePath, privateKey }) => {
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
