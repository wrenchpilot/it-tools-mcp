import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPortNumbers(server: McpServer) {
  server.registerTool("lookup_port_numbers", {
    description: "Look up common TCP/UDP port numbers and their services",

  inputSchema: {
      query: z.string().describe("Port number or service name to look up")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Lookup Port Numbers",

      
      readOnlyHint: true
    }
}, async ({ query }) => {
      try {
        const ports = {
          // Well-known ports (0-1023)
          "21": "FTP (File Transfer Protocol)",
          "22": "SSH (Secure Shell)",
          "23": "Telnet",
          "25": "SMTP (Simple Mail Transfer Protocol)",
          "53": "DNS (Domain Name System)",
          "80": "HTTP (Hypertext Transfer Protocol)",
          "110": "POP3 (Post Office Protocol v3)",
          "143": "IMAP (Internet Message Access Protocol)",
          "443": "HTTPS (HTTP Secure)",
          "993": "IMAPS (IMAP Secure)",
          "995": "POP3S (POP3 Secure)",
          
          // Registered ports (1024-49151)
          "1433": "Microsoft SQL Server",
          "1521": "Oracle Database",
          "3306": "MySQL",
          "3389": "RDP (Remote Desktop Protocol)",
          "5432": "PostgreSQL",
          "5672": "AMQP (Advanced Message Queuing Protocol)",
          "5984": "CouchDB",
          "6379": "Redis",
          "8080": "HTTP Alternate",
          "8443": "HTTPS Alternate",
          "9200": "Elasticsearch",
          "27017": "MongoDB",
          
          // Development ports
          "3000": "Node.js Development Server",
          "3001": "React Development Server",
          "4200": "Angular Development Server",
          "5173": "Vite Development Server",
          "8000": "Python HTTP Server",
          "8888": "Jupyter Notebook"
        };

        const isNumber = /^\d+$/.test(query);
        let results: string[] = [];

        if (isNumber) {
          // Look up by port number
          const port = query;
          if (ports[port as keyof typeof ports]) {
            results.push(`Port ${port}: ${ports[port as keyof typeof ports]}`);
          } else {
            results.push(`Port ${port}: No standard service found`);
          }
          
          // Add range information
          const portNum = parseInt(port);
          if (portNum <= 1023) {
            results.push("Range: Well-known ports (0-1023) - requires root privileges");
          } else if (portNum <= 49151) {
            results.push("Range: Registered ports (1024-49151) - assigned by IANA");
          } else {
            results.push("Range: Dynamic/Private ports (49152-65535) - available for applications");
          }
        } else {
          // Search by service name
          const searchTerm = query.toLowerCase();
          for (const [port, service] of Object.entries(ports)) {
            if (service.toLowerCase().includes(searchTerm)) {
              results.push(`Port ${port}: ${service}`);
            }
          }
          
          if (results.length === 0) {
            results.push(`No ports found matching "${query}"`);
          }
        }

        return {
          content: [{
            type: "text",
            text: `Port Number Lookup Results:

Query: "${query}"

${results.join('\n')}

Common Port Ranges:
• 0-1023: Well-known ports (system/root required)
• 1024-49151: Registered ports (IANA assigned)
• 49152-65535: Dynamic/Private ports (ephemeral)

Security Notes:
• Always check firewall rules before opening ports
• Use non-standard ports for additional security
• Monitor open ports with netstat/ss commands`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error looking up port: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
