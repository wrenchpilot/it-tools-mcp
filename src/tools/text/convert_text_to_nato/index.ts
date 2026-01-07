import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTextToNatoAlphabet(server: McpServer) {
  server.registerTool("convert_text_to_nato", {
    description: "Convert text to NATO phonetic alphabet",

  inputSchema: {
      text: z.string().describe("Text to convert to NATO phonetic alphabet"),
      language: z.string().optional().default("International").describe("Language/country variant (International, France, Germany, etc.)")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Convert Text To Nato",

      
      readOnlyHint: false
    }
}, async ({ text, language }) => {
      // NATO phonetic alphabet mappings
      const natoAlphabets: Record<string, Record<string, string>> = {
        International: {
          'A': 'ALFA', 'B': 'BRAVO', 'C': 'CHARLIE', 'D': 'DELTA', 'E': 'ECHO', 'F': 'FOXTROT',
          'G': 'GOLF', 'H': 'HOTEL', 'I': 'INDIA', 'J': 'JULIET', 'K': 'KILO', 'L': 'LIMA',
          'M': 'MIKE', 'N': 'NOVEMBER', 'O': 'OSCAR', 'P': 'PAPA', 'Q': 'QUEBEC', 'R': 'ROMEO',
          'S': 'SIERRA', 'T': 'TANGO', 'U': 'UNIFORM', 'V': 'VICTOR', 'W': 'WHISKEY', 'X': 'XRAY',
          'Y': 'YANKEE', 'Z': 'ZULU'
        },
        France: {
          'A': 'ANATOLE', 'B': 'BERTHE', 'C': 'CELESTIN', 'D': 'DESIRE', 'E': 'EUGENE', 'F': 'FRANCOIS',
          'G': 'GASTON', 'H': 'HENRI', 'I': 'IRMA', 'J': 'JOSEPH', 'K': 'KLEBER', 'L': 'LOUIS',
          'M': 'MARCEL', 'N': 'NICOLAS', 'O': 'OSCAR', 'P': 'PIERRE', 'Q': 'QUINTAL', 'R': 'RAOUL',
          'S': 'SUZANNE', 'T': 'THERESE', 'U': 'URSULE', 'V': 'VICTOR', 'W': 'WILLIAM', 'X': 'XAVIER',
          'Y': 'YVONNE', 'Z': 'ZOE'
        },
        Germany: {
          'A': 'ANTON', 'B': 'BERTA', 'C': 'CÄSAR', 'D': 'DORA', 'E': 'EMIL', 'F': 'FRIEDRICH',
          'G': 'GUSTAV', 'H': 'HEINRICH', 'I': 'IDA', 'J': 'JULIUS', 'K': 'KAUFMANN', 'L': 'LUDWIG',
          'M': 'MARTHA', 'N': 'NORDPOL', 'O': 'OTTO', 'P': 'PAULA', 'Q': 'QUELLE', 'R': 'RICHARD',
          'S': 'SIEGFRIED', 'T': 'THEODOR', 'U': 'ULRICH', 'V': 'VIKTOR', 'W': 'WILHELM', 'X': 'XANTHIPPE',
          'Y': 'YPSILON', 'Z': 'ZACHARIAS'
        }
      };

      const selectedAlphabet = natoAlphabets[language] || natoAlphabets.International;
      
      const result = text.toUpperCase().split('').map(char => {
        if (selectedAlphabet[char]) {
          return selectedAlphabet[char];
        } else if (/[0-9]/.test(char)) {
          return `(digit ${char})`;
        } else if (char === ' ') {
          return '(SPACE)';
        } else if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
          return `(punctuation ${char})`;
        } else {
          return `(${char})`;
        }
      }).join(' ');

      return {
        content: [{
          type: "text",
          text: `NATO Phonetic Alphabet (${language}):
${result}`
        }]
      };
    }
  );
}
