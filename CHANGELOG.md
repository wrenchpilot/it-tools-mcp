# Changelog

## [3.7.2] - 2025-07-25

### Fixed - Duplicate Tool Registration

- **🔧 Resolved Duplicate Tool Registration**: Fixed duplicate tool registration issue
  - Removed duplicate `convert_to_camelcase/` folder that was conflicting with `convert_text_to_camelcase/`
  - Eliminated all "Failed to load tool" and "Tool already registered" errors during server startup
  - Ensured clean tool loading with no registration conflicts

### Verified - Clean Tool Loading

- **✅ All Tools Load Successfully**: Confirmed all 115+ tools load without conflicts or duplicate registrations
- **🔍 No Remaining Kebab-case**: Verified complete elimination of all kebab-case folder names
- **📦 Build Verification**: TypeScript compilation successful with clean tool registration

## [3.7.1] - 2025-07-25

### Fixed - Complete Tool Naming Compliance

- **🔧 Tool Naming Convention Compliance**: Completed comprehensive migration to snake_case naming
  - **All Tool Names**: Fixed remaining kebab-case tool names in registerTool calls
    - `ansible-inventory-generator` → `generate_ansible_inventory`
    - `ansible-inventory-parser` → `parse_ansible_inventory`
    - `ipv4-subnet-calc` → `calculate_ipv4_subnet`
    - `ip-range-to-cidr` → `convert_ip_range_to_cidr`
    - `cidr-to-ip-range` → `convert_cidr_to_ip_range`
    - `random-port` → `generate_random_port`
    - `iban-validate` → `validate_iban`
    - `ip-subnet-calculator` → `calculate_ip_subnet`
    - `ipv6-subnet-calculator` → `calculate_ipv6_subnet`
    - `url-parse` → `parse_url`
    - `mac-address-generate` → `generate_mac_address`
    - `ipv6-ula-generator` → `generate_ipv6_ula`
    - `unix-timestamp-converter` → `convert_unix_timestamp`
    - `json-format` → `format_json`
    - `json-minify` → `minify_json`
    - `docker-compose-validator` → `validate_docker_compose`
    - `base64-decode` → `decode_base64`
    - `ulid-generate` → `generate_ulid`
    - `ascii-art-text` → `generate_ascii_art`
    - `text-camelcase` → `convert_to_camelcase`

  - **Folder Structure**: Renamed all remaining kebab-case folders to match snake_case tool names
  - **Duplicate Categories**: Resolved duplicate folder issues (dataFormat/data_format, idGenerators/id_generators)
  - **Documentation**: Updated README.md and CHANGELOG.md to reflect compliant tool names
  - **Build Verification**: Confirmed TypeScript compilation successful with all naming changes

### Changed - Documentation Updates

- **📚 README.md**: Updated all tool names in documentation table to match snake_case convention
- **📝 CHANGELOG.md**: Added comprehensive record of all tool naming changes
- **🔍 Package.json**: Corrected category names to eliminate duplicates

## [3.7.0] - 2025-07-25

### Added - VS Code MCP Compliance Implementation

- **✅ Full VS Code MCP Compliance**: Implemented all 9 VS Code MCP requirements for gallery readiness
  - **Tool Annotations**: Added comprehensive VS Code compliance annotations to all 115+ tools
  - **Resources**: Implemented MCP resources for system logs, tool documentation, and workspace configuration
  - **Prompts**: Added guided workflow prompts with completable arguments for IT tasks and security analysis
  - **Sampling Support**: Declared sampling capability in server configuration
  - **Workspace Roots**: Implemented listChanged capability for workspace root management
  - **Development Mode**: Enhanced development mode with detailed logging and monitoring
  - **VS Code Gallery Metadata**: Updated package.json with comprehensive MCP metadata section

### Changed - Tool Naming Convention Overhaul

- **🔧 Complete Tool Naming Convention Update**: Migrated from kebab-case to snake_case for consistency
  - **Folder Structure**: Renamed all tool folders to match actual tool names (e.g., `bip39_generate` → `generate_bip39`)
  - **Tool Names**: Updated all 115+ tools to use consistent snake_case naming
  - **Import Paths**: Fixed all server imports to match new folder structure
  - **Documentation**: Updated README.md with correct tool names throughout
  - **Categories**: Renamed main categories (`dataFormat` → `data_format`, `idGenerators` → `id_generators`)

### Enhanced - MCP Protocol Implementation

- **📦 Enhanced Package Metadata**: Updated to v3.7.0 with comprehensive VS Code gallery information
  - Added MCP capabilities section with tools, resources, prompts, sampling, and roots
  - Enhanced keywords and description for better discoverability
  - Added tool count and categories metadata

- **🔍 Resource System**: Implemented dynamic resource templates with completable parameters
  - System logs with filterable types (system, error, debug)
  - Tool documentation by category with auto-completion
  - Workspace configuration with environment details

- **🤖 Prompt System**: Added intelligent workflow assistance
  - IT workflow guidance with task-specific recommendations
  - Security analysis prompts with completable data types
  - Context-aware workflow generation

  - **⚙️ Development Mode Features**:
  - Enhanced logging with startup information and resource usage monitoring
  - Hot reload capabilities indication
  - Debug information availability
  - Periodic memory and CPU usage monitoring

### Technical Implementation Details

- **Type Safety**: All new features implemented with full TypeScript support
- **Error Handling**: Comprehensive error handling for all MCP operations
- **Performance**: Optimized server startup and tool discovery
- **Validation**: Enhanced input validation with Zod schemas
- **Documentation**: Generated dynamic tool documentation from actual implementations

### Breaking Changes

- **Tool Names**: All tool names now use snake_case instead of kebab-case
  - Old: `generate-uuid`, `base64-encode`, `bip39-generate`
  - New: `generate_uuid`, `encode_base64`, `generate_bip39`
- **Folder Structure**: Tool folders renamed to match tool names exactly
- **Categories**: Main category names updated (`dataFormat` → `data_format`, `idGenerators` → `id_generators`)

### Migration Guide

For existing implementations using this MCP server:

1. Update tool names from kebab-case to snake_case in your scripts
2. Use the new naming convention: `action_object` format (e.g., `generate_uuid`, `encode_base64`)
3. Category references should use `data_format` and `id_generators`

## [3.2.12] - 2025-07-25

### Added in 3.2.12

- **Dynamic Tool Discovery System**: Completely removed hardcoded tool categories and metadata in favor of filesystem-based discovery.
- **Enhanced Server Metadata**: Added comprehensive package.json integration for server information including version, author, repository, and keywords.
- **Intelligent Category Descriptions**: Category descriptions are now generated dynamically by examining actual tool implementations and their descriptions.
- **Comprehensive Server-Info Tool**: Enhanced `server-info` tool with detailed metadata, system information, and tool breakdown capabilities.

### Updated

- **Fully Dynamic Architecture**: Tool categories, counts, and descriptions are now discovered automatically from the filesystem structure.
- **Zero Hardcoded Values**: Eliminated all hardcoded category lists, tool counts, and descriptions for better maintainability.
- **Self-Describing System**: The server now introspects its own capabilities and provides accurate metadata without manual updates.
- **Improved VS Code Integration**: Enhanced MCP server metadata for better integration with VS Code and other MCP clients.

### Technical Improvements

- `discoverTools()` function dynamically scans filesystem for tool categories and tools
- `getCategoryDescription()` extracts descriptions from actual tool implementations
- `getPackageMetadata()` reads comprehensive information from package.json at runtime
- Enhanced `server-info` tool with category filtering and detailed tool breakdown
- Completely async tool discovery with proper error handling
- Future-proof architecture that automatically adapts to new tools and categories

### Breaking Changes

None - all existing tool names and APIs remain fully compatible.

## [3.2.1] - 2025-07-09

### Bug Fixes

- Updated README documentation to use correct npm package name `it-tools-mcp` instead of GitHub reference `wrenchpilot/it-tools-mcp`.
- Fixed VS Code MCP configuration examples to use the published npm package.
- Removed unnecessary `-y` flag from npx commands in installation instructions.

### Documentation

- Improved installation instructions consistency across README.md and README.dockerhub.md.
- Fixed markdown linting issues with proper code block spacing.

## [3.2.0] - 2025-07-09

### Added

- Git hooks for automated version bumping based on Conventional Commit messages.
- Pre-commit hook that automatically bumps version (major/minor/patch) based on commit message type.
- Commit message template setup script for standardized commit formatting.

### Updated Workflow

- Enhanced development workflow with automated versioning based on commit message conventions.

## [3.1.2] - 2025-07-09

### Fixed

- Fixed VS Code MCP server initialization hanging by making test mode exit logic more specific.
- Test mode exit now only occurs when `MCP_TEST_MODE=true` environment variable is set, not just `NODE_ENV=test`.
- VS Code and other MCP clients can now properly initialize and maintain persistent connections.
- Updated test scripts to use the new `MCP_TEST_MODE=true` flag for proper automated test behavior.

### Changed

- Improved MCP server lifecycle management for better compatibility with different MCP client environments.
- Test automation now uses explicit `MCP_TEST_MODE` flag for cleaner separation between test and production behavior.

## [3.1.1] - 2025-07-09

### Fixed

- MCP server now outputs only JSON-RPC responses to stdout; all logs and timing output are sent to stderr.
- In test mode (`NODE_ENV=test`), the server exits cleanly after stdin closes, ensuring Docker/CI tests do not hang.
- Docker/CI test script (`tests/test-docker-setup.sh`) now sends both `initialize` and `tools/list` requests, and checks for correct JSON-RPC output.
- Fixed test script to set `NODE_ENV=test` for all docker runs and to robustly validate MCP protocol compliance.

### Changed

- Improved protocol compliance and robustness for Docker/CI environments.
- All resource/timing logs removed from stdout for strict MCP protocol adherence.

## 3.1.0 - 2025-07-07

### Major Feature Enhancement: Incorporate Tools from @sharevb Fork

- **Refactored entire codebase** to modular architecture with 112 tools organized under `src/tools/[category]/[tool]/`
- **Added dynamic tool loading and registration system** for better maintainability and scalability
- **Incorporated select tools from @sharevb fork** which extends IT Tools with additional utilities and enhancements
- **Updated integration tests** to match new modular architecture and fixed argument mismatches
- **Modernized curl tool** with native fetch API, improved timeout handling, and better error management
- **Enhanced documentation**:
  - Updated README.md and README.dockerhub.md with accurate tool counts (112 tools across 14 categories)
  - Added sorted tool tables for better organization
  - Updated project structure documentation to reflect modular organization
  - Added proper attribution to sharevb fork in Related sections
- **Restored missing hash tools** (hash-md5, hash-sha1, hash-sha512) that were accidentally removed
- **Improved test coverage** with comprehensive integration testing for all tools
- **Enhanced error handling** and validation throughout the codebase

**Breaking Changes**: None - all existing tool names and APIs remain compatible

**Technical Improvements**:

- Modular file structure for better code organization
- Dynamic tool registration eliminates manual tool list maintenance
- Improved type safety with consistent Zod schema validation
- Better separation of concerns with category-based organization

## 3.0.24 - 2025-07-02

### Bug Fixes & Test Reliability Improvements

- **Fixed curl test failure** in integration test suite - curl tool was timing out during tests.
- **Added 10-second timeout** to curl tool to prevent hanging in test environments.
- **Improved test reliability** by adding network-specific delays for curl, ssh, ping, and other network tools.
- **Enhanced error handling** for curl tool with better timeout detection and abort signal support.
- **Updated test URL** for curl test to use more reliable endpoint (`httpbin.org/status/200`).
- **Improved test result validation** with specific logic for curl tool success detection.

## 3.0.23 - 2025-01-29

### CI/CD Workflow Refactoring & Automation Improvements

- **Major refactoring of GitHub Actions workflow** for cleaner, more maintainable CI/CD pipeline.
- **Removed automatic version bumping** - version management is now fully manual via `package.json`.
- **Enhanced automation** for build, test, and publish processes while maintaining user control over releases.
- **Improved workflow structure**:
  - Added `analyze-changes` job to detect code/README/package.json changes.
  - Added `create-tag` job to automatically create git tags from `package.json` version.
  - Streamlined job dependencies and conditional execution.
  - Better error handling and validation throughout the pipeline.
- **Updated documentation** and commit templates to reflect manual versioning workflow.
- **Maintained security best practices** with proper permissions and token usage.
- Workflow now only publishes/releases when actual code changes are detected.

## 3.0.22 - 2025-06-29

### SQL Formatter Dialect Support & Documentation

- `sql-format` tool now supports a `dialect` parameter for proper SQL dialect formatting (e.g., `postgresql`, `mysql`, etc.).
- Added/updated tests to verify SQL formatting with dialects.
- Updated documentation in `README.md` to reflect new `dialect` parameter and allowed values for `sql-format`.
- Minor: Improved error handling and parameter validation for SQL formatting tool.

## 3.0.21 - 2025-06-28

### Maintenance & Dependency Cleanup

- Removed deprecated `node-fetch` and all transitive dependencies (including `node-domexception`).
- Updated `curl` tool to use native `fetch` (Node.js v18+ required).
- Added standalone test for `curl` tool.
- Updated all outdated dependencies to latest versions.
- Ensured all tests pass and process exits cleanly.

## 3.0.20 - 2025-06-28

### Maintenance & CI

- Add `glama.json` configuration file for MCP server registration and maintenance.

## 3.0.19 - 2025-06-28

### Maintenance

- Removed unused imports (`exec`, `Telnet`, `shellEscape`) from `network.ts` for a cleaner and more efficient codebase.
- Confirmed all remaining imports in `network.ts` are used.
- No user-facing changes; internal cleanup only.

## 3.0.18 - 2025-06-28

### Refactor & Internal

- Merged all security utilities from `security.ts` into `index.ts` for a single source of security logic.
- Removed `security.ts` from the build and updated all imports to use `index.ts` for security exports.
- Updated tests and build scripts to reflect the new structure.
- No user-facing changes; all security and validation logic remains available and tested.

## 3.0.17 - 2025-06-27

### New Tool

- Added `curl` tool for making HTTP requests (GET, POST, etc.) like curl. Supports method, URL, headers, and body. Available via MCP server and tested in integration suite.
- Updated documentation and tool counts to 88 tools.

## 3.0.16 - 2025-06-27

### New Tool: SCP

- Added `scp` tool for uploading and downloading files to/from remote hosts using SFTP (SCP-like) via SSH.
- Updated documentation and tool counts to 87 tools.
- Added integration test for `scp` tool.

## 3.0.15 - 2025-06-27

### Enhancements

- `qr-generate` tool now includes a Markdown snippet for inline QR code display in its text output.
- Improved error handling and fallback response for `qr-generate` to ensure a response is always returned.

## 3.0.14 - 2025-06-27

### Improvements

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

### Dependency Cleanup

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
