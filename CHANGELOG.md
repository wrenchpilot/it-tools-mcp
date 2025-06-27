# Changelog

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
