#!/bin/bash
# Build and package release tarball for Homebrew
set -e

# Clean and build
npm ci
npm run build

# Ensure build/index.js exists
if [ ! -f build/index.js ]; then
  echo "Error: build/index.js not found. Build failed."
  exit 1
fi

# Package files for release
RELEASE_VERSION=$(node -p "require('./package.json').version")
RELEASE_DIR="it-tools-mcp-$RELEASE_VERSION"
TARBALL="it-tools-mcp-$RELEASE_VERSION-homebrew.tar.gz"

rm -rf "$RELEASE_DIR"
mkdir "$RELEASE_DIR"
cp -r build "$RELEASE_DIR/"
cp README.md LICENSE package.json "$RELEASE_DIR/"

# Create tarball
rm -f "$TARBALL"
tar -czf "$TARBALL" "$RELEASE_DIR"

# Output tarball path
ls -lh "$TARBALL"
echo "Release tarball ready: $TARBALL"
