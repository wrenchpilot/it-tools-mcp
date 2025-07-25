import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerAsciiArtText(server: McpServer) {
  server.registerTool("ascii-art-text", {
  description: "Generate ASCII art text",
  inputSchema: {
      text: z.string().describe("Text to convert to ASCII art, or use 'LIST_FONTS' to get all available font names"),
      font: z.string().describe("ASCII art font style. Supports all 295+ figlet fonts. Use 'standard' if unsure.").optional(),
    }
}, async ({ text, font = "standard" }) => {
      try {
        // Generate ASCII art using figlet
        const figlet = await import('figlet');
        
        // Get list of available fonts
        const availableFonts = figlet.default.fontsSync();
        
        // Check if user wants to list all fonts
        if (text.toUpperCase() === 'LIST_FONTS') {
          const sortedFonts = availableFonts.sort();
          const popularFonts = [
            "Standard", "Big", "Small", "Slant", "3-D", "Banner", "Block", "Shadow", 
            "Larry 3D", "Doom", "Star Wars", "Gothic", "Graffiti", "Bubble", "Digital"
          ];
          
          // Filter popular fonts that are actually available
          const availablePopularFonts = popularFonts.filter(f => 
            sortedFonts.some(availableFont => availableFont === f)
          );
          
          return {
            content: [
              {
                type: "text",
                text: `Available ASCII Art Fonts (${sortedFonts.length} total):

🌟 POPULAR FONTS:
${availablePopularFonts.join(', ')}

📝 ALL AVAILABLE FONTS:
${sortedFonts.join(', ')}

💡 Usage: Use any font name above as the 'font' parameter.
Examples: 'Standard', '3-D', 'Larry 3D', 'Banner', 'Block', etc.`,
              },
            ],
          };
        }
        
        // Find the exact font match (case insensitive and flexible matching)
        let targetFont = "Standard"; // Default fallback
        const inputFont = font.toLowerCase();
        
        // Direct match
        const exactMatch = availableFonts.find(f => f.toLowerCase() === inputFont);
        if (exactMatch) {
          targetFont = exactMatch;
        } else {
          // Fuzzy match - look for fonts that contain the input as substring
          const partialMatch = availableFonts.find(f => 
            f.toLowerCase().includes(inputFont) || 
            inputFont.includes(f.toLowerCase())
          );
          if (partialMatch) {
            targetFont = partialMatch;
          }
        }

        // Generate ASCII art
        const asciiArt = figlet.default.textSync(text, {
          font: targetFont as any,
          horizontalLayout: 'default',
          verticalLayout: 'default'
        });
        
        const fontUsed = targetFont === font ? font : `${font} → ${targetFont}`;
        
        return {
          content: [
            {
              type: "text",
              text: `ASCII Art (${fontUsed}):\n\n${asciiArt}`,
            },
          ],
        };
      } catch (error) {
        // Get available fonts for error message
        try {
          const figlet = await import('figlet');
          const availableFonts = figlet.default.fontsSync();
          const popularFonts = [
            "Standard", "Big", "Small", "Slant", "3-D", "Banner", "Block", "Shadow", 
            "Larry 3D", "Doom", "Star Wars", "Gothic", "Graffiti", "Bubble", "Digital"
          ];
          
          return {
            content: [
              {
                type: "text",
                text: `Error generating ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}

Font '${font}' not found or invalid.

Popular fonts to try: ${popularFonts.join(', ')}

Total available fonts: ${availableFonts.length}
Some examples: ${availableFonts.slice(0, 10).join(', ')}...

Note: ASCII art generation works best with short text (1-10 characters).`,
              },
            ],
          };
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `Error generating ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}

Note: ASCII art generation works best with short text (1-10 characters).`,
              },
            ],
          };
        }
      }
    }
  );
}
