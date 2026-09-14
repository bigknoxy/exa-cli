# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-09-14

### Changed
- **BREAKING**: Raised minimum Node.js version from 18+ to 22.12+ (required by vitest 5)
- Upgraded vitest from 4.1.11 to 5.0.0
- Upgraded @vitest/coverage-v8 from 4.1.8 to 5.0.0
- Upgraded @modelcontextprotocol/sdk from 1.26.0 to 1.30.0
- Upgraded zod from 4.5.4 to 4.6.2
- Upgraded @types/node from 26.5.0 to 26.5.1
- CI workflows now use Node.js 22

### Removed
- Removed unused `c8` devDependency (coverage handled by @vitest/coverage-v8)
- Removed redundant second coverage run in CI

### Added
- Added `clearMocks: true` to vitest.config.ts (explicit for vitest 5 default)
- Added `exclude: ['dist']` to vitest.config.ts to prevent test duplication
- Added TDD falsifier/anti-falsifier test suite for vitest 5 clearMocks compatibility
- Added vitest+@vitest/* grouping in dependabot.yml to prevent split PRs
- Updated required CI status checks to match actual job names (build, Test, Lint, Coverage)

## [0.1.0] - 2026-02-22

### Added
- Initial release
- `exa search` - Web search using Exa MCP
- `exa code` - Code examples and documentation search
- `exa crawl` - Extract content from URLs
- `exa company` - Company research
- `exa people` - People/profile search
- `exa search-advanced` - Advanced search with filters
- `exa research start/check` - Deep AI research
- `exa config` - Configuration management
- `exa completion` - Shell completion (bash, zsh, fish)
- Multiple output formats (text, json, markdown)
- Free tier support via Exa MCP
- Optional API key for higher rate limits
