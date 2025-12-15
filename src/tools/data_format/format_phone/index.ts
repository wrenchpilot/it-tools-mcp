import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFormatPhone(server: McpServer) {
  server.registerTool("format_phone", {

  inputSchema: {
      phoneNumber: z.string().describe("Phone number to parse and format"),
      countryCode: z.string().optional().describe("Country code (e.g., 'US', 'GB', 'FR')"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Format Phone",

      readOnlyHint: false
    }
}, async ({ phoneNumber, countryCode }) => {
      try {
        const { isValidPhoneNumber, parsePhoneNumber } = await import("libphonenumber-js");

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
              text: `Phone Number Formatting:\n\nOriginal: ${phoneNumber}\nCountry: ${parsedNumber.country || 'Unknown'}\nNational: ${parsedNumber.formatNational()}\nInternational: ${parsedNumber.formatInternational()}\nE.164: ${parsedNumber.format('E.164')}\nURI: ${parsedNumber.getURI()}\n\nDetails:\nType: ${parsedNumber.getType() || 'Unknown'}\nCountry Code: +${parsedNumber.countryCallingCode}\nNational Number: ${parsedNumber.nationalNumber}\nValid: ${parsedNumber.isValid()}\n\n✅ Formatted using libphonenumber-js library for accuracy.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting phone number: ${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 Tips:\n• Include country code (e.g., +1 555-123-4567)\n• Use standard formats (e.g., (555) 123-4567)\n• Specify country code parameter if needed\n• Examples: "+1-555-123-4567", "555-123-4567" with countryCode="US"`,
            },
          ],
        };
      }
    }
  );
}
