import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Buffer } from 'buffer';

export function registerIdentifyFileType(server: McpServer) {
  server.registerTool("identify_file_type", {
  description: "Identify file type based on magic numbers/file signatures",
  inputSchema: {
      data: z.string().describe("Hex data or base64 data of file header"),
      format: z.enum(["hex", "base64"]).describe("Format of the input data")
    },
    // VS Code compliance annotations
    annotations: {
      title: "Identify File Type",
      description: "Identify file type based on magic numbers/file signatures",
      readOnlyHint: false
    }
}, async ({ data, format }) => {
      try {
        let buffer: Buffer;
        
        if (format === "hex") {
          const cleanHex = data.replace(/\s/g, '');
          buffer = Buffer.from(cleanHex, 'hex');
        } else {
          buffer = Buffer.from(data, 'base64');
        }

        // Magic number signatures
        const signatures = [
          { pattern: [0xFF, 0xD8, 0xFF], type: "JPEG Image", extension: ".jpg" },
          { pattern: [0x89, 0x50, 0x4E, 0x47], type: "PNG Image", extension: ".png" },
          { pattern: [0x47, 0x49, 0x46, 0x38], type: "GIF Image", extension: ".gif" },
          { pattern: [0x50, 0x4B, 0x03, 0x04], type: "ZIP Archive", extension: ".zip" },
          { pattern: [0x50, 0x4B, 0x05, 0x06], type: "ZIP Archive (empty)", extension: ".zip" },
          { pattern: [0x50, 0x4B, 0x07, 0x08], type: "ZIP Archive (spanned)", extension: ".zip" },
          { pattern: [0x25, 0x50, 0x44, 0x46], type: "PDF Document", extension: ".pdf" },
          { pattern: [0x52, 0x61, 0x72, 0x21], type: "RAR Archive", extension: ".rar" },
          { pattern: [0x7F, 0x45, 0x4C, 0x46], type: "ELF Executable", extension: "" },
          { pattern: [0x4D, 0x5A], type: "Windows Executable", extension: ".exe" },
          { pattern: [0xCA, 0xFE, 0xBA, 0xBE], type: "Java Class File", extension: ".class" },
          { pattern: [0x1F, 0x8B], type: "GZIP Archive", extension: ".gz" },
          { pattern: [0x42, 0x5A, 0x68], type: "BZIP2 Archive", extension: ".bz2" },
          { pattern: [0x37, 0x7A, 0xBC, 0xAF], type: "7-Zip Archive", extension: ".7z" },
          { pattern: [0x52, 0x49, 0x46, 0x46], type: "RIFF Container (WAV/AVI)", extension: ".wav/.avi" },
          { pattern: [0x49, 0x44, 0x33], type: "MP3 Audio", extension: ".mp3" },
          { pattern: [0x66, 0x74, 0x79, 0x70], type: "MP4 Video", extension: ".mp4", offset: 4 },
        ];

        let detectedType = "Unknown";
        let extension = "";
        let matchDetails = "";

        for (const sig of signatures) {
          const offset = sig.offset || 0;
          if (buffer.length >= offset + sig.pattern.length) {
            let matches = true;
            for (let i = 0; i < sig.pattern.length; i++) {
              if (buffer[offset + i] !== sig.pattern[i]) {
                matches = false;
                break;
              }
            }
            if (matches) {
              detectedType = sig.type;
              extension = sig.extension;
              matchDetails = `Matched at offset ${offset}: ${sig.pattern.map(b => b.toString(16).padStart(2, '0')).join(' ')}`;
              break;
            }
          }
        }

        const hexDump = buffer.slice(0, Math.min(32, buffer.length))
          .toString('hex')
          .toUpperCase()
          .replace(/.{2}/g, '$& ')
          .trim();

        return {
          content: [{
            type: "text",
            text: `File Type Identification Results:

Detected Type: ${detectedType}
Extension: ${extension || "N/A"}
Data Size: ${buffer.length} bytes

Hex Dump (first 32 bytes):
${hexDump}

${matchDetails ? `Match Details: ${matchDetails}` : "No signature match found"}

Note: This is based on magic number detection. Some files may have multiple valid interpretations.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error identifying file type: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
