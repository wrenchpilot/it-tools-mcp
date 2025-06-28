# Changelog

## 3.0.14 - 2025-06-27

### Enhancements

- Refactored `telnet` tool to use Node.js `net.Socket` for true TCP connectivity (not just telnet protocol).
- Added dynamic import for ESM compatibility in telnet tool.
- Improved error handling and output for telnet tool (now fails on connection error, returns banner if present).
- SSH tool and telnet tool are now robust and ESM-compatible.
- Integration test and workflow improvements for tool robustness and CI efficiency.
- Integration test logic for telnet tool improved to fail on connection failure.

## 3.0.13 - 2025-06-27

### Updated

- GitHub Actions workflow now excludes test file changes (`tests/**`, `*.test.js`, `*.test.mjs`) from triggering a full Docker build and publish. Only actual code changes will trigger a rebuild/publish.

## 3.0.12 - 2025-06-27

### Bug Fixes

- SSH tool now uses imported `os` and `fs` modules for ESM compatibility (no `require`).
- SSH tool no longer fails with `require is not defined` in ESM environments.

## 3.0.11 - 2025-06-27

### New Features

- SSH tool now supports loading private keys from file paths (e.g., `~/.ssh/id_rsa`) and will automatically use the user's default SSH key if no key is provided.
- The SSH tool is now compatible with both PEM and OpenSSH key formats (if supported by ssh2).

### Improved

- Improved SSH tool logic for key resolution and error reporting.

## 3.0.10 - 2025-06-27

### Improvements

- Removed unused dependency: `node-fetch` from package.json.

## 3.0.9 - 2025-06-27

### Added

- 11 new network/system tools: `ps`, `top`, `cat`, `head`, `tail`, `grep`, `ping`, `nslookup`, `dig`, `telnet`, `ssh` (all implemented using npm libraries for security/portability)
- Integration tests for all new tools using JSON-RPC over stdio

### Changed

- Refactored all network/system tool names to remove `_tool` suffix
- Improved error handling and robustness in process/system tools
- Updated documentation and tool tables to reflect new tools and names
- README and Docker README now show tool count as 86

### Fixed

- Fixed markdown table formatting and category summaries in documentation
- Defensive coding for process listing on all platforms

## 3.0.8 - 2025-06-27

- Optimized math-evaluate tool to use mathjs.compile for faster and more flexible expression evaluation.

## 3.0.7 - 2025-06-27

- Math tools: preload mathjs in the background for faster first-use (except in test mode).
- Math tool test: now waits for all responses (event-driven, not fixed timeout), and matches the style of other utility tests.
- Improved test robustness and user experience for slow-loading tools.

## 3.0.6 - 2025-06-27

- Dramatically improved startup speed by moving all heavy imports (mathjs, papaparse, js-yaml, xml-formatter, sql-formatter, @iarna/toml, marked, turndown, qrcode, libphonenumber-js, iban) inside their specific tool functions. Now tools only load dependencies when needed.
- Reduced memory usage and cold start time for all deployments.
- No breaking changes to tool APIs.

## 3.0.5 - 2025-06-26

- Server version is now always in sync with package.json at runtime (no more manual version bumps in code).
- Fixed TypeScript import assertion error for JSON imports by switching to runtime fs read.

## 3.0.4 - 2025-06-26

- Fixed package.json warnings by running `npm pkg fix`.
- Cleaned up `bin` script name and normalized `repository.url` for npm publish compatibility.

## 3.0.3 - 2025-06-26

- Added automated NPM publishing to GitHub Actions workflow (`docker-publish.yml`).
- Fixed workflow syntax for NPM publish step to handle missing `NPM_TOKEN` gracefully.

## 3.0.2 - 2025-06-26

- Updated README with improved instructions and documentation.

## 3.0.1 - 2025-06-26

- Prepare for npm publish: added .npmignore, improved README, and updated package metadata.
- Added npx usage instructions.
- Improved resource usage output and fixed TypeScript errors.

## 3.0.0

- Initial public release.
