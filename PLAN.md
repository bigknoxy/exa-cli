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
- `--json` - Raw JSON output
- `--text` - Human readable (default)
- `--markdown` - Markdown formatted
- `--quiet` - Just URLs/titles

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
│   │   └── research.ts       # deep_researcher_start/check
│   ├── lib/
│   │   ├── mcp-client.ts     # MCP connection management
│   │   ├── output.ts         # Formatting helpers
│   │   └── config.ts         # Config file management
│   └── types.ts              # Shared types
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| CLI Framework | **Citty** | Zero deps, lazy loading, async-first, UnJS ecosystem |
| MCP Client | `@modelcontextprotocol/sdk` | Official SDK |
| Validation | `zod` | SDK peer dependency |
| Output | `consola` + `chalk` | Matches Citty ecosystem |
| Runtime | Node.js 18+ / Bun | ESM modules |

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
- **Runtime**: Support both Node.js 18+ and Bun
- **API Mode**: MCP only (free tier default, API key optional for higher limits)
- **Output**: Human-readable text default, with `--json` and `--markdown` flags

### CLI Interface Design

```bash
# Web Search (default tool)
exa search "latest AI news 2026" --num 10
exa search "nvidia stock" --type fast --json

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

### Phase 1: MVP (Week 1)
- [ ] Project setup (Citty, TypeScript, ESM)
- [ ] MCP client connection module
- [ ] `exa search` - Basic web search
- [ ] `exa code` - Code search
- [ ] `exa crawl` - URL crawling
- [ ] JSON and text output formats
- [ ] Free tier (no auth)

### Phase 2: Core Features (Week 2)
- [ ] `exa company` - Company research
- [ ] `exa people` - People search
- [ ] `exa search-advanced` - With filters
- [ ] Config file support (`~/.exarc`)
- [ ] API key support (--api-key, env var)
- [ ] Markdown output format

### Phase 3: Advanced Features (Week 3)
- [ ] `exa research start/check` - Deep research
- [ ] Pagination for large results
- [ ] Streaming output for long operations
- [ ] Shell completion (bash, zsh, fish)
- [ ] Error handling with helpful messages

### Phase 4: Polish (Week 4)
- [ ] Test coverage
- [ ] Documentation
- [ ] npm publishing
- [ ] CI/CD setup
- [ ] Version management

---

## Dependencies

```json
{
  "dependencies": {
    "citty": "^0.1.6",
    "consola": "^3.4.0",
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^3.24.0",
    "chalk": "^5.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "bun-types": "latest"
  }
}
```
