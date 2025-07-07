import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSqlFormat(server: McpServer) {
  server.tool(
    "sql-format",
    "Format and prettify SQL queries",
    {
      sql: z.string().describe("SQL query to format"),
      dialect: z.string().optional().describe(
        "SQL dialect to use for formatting (e.g., 'sql', 'mysql', 'postgresql', 'sqlite', 'mariadb', 'db2', 'plsql', 'n1ql', 'redshift', 'spark', 'tsql', 'trino', 'bigquery'). Default is 'sql'."
      ),
    },
    async ({ sql, dialect = "sql" }) => {
      try {
        const { format: formatSQL } = await import("sql-formatter");
        // Validate dialect and cast to correct type
        const supportedDialects = [
          "sql", "mysql", "postgresql", "sqlite", "mariadb", "db2", "plsql", "n1ql", "redshift", "spark", "tsql", "trino", "bigquery"
        ] as const;
        type Dialect = typeof supportedDialects[number];
        const language: Dialect = supportedDialects.includes(dialect as Dialect) ? (dialect as Dialect) : "sql";
        const formatted = formatSQL(sql, {
          language
        });

        return {
          content: [
            {
              type: "text",
              text: `Formatted SQL (dialect: ${language}):\n\n${formatted}\n\n✅ SQL formatted successfully\n🎯 Features: uppercase keywords, proper indentation, clean structure`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error formatting SQL: ${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 Common SQL issues:\n• Check syntax for missing semicolons\n• Ensure proper table and column names\n• Validate string quoting (single quotes for strings)\n• Check for balanced parentheses in subqueries`,
            },
          ],
        };
      }
    }
  );
}
