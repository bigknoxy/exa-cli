# exa-cli Tasks

## Phase 1: MVP ✅ COMPLETE
- [x] Project setup (Citty, TypeScript, ESM)
- [x] MCP client connection module
- [x] `exa search` - Basic web search
- [x] `exa code` - Code search
- [x] `exa crawl` - URL crawling
- [x] JSON and text output formats
- [x] Free tier (no auth)

## Phase 2: Core Features ✅ COMPLETE
- [x] `exa company` - Company research
- [x] `exa people` - People search
- [x] `exa search-advanced` - With filters
- [x] Config file support (`~/.exarc`)
- [x] API key support (--api-key, env var)
- [x] Markdown output format

## Phase 3: Advanced Features ✅ COMPLETE
- [x] `exa research start/check` - Deep research
- [x] Shell completion (bash, zsh, fish)
- [x] Error handling with helpful messages

## Phase 4: Polish ✅ COMPLETE
- [x] All commands verified working
- [x] Documentation (README.md, AGENTS.md, CHANGELOG.md, PLAN.md)
- [x] Tests (61 tests, 100% pass rate)
- [x] CI/CD (GitHub Actions, Node 22, vitest 5)
- [x] Branch protection with required status checks
- [x] Dependabot with vitest grouping
- [x] LICENSE, CHANGELOG, .gitignore

## Release ✅ COMPLETE
- [x] GitHub repo created: https://github.com/bigknoxy/exa-cli
- [x] Branch protection (requires PR + status checks)
- [x] Release v0.1.0 created
- [x] Install/uninstall scripts
- [ ] npm publish v0.2.0 (requires `npm login`)

## Maintenance
- [x] Upgraded vitest 4 → 5 (with @vitest/coverage-v8)
- [x] Raised Node.js minimum from 18 → 22.12
- [x] Removed unused c8 devDependency
- [x] Fixed CI coverage job (removed redundant second run)
- [x] Added dist/ exclusion to vitest config
- [x] Added clearMocks: true to vitest config
- [x] Updated install.sh for Node 22.12+ version check
- [x] Closed stale Dependabot PRs (#1, #23, #24, #25)
- [x] Merged safe Dependabot bumps (#27, #28, #29)
