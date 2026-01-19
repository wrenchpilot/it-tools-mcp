#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR="$(git config --get core.hooksPath || echo '.git/hooks')"
HOOK_DEST="$HOOK_DIR/pre-commit"
echo "Installing pre-commit hook to ensure mcp-manifest.json and server.json are in sync with package.json"
mkdir -p "$HOOK_DIR"
cat > "$HOOK_DEST" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

echo "Running pre-commit: syncing mcp-manifest.json and server.json from package.json"
if ! node scripts/sync-manifest.mjs; then
  echo "sync-manifest failed; aborting commit"
  exit 1
fi

git add mcp-manifest.json server.json || true

# Verify the synced files now contain the same version as package.json
PKG_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf8')).version)")
MCP_VERSION=$(node -e "const fs=require('fs'); console.log(fs.existsSync('mcp-manifest.json') ? (JSON.parse(fs.readFileSync('mcp-manifest.json','utf8')).version || '') : '')")
SERVER_VERSION=$(node -e "const fs=require('fs'); console.log(fs.existsSync('server.json') ? (JSON.parse(fs.readFileSync('server.json','utf8')).version || '') : '')")

if [ "$MCP_VERSION" != "$PKG_VERSION" ] || [ "$SERVER_VERSION" != "$PKG_VERSION" ]; then
  echo "ERROR: mcp-manifest.json or server.json not updated to version $PKG_VERSION"
  echo "Run 'npm run sync:manifest' and 'git add mcp-manifest.json server.json' then re-run commit"
  exit 1
fi

exit 0
HOOK

chmod +x "$HOOK_DEST"
echo "Installed pre-commit hook at $HOOK_DEST"
