import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDevelopmentTools(server: McpServer) {
  // Regex tester
  server.tool(
    "regex-tester",
    "Test regular expressions against text",
    {
      pattern: z.string().describe("Regular expression pattern"),
      text: z.string().describe("Text to test against the regex"),
      flags: z.string().optional().describe("Regex flags (g, i, m, s, u, y)"),
    },
    async ({ pattern, text, flags }) => {
      try {
        const regex = new RegExp(pattern, flags);
        const matches = text.match(regex);
        const globalMatches = flags?.includes('g') ? [...text.matchAll(new RegExp(pattern, flags))] : null;
        const isMatch = regex.test(text);
        
        let result = `Regex Test Results:

Pattern: ${pattern}
Flags: ${flags || 'none'}
Text: ${text}

Match: ${isMatch ? '✅ Yes' : '❌ No'}`;

        if (matches) {
          result += `\n\nFirst Match: ${matches[0]}`;
          if (matches.length > 1) {
            result += `\nCapture Groups: ${matches.slice(1).join(', ')}`;
          }
        }

        if (globalMatches && globalMatches.length > 0) {
          result += `\n\nAll Matches (${globalMatches.length}):`;
          globalMatches.forEach((match, index) => {
            result += `\n${index + 1}. "${match[0]}" at position ${match.index}`;
            if (match.length > 1) {
              result += ` (groups: ${match.slice(1).join(', ')})`;
            }
          });
        }

        result += `\n\nCommon Regex Patterns:
• Email: ^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$
• Phone: ^\\+?[1-9]\\d{1,14}$
• URL: ^https?:\\/\\/.+
• IPv4: ^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$
• Date (YYYY-MM-DD): ^\\d{4}-\\d{2}-\\d{2}$`;

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error testing regex: ${error instanceof Error ? error.message : 'Unknown error'}

Common regex flags:
• g - Global (find all matches)
• i - Case insensitive
• m - Multiline
• s - Dot matches newline
• u - Unicode
• y - Sticky`,
            },
          ],
        };
      }
    }
  );

  // Crontab generator
  server.tool(
    "crontab-generate",
    "Generate crontab expressions",
    {
      minute: z.string().describe("Minute (0-59, *, */n, n-m)").optional(),
      hour: z.string().describe("Hour (0-23, *, */n, n-m)").optional(),
      dayOfMonth: z.string().describe("Day of month (1-31, *, */n, n-m)").optional(),
      month: z.string().describe("Month (1-12, *, */n, n-m)").optional(),
      dayOfWeek: z.string().describe("Day of week (0-7, *, */n, n-m)").optional(),
    },
    async ({ minute = "*", hour = "*", dayOfMonth = "*", month = "*", dayOfWeek = "*" }) => {
      try {
        const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        
        // Generate human readable description
        let description = "Runs ";
        
        // Minute description
        if (minute === "*") {
          description += "every minute";
        } else if (minute.startsWith("*/")) {
          description += `every ${minute.slice(2)} minutes`;
        } else if (minute.includes("-")) {
          description += `at minutes ${minute}`;
        } else {
          description += `at minute ${minute}`;
        }
        
        // Hour description
        if (hour !== "*") {
          if (hour.startsWith("*/")) {
            description += ` of every ${hour.slice(2)} hours`;
          } else if (hour.includes("-")) {
            description += ` during hours ${hour}`;
          } else {
            description += ` at ${hour}:00`;
          }
        }
        
        // Day of month description
        if (dayOfMonth !== "*") {
          if (dayOfMonth.startsWith("*/")) {
            description += ` every ${dayOfMonth.slice(2)} days`;
          } else {
            description += ` on day ${dayOfMonth} of the month`;
          }
        }
        
        // Month description
        if (month !== "*") {
          const monthNames = ["", "January", "February", "March", "April", "May", "June",
                             "July", "August", "September", "October", "November", "December"];
          if (month.includes(",")) {
            const months = month.split(",").map(m => monthNames[parseInt(m)] || m).join(", ");
            description += ` in ${months}`;
          } else {
            description += ` in ${monthNames[parseInt(month)] || month}`;
          }
        }
        
        // Day of week description
        if (dayOfWeek !== "*") {
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          if (dayOfWeek.includes(",")) {
            const days = dayOfWeek.split(",").map(d => dayNames[parseInt(d)] || d).join(", ");
            description += ` on ${days}`;
          } else {
            description += ` on ${dayNames[parseInt(dayOfWeek)] || dayOfWeek}`;
          }
        }

        // Generate next few run times (simplified calculation)
        const nextRuns = [];
        const now = new Date();
        
        // This is a simplified calculation - a real cron parser would be more accurate
        for (let i = 0; i < 5; i++) {
          const nextRun = new Date(now.getTime() + (i + 1) * 60 * 1000); // Simplified: add minutes
          nextRuns.push(nextRun.toISOString().replace('T', ' ').slice(0, 19));
        }

        return {
          content: [
            {
              type: "text",
              text: `Crontab Expression Generated:

Expression: ${cronExpression}
Description: ${description}

Fields:
┌─────────── minute (0-59)
│ ┌───────── hour (0-23)
│ │ ┌─────── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌─── day of week (0-6, Sunday = 0)
│ │ │ │ │
${minute.padEnd(2)} ${hour.padEnd(2)} ${dayOfMonth.padEnd(2)} ${month.padEnd(2)} ${dayOfWeek}

Common Examples:
• 0 9 * * *        - Every day at 9:00 AM
• 0 9 * * 1-5      - Weekdays at 9:00 AM
• 0 */6 * * *      - Every 6 hours
• 0 9 1 * *        - First day of every month at 9:00 AM
• 30 23 * * 0      - Every Sunday at 11:30 PM

Special Characters:
• * - Any value
• , - List separator (1,3,5)
• - - Range (1-5)
• / - Step values (*/5)

Next estimated runs (simplified):
${nextRuns.map((run, i) => `${i + 1}. ${run}`).join('\n')}

Note: Use 'crontab -e' to edit your crontab file.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating crontab: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // List converter
  server.tool(
    "list-converter",
    "Convert between different list formats (comma-separated, line-separated, etc.)",
    {
      list: z.string().describe("Input list to convert"),
      inputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe"]).describe("Input format"),
      outputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe", "json", "quoted"]).describe("Output format"),
      trim: z.boolean().describe("Trim whitespace from items").optional(),
    },
    async ({ list, inputFormat, outputFormat, trim = true }) => {
      try {
        const separators = {
          comma: ',',
          semicolon: ';',
          newline: '\n',
          space: ' ',
          pipe: '|'
        };

        // Parse input list
        const inputSeparator = separators[inputFormat];
        let items = list.split(inputSeparator);
        
        if (trim) {
          items = items.map(item => item.trim()).filter(item => item.length > 0);
        }

        // Convert to output format
        let result = '';
        
        switch (outputFormat) {
          case 'json':
            result = JSON.stringify(items, null, 2);
            break;
          case 'quoted':
            result = items.map(item => `"${item.replace(/"/g, '\\"')}"`).join(', ');
            break;
          default:
            const outputSeparator = separators[outputFormat];
            result = items.join(outputSeparator);
            break;
        }

        return {
          content: [
            {
              type: "text",
              text: `Converted list:
${result}

Items count: ${items.length}
Input format: ${inputFormat}
Output format: ${outputFormat}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting list: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
