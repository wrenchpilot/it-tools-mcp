import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CronExpressionParser } from 'cron-parser';

export function registerListConverter(server: McpServer) {
  server.registerTool("list-converter", {
  description: "Convert between different list formats (comma-separated, line-separated, etc.)",
  inputSchema: {
      list: z.string().describe("Input list to convert"),
      inputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe"]).describe("Input format"),
      outputFormat: z.enum(["comma", "semicolon", "newline", "space", "pipe", "json", "quoted"]).describe("Output format"),
      trim: z.boolean().describe("Trim whitespace from items").optional(),
    }
}, async ({ list, inputFormat, outputFormat, trim = true }) => {
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
