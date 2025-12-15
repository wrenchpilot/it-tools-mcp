#!/usr/bin/env bash
set -euo pipefail

HOOK_DEST=".git/hooks/pre-commit"
echo "Installing pre-commit hook to ensure mcp-manifest.json is in sync with package.json"
cat > "$HOOK_DEST" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
echo "Running pre-commit: syncing mcp-manifest.json from package.json"
node scripts/sync-manifest.mjs || { echo "sync failed"; exit 1; }
git add mcp-manifest.json || true
exit 0
HOOK

chmod +x "$HOOK_DEST"
echo "Installed pre-commit hook at $HOOK_DEST"
