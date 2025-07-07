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

export function registerIbanValidate(server: McpServer) {
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
}
