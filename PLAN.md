# exa-cli: Product Requirements, Plan & Roadmap

## Product Requirements Document (PRD)

### Overview
A CLI tool that wraps the Exa MCP server, providing all Exa search capabilities via command-line interface. This enables LLMs to use Exa more efficiently through CLI tools rather than MCP protocol overhead.

### Problem Statement
- MCP protocol has overhead for LLMs
- LLMs are more efficient with CLI tools
- Users want to use Exa's free MCP tier without API keys
- Need programmatic access to Exa's 8 tools from terminal/scripts

### Target Users
1. **LLM Agents** - Primary use case: efficient tool invocation
2. **Developers** - Quick search/crawl from terminal
3. **Scripts/CI** - Automated content extraction and research

### Core Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Web Search | P0 | `exa search "query"` |
| Code Search | P0 | `exa code "React hooks"` |
| URL Crawl | P0 | `exa crawl <url>` |
| Company Research | P1 | `exa company "Anthropic"` |
| People Search | P1 | `exa people "VP Engineering AI"` |
| Advanced Search | P1 | `exa search-advanced` with filters |
| Deep Research | P2 | `exa research start/check` |
| Config Management | P1 | API key, defaults, output format |

### Authentication Model
- **Default**: Free MCP tier (no API key, rate limited)
- **Optional**: API key via `--api-key`, env var, or config file for higher limits

### Output Formats
- `--format text` - Human readable (default)
- `--format json` - Raw JSON output for scripting
- `--format markdown` - Markdown formatted with links

---

## Technical Plan

### Architecture

```
exa-cli/
├── src/
│   ├── index.ts              # Entry point, command definitions
│   ├── commands/
│   │   ├── search.ts         # web_search_exa, web_search_advanced_exa
│   │   ├── code.ts           # get_code_context_exa
│   │   ├── crawl.ts          # crawling_exa
│   │   ├── company.ts        # company_research_exa
│   │   ├── people.ts         # people_search_exa
│   │   ├── research.ts       # deep_researcher_start/check
│   │   ├── config.ts         # Configuration management
│   │   └── completion.ts     # Shell completion (bash, zsh, fish)
│   ├── lib/
│   │   ├── mcp-client.ts     # MCP connection management
│   │   ├── output.ts         # Formatting helpers
│   │   └── config.ts         # Config file management
│   ├── __tests__/            # Test suite (vitest 5)
│   │   ├── config.test.ts
│   │   ├── output.test.ts
│   │   └── vitest5-compat.test.ts
│   └── types.ts              # Shared types
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| CLI Framework | **Citty** | Zero deps, lazy loading, async-first, UnJS ecosystem |
| MCP Client | `@modelcontextprotocol/sdk` | Official SDK |
| Validation | `zod` | SDK peer dependency |
| Output | `consola` + `chalk` | Matches Citty ecosystem |
| Testing | **vitest 5** + @vitest/coverage-v8 | Fast, Vite-native, coverage built-in |
| Runtime | Node.js 22.12+ | Required by vitest 5 |

### MCP Connection Strategy

```typescript
// Connect to free Exa MCP
const url = new URL("https://mcp.exa.ai/mcp")

// Optionally add API key for higher limits
if (apiKey) {
  url.searchParams.set("exaApiKey", apiKey)
}

// Use StreamableHTTP with SSE fallback (matches OpenCode pattern)
const transport = new StreamableHTTPClientTransport(url)
await client.connect(transport)
```

### Command Mapping

| CLI Command | MCP Tool | Key Args |
|-------------|----------|----------|
| `exa search <query>` | `web_search_exa` | `--num`, `--type`, `--livecrawl` |
| `exa code <query>` | `get_code_context_exa` | `--tokens` |
| `exa crawl <url>` | `crawling_exa` | `--max-chars` |
| `exa company <name>` | `company_research_exa` | `--num` |
| `exa people <query>` | `people_search_exa` | `--num` |
| `exa research start <instructions>` | `deep_researcher_start` | `--model` |
| `exa research check <id>` | `deep_researcher_check` | - |
| `exa search-advanced <query>` | `web_search_advanced_exa` | Full filter support |

### Decisions
- **Runtime**: Node.js 22.12+ required (vitest 5 constraint)
- **API Mode**: MCP only (free tier default, API key optional for higher limits)
- **Output**: Human-readable text default, with `--format json` and `--format markdown` flags
- **Testing**: vitest 5 with clearMocks: true and coverage thresholds

### CLI Interface Design

```bash
# Web Search (default tool)
exa search "latest AI news 2026" --num 10
exa search "nvidia stock" --type fast --format json

# Code Search
exa code "React useState hook TypeScript" --tokens 3000

# Crawl URL
exa crawl https://docs.exa.ai --max-chars 5000

# Company Research
exa company Anthropic --num 5

# People Search
exa people "VP Engineering AI startups"

# Advanced Search with filters
exa search-advanced "AI agents 2026" \
  --category news \
  --include-domains techcrunch.com,wired.com \
  --start-date 2026-01-01 \
  --highlights

# Deep Research
exa research start "Compare flagship GPUs 2026" --model exa-research
exa research check <research-id>

# Config
exa config set apiKey YOUR_KEY  # Optional, for higher limits
exa config set output json
```

---

## Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Project setup (Citty, TypeScript, ESM)
- [x] MCP client connection module
- [x] `exa search` - Basic web search
- [x] `exa code` - Code search
- [x] `exa crawl` - URL crawling
- [x] JSON and text output formats
- [x] Free tier (no auth)

### Phase 2: Core Features ✅ COMPLETE
- [x] `exa company` - Company research
- [x] `exa people` - People search
- [x] `exa search-advanced` - With filters
- [x] Config file support (`~/.exarc`)
- [x] API key support (--api-key, env var)
- [x] Markdown output format

### Phase 3: Advanced Features ✅ COMPLETE
- [x] `exa research start/check` - Deep research
- [x] Pagination for large results
- [x] Streaming output for long operations
- [x] Shell completion (bash, zsh, fish)
- [x] Error handling with helpful messages

### Phase 4: Polish ✅ COMPLETE
- [x] Test coverage (61 tests, 100% pass rate)
- [x] Documentation (README.md, AGENTS.md, CHANGELOG.md)
- [x] npm publishing
- [x] CI/CD (GitHub Actions with Node 22)
- [x] Version management
- [x] Branch protection with required status checks
- [x] Dependabot with vitest grouping

---

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "citty": "^0.2.2",
    "consola": "^3.4.0",
    "chalk": "^6.0.0",
    "zod": "^4.5.4"
  },
  "devDependencies": {
    "@types/node": "^26.5.0",
    "@vitest/coverage-v8": "^5.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^5.0.0"
  }
}
```
