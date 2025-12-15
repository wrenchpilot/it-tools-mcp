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
node scripts/sync-manifest.mjs || { echo "sync failed"; exit 1; }
git add mcp-manifest.json server.json || true
exit 0
HOOK

chmod +x "$HOOK_DEST"
echo "Installed pre-commit hook at $HOOK_DEST"
