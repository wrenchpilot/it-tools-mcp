import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerConvertJsonCsv(server: McpServer) {
  server.registerTool("convert_json_to_csv", {
  description: "Convert JSON to CSV format",
  inputSchema: {
      json: z.string().describe("JSON string to convert to CSV"),
      delimiter: z.string().describe("CSV delimiter").optional(),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Json To Csv",
      description: "Convert JSON to CSV format",
      readOnlyHint: false
    }
}, async ({ json, delimiter = "," }) => {
      try {
        const Papa = (await import("papaparse")).default;
        const data = JSON.parse(json);
        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of objects");
        }
        const csv = Papa.unparse(data, { delimiter });
        return {
          content: [
            {
              type: "text",
              text: `CSV:\n${csv}\n\nConversion Summary:\nRows: ${data.length}\nDelimiter: \"${delimiter}\"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting JSON to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}
