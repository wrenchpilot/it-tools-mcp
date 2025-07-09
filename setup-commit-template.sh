#!/bin/bash
# Setup script for commit templates and git hooks

echo "🚀 Setting up commit templates and hooks for it-tools-mcp..."

# Set up commit template
echo "📝 Configuring git commit template..."
git config commit.template .gitmessage
echo "✅ Commit template configured (use 'git commit' without -m to see template)"

# Set up git hooks (optional)
read -p "🪝 Do you want to install git hooks (commit validation + auto-versioning)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📁 Setting up git hooks directory..."
    git config core.hooksPath .githooks
    chmod +x .githooks/*
    echo "✅ Git hooks installed (commit-msg validation, auto-versioning)"
    git config core.hooksPath .githooks
    echo "✅ Git hooks configured"
    echo "   - Commit messages will be validated against conventional commit format"
    echo "   - Invalid commits will be rejected with helpful error messages"
else
    echo "⏭️  Skipping git hooks setup"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Usage:"
echo "  • Use 'git commit' (without -m) to see the template"
echo "  • Use conventional commit format: 'type: description'"
echo "  • See COMMIT_TEMPLATE_SETUP.md for detailed examples"
echo ""
echo "🔄 Version bumping:"
echo "  • feat: → minor version bump"
echo "  • fix: → patch version bump" 
echo "  • BREAKING CHANGE: → major version bump"
echo "  • Others → patch version bump"
echo ""
echo "Example commits:"
echo "  git commit -m 'feat: add new hash generator tool'"
echo "  git commit -m 'fix: resolve encoding issue in base64'"
echo "  git commit -m 'feat!: restructure API (breaking change)'"
echo ""
