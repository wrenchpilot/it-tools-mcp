import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEmailNormalizer(server: McpServer) {
  server.registerTool("normalize_email", {

  inputSchema: {
      email: z.string().describe("Email address to normalize"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Normalize Email",

      readOnlyHint: false
    }
}, async ({ email }) => {
      try {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Invalid email format");
        }

        const [localPart, domain] = email.toLowerCase().split('@');
        let normalizedLocal = localPart;
        let notes = [];

        // Handle Gmail-specific rules
        if (domain === 'gmail.com' || domain === 'googlemail.com') {
          // Remove dots from Gmail addresses
          const withoutDots = normalizedLocal.replace(/\./g, '');
          if (withoutDots !== normalizedLocal) {
            notes.push(`Removed dots: ${normalizedLocal} → ${withoutDots}`);
            normalizedLocal = withoutDots;
          }

          // Remove everything after + (alias)
          const plusIndex = normalizedLocal.indexOf('+');
          if (plusIndex !== -1) {
            const withoutAlias = normalizedLocal.substring(0, plusIndex);
            notes.push(`Removed alias: ${normalizedLocal} → ${withoutAlias}`);
            normalizedLocal = withoutAlias;
          }
        }

        // Handle other common plus aliasing
        const plusIndex = normalizedLocal.indexOf('+');
        if (plusIndex !== -1 && domain !== 'gmail.com' && domain !== 'googlemail.com') {
          const withoutAlias = normalizedLocal.substring(0, plusIndex);
          notes.push(`Removed plus alias: ${normalizedLocal} → ${withoutAlias}`);
          normalizedLocal = withoutAlias;
        }

        const normalizedEmail = `${normalizedLocal}@${domain}`;
        const isChanged = normalizedEmail !== email.toLowerCase();

        return {
          content: [
            {
              type: "text",
              text: `Email Normalization:

Original: ${email}
Normalized: ${normalizedEmail}
Changed: ${isChanged ? 'Yes' : 'No'}

${notes.length > 0 ? `Transformations applied:
${notes.map(note => `• ${note}`).join('\n')}` : 'No transformations needed'}

Domain: ${domain}
Local part: ${normalizedLocal}

Note: This normalization helps identify duplicate email addresses
that would be delivered to the same inbox.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error normalizing email: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
