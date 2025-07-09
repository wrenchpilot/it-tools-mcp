#!/bin/bash

# Test script for Docker Hub setup validation
set -e

echo "🚀 Testing IT Tools MCP Server Docker Setup..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Docker is available
echo "1️⃣  Checking Docker availability..."
if command -v docker &>/dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Test 2: Build local image
echo
echo "2️⃣  Building local Docker image..."
if docker build -t wrenchpilot/it-tools-mcp:test .; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Test 3: Test basic functionality
echo
echo "3️⃣  Testing basic MCP functionality..."
RAW_OUTPUT=$(docker run -i --rm -e NODE_ENV=test wrenchpilot/it-tools-mcp:test 2>/dev/null <<EOF
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
EOF
)

if echo "$RAW_OUTPUT" | grep -q '"tools"'; then
    echo -e "${GREEN}✅ MCP server responds correctly${NC}"
else
    echo -e "${RED}❌ MCP server test failed${NC}"
    echo "Output: $RAW_OUTPUT"
    exit 1
fi

# Test 4: Test specific tool
echo
echo "4️⃣  Testing UUID generation tool..."
UUID_OUTPUT=$(echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"uuid-generate","arguments":{}}}' | docker run -i --rm -e NODE_ENV=test wrenchpilot/it-tools-mcp:test 2>/dev/null || echo "FAILED")

# Check for UUID pattern (8-4-4-4-12 hex digits)
if [[ "$UUID_OUTPUT" =~ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} ]]; then
    echo -e "${GREEN}✅ UUID generation works${NC}"
else
    echo -e "${RED}❌ UUID generation failed${NC}"
    echo "Output: $UUID_OUTPUT"
    exit 1
fi

# Test 5: Test Base64 encoding
echo
echo "5️⃣  Testing Base64 encoding..."
B64_OUTPUT=$(echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"base64-encode","arguments":{"text":"Hello Docker!"}}}' | docker run -i --rm -e NODE_ENV=test wrenchpilot/it-tools-mcp:test 2>/dev/null || echo "FAILED")

if [[ "$B64_OUTPUT" == *"SGVsbG8gRG9ja2VyIQ=="* ]]; then
    echo -e "${GREEN}✅ Base64 encoding works${NC}"
else
    echo -e "${RED}❌ Base64 encoding failed${NC}"
    echo "Output: $B64_OUTPUT"
    exit 1
fi

# Cleanup
echo
echo "6️⃣  Cleaning up test image..."
docker rmi wrenchpilot/it-tools-mcp:test >/dev/null 2>&1 || true

echo
echo -e "${GREEN}🎉 All tests passed! Your Docker setup is ready for Docker Hub.${NC}"
echo
echo "Next steps:"
echo "1. Set up GitHub secrets (DOCKER_USERNAME and DOCKER_PASSWORD)"
echo "2. Push to main branch or create a version tag"
echo "3. Monitor GitHub Actions for the build"
echo "4. Check Docker Hub for your published image"
echo
echo "For detailed instructions, see: DOCKER_HUB_SETUP.md"
