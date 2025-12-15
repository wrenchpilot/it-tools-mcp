#!/usr/bin/env node
// Remove `description: "..."` lines from annotation objects across src/tools
// Usage: node scripts/remove-description-from-annotations.js

import fs from 'fs';
import path from 'path';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.ts')) processFile(p);
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove lines that are a property named description: "...",
  // but avoid removing .describe("...") occurrences.
  // Only remove lines where the token 'description' is followed by ':' (a property), not '.describe('
  content = content.replace(/^[ \t]*description\s*:\s*(?:`[^`]*`|"[^"]*"|'[^']*')\s*,?\s*$/mg, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Edited', filePath);
  }
}

const toolsDir = path.resolve(process.cwd(), 'src', 'tools');
if (!fs.existsSync(toolsDir)) {
  console.error('tools directory not found:', toolsDir);
  process.exit(1);
}

walk(toolsDir);
console.log('Done');
