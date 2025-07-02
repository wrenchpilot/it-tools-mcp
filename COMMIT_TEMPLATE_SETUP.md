# Commit Message Template Setup

This project uses [Conventional Commits](https://www.conventionalcommits.org/) format for clear, consistent commit messages.

## Version Management

**Version bumping is done manually** by updating `package.json`. The CI/CD pipeline automatically detects changes and:

- ✅ Builds and tests your code
- ✅ Creates git tags based on package.json version
- ✅ Publishes to Docker Hub and NPM when code changes
- ✅ Creates GitHub releases

## Commit Message Format

| Commit Type | Purpose | Example |
|-------------|---------|---------|
| `feat:` | New features | `feat: add new encryption tool` |
| `fix:` | Bug fixes | `fix: resolve base64 decoding issue` |
| `docs:` | Documentation | `docs: update README examples` |
| `style:` | Code formatting | `style: fix indentation` |
| `refactor:` | Code restructuring | `refactor: simplify validation logic` |
| `test:` | Tests | `test: add unit tests for hash functions` |
| `chore:` | Maintenance | `chore: update dependencies` |

## Setup Instructions

### 1. Configure Git Commit Template

```bash
# Set the commit template for this repository
git config commit.template .gitmessage

# Or set it globally for all repositories
git config --global commit.template ~/.gitmessage
```

### 2. Using the Template

When you run `git commit` (without `-m`), your configured editor will open with the template pre-filled:

```bash
git add .
git commit  # Opens editor with template
```

### 3. Quick Commits

For quick commits, you can still use the `-m` flag:

```bash
git commit -m "feat: add new JSON formatter tool"
git commit -m "fix: resolve memory leak in hash generator"
git commit -m "docs: update README with new tool examples"
```

## Commit Types

### Standard Types
- **feat**: New features (MINOR version bump)
- **fix**: Bug fixes (PATCH version bump)
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD configuration changes
- **chore**: Other maintenance tasks

### Breaking Changes (MAJOR version bump)
- **BREAKING CHANGE**: In footer of commit message
- **feat!**: Feature with breaking change
- **fix!**: Fix with breaking change
- **major**: Explicit major version bump

## Examples

### Feature Addition (Minor Version Bump)
```
feat: add password strength validator

Add new tool to validate password strength with configurable rules.
Includes checks for length, character diversity, and common patterns.

Closes #45
```

### Bug Fix (Patch Version Bump)
```
fix: resolve Unicode handling in text converter

Fixed issue where special Unicode characters were not properly
encoded/decoded in the text-to-binary converter.

Fixes #123
```

### Breaking Change (Major Version Bump)
```
feat!: restructure API response format

Change all tool responses to use consistent structure with
'result', 'error', and 'metadata' fields.

BREAKING CHANGE: API response format changed. All tools now return
objects with 'result' field instead of direct values.

Closes #67
```

## Editor Configuration

### VS Code
Install the "Conventional Commits" extension for better commit message support:
```bash
code --install-extension vivaxy.vscode-conventional-commits
```

### Git Hooks (Optional)
For stricter enforcement, you can add a commit-msg hook to validate format.

## Automated Versioning

Once set up, pushing to main/master will:
1. Parse your commit messages
2. Automatically bump the version (patch/minor/major)
3. Update CHANGELOG.md
4. Create a git tag
5. Publish to Docker Hub and NPM
6. Create a GitHub release

No manual version management needed! 🎉
