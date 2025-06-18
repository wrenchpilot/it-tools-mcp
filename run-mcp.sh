#!/usr/bin/env bash
# Portable script to run the IT Tools MCP server
# This script finds the project root by looking for docker-compose.yml

# Function to find project root
find_project_root() {
    local current_dir="$PWD"
    
    # Look in current directory and parent directories
    while [ "$current_dir" != "/" ]; do
        if [ -f "$current_dir/docker-compose.yml" ] && [ -f "$current_dir/package.json" ]; then
            echo "$current_dir"
            return 0
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    # If not found in path, try some common locations
    for possible_root in "$HOME" "/Volumes/Source" "/Users/$USER" "/tmp"; do
        if [ -f "$possible_root/it-tools-mcp/docker-compose.yml" ]; then
            echo "$possible_root/it-tools-mcp"
            return 0
        fi
    done
    
    return 1
}

# Find and change to project root
PROJECT_ROOT=$(find_project_root)
if [ -z "$PROJECT_ROOT" ]; then
    echo "Error: Could not find it-tools-mcp project directory" >&2
    exit 1
fi

echo "Found project at: $PROJECT_ROOT" >&2
cd "$PROJECT_ROOT"

# Run the MCP server
exec docker compose run --rm -T it-tools-mcp
