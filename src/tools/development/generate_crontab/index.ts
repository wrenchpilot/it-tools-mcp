import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CronExpressionParser } from 'cron-parser';

export function registerGenerateCrontab(server: McpServer) {
  server.registerTool("generate_crontab", {

  inputSchema: {
      minute: z.string().describe("Minute (0-59, *, */n, n-m)").optional(),
      hour: z.string().describe("Hour (0-23, *, */n, n-m)").optional(),
      dayOfMonth: z.string().describe("Day of month (1-31, *, */n, n-m)").optional(),
      month: z.string().describe("Month (1-12, *, */n, n-m)").optional(),
      dayOfWeek: z.string().describe("Day of week (0-7, *, */n, n-m)").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Crontab",

      readOnlyHint: false
    }
}, async ({ minute = "*", hour = "*", dayOfMonth = "*", month = "*", dayOfWeek = "*" }) => {
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

        // Generate next few run times using proper cron parser
        const nextRuns = [];
        
        try {
          const interval = CronExpressionParser.parse(cronExpression);
          for (let i = 0; i < 5; i++) {
            const nextRun = interval.next();
            nextRuns.push(nextRun.toDate().toISOString().replace('T', ' ').slice(0, 19));
          }
        } catch (cronError) {
          // Fall back to basic time intervals if cron parsing fails
          const now = new Date();
          for (let i = 0; i < 5; i++) {
            const nextRun = new Date(now.getTime() + (i + 1) * 60 * 1000);
            nextRuns.push(nextRun.toISOString().replace('T', ' ').slice(0, 19));
          }
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
}
