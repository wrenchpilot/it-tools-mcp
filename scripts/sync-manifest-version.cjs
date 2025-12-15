#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const pkgPath = path.join(root, 'package.json')
const manifestPath = path.join(root, 'mcp-manifest.json')

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')) }

if (!fs.existsSync(pkgPath) || !fs.existsSync(manifestPath)) {
  console.error('package.json or mcp-manifest.json not found in working directory')
  process.exit(2)
}

const pkg = readJSON(pkgPath)
const manifest = readJSON(manifestPath)

if (manifest.version === pkg.version) {
  console.log(`mcp-manifest.json already at version ${pkg.version}`)
  process.exit(0)
}

manifest.version = pkg.version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
console.log(`Updated mcp-manifest.json -> version ${pkg.version}`)
process.exit(0)
