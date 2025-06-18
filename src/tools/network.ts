import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode } from "libphonenumber-js";

export function registerNetworkTools(server: McpServer) {
  // IP address tools
  server.tool(
    "ip-subnet-calculator",
    "Calculate subnet information for IPv4",
    {
      ip: z.string().describe("IPv4 address (e.g., 192.168.1.1)"),
      cidr: z.number().min(1).max(32).describe("CIDR notation (e.g., 24)"),
    },
    async ({ ip, cidr }) => {
      try {
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
      count: z.number().optional().default(1).describe("Number of ports to generate"),
      min: z.number().optional().default(1024).describe("Minimum port number"),
      max: z.number().optional().default(65535).describe("Maximum port number"),
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
      separator: z.enum([":", "-"]).default(":").describe("Separator character"),
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
            if (!/^[0-9A-Fa-f]{2}$/.test(part)) {
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

  // Phone number formatter
  server.tool(
    "phone-format",
    "Parse and format phone numbers",
    {
      phoneNumber: z.string().describe("Phone number to parse and format"),
      countryCode: z.string().optional().describe("Country code (e.g., 'US', 'GB', 'FR')"),
    },
    async ({ phoneNumber, countryCode }) => {
      try {
        // First check if it's a valid phone number
        if (!isValidPhoneNumber(phoneNumber, countryCode as any)) {
          throw new Error("Invalid phone number format");
        }
        
        // Parse the phone number
        const parsedNumber = parsePhoneNumber(phoneNumber, countryCode as any);
        
        return {
          content: [
            {
              type: "text",
              text: `Phone Number Formatting:

Original: ${phoneNumber}
Country: ${parsedNumber.country || 'Unknown'}
National: ${parsedNumber.formatNational()}
International: ${parsedNumber.formatInternational()}
E.164: ${parsedNumber.format('E.164')}
URI: ${parsedNumber.getURI()}

Details:
Type: ${parsedNumber.getType() || 'Unknown'}
Country Code: +${parsedNumber.countryCallingCode}
National Number: ${parsedNumber.nationalNumber}
Valid: ${parsedNumber.isValid()}

✅ Formatted using libphonenumber-js library for accuracy.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting phone number: ${error instanceof Error ? error.message : 'Unknown error'}

💡 Tips:
• Include country code (e.g., +1 555-123-4567)
• Use standard formats (e.g., (555) 123-4567)
• Specify country code parameter if needed
• Examples: "+1-555-123-4567", "555-123-4567" with countryCode="US"`,
            },
          ],
        };
      }
    }
  );

  // IBAN validator (using iban library)
  server.tool(
    "iban-validate",
    "Validate and parse IBAN (International Bank Account Number)",
    {
      iban: z.string().describe("IBAN to validate and parse"),
    },
    async ({ iban }) => {
      try {
        const IBAN = require('iban');
        
        // Clean the input
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();
        
        // Validate using the IBAN library
        const isValid = IBAN.isValid(cleanIban);
        
        if (isValid) {
          // Extract components
          const countryCode = cleanIban.slice(0, 2);
          const checkDigits = cleanIban.slice(2, 4);
          const bban = cleanIban.slice(4); // Basic Bank Account Number
          
          // Get country information if available
          const countryName = IBAN.countries[countryCode]?.name || 'Unknown';
          
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
}
