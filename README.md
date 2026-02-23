# @bigknoxy/exa-cli

[![npm version](https://img.shields.io/npm/v/@bigknoxy/exa-cli.svg)](https://www.npmjs.com/package/@bigknoxy/exa-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@bigknoxy/exa-cli.svg)](https://nodejs.org)

A CLI wrapper for the [Exa MCP server](https://github.com/exa-labs/exa-mcp-server). Use Exa's powerful search, crawl, and research capabilities from the command line - optimized for LLM tool usage.

## Why exa-cli?

- **Free tier support** - Uses Exa's free MCP tier (no API key required)
- **LLM-optimized** - CLI tools are more efficient for LLMs than MCP protocol
- **All Exa tools** - Web search, code search, crawling, company research, people search, and deep research

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/bigknoxy/exa-cli/main/install.sh | sh
```

### npm

```bash
npm install -g @bigknoxy/exa-cli
```

### Run directly with npx

```bash
npx @bigknoxy/exa-cli search "your query"
```

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/bigknoxy/exa-cli/main/uninstall.sh | sh
```

Or with npm:

```bash
npm uninstall -g @bigknoxy/exa-cli
```

> **Note**: The uninstall script will leave your config file (`~/.exarc`) in place. Remove it manually with `rm ~/.exarc` if desired.

## Commands

### `exa search <query>`

Search the web for any topic.

```bash
exa search "latest AI news 2026" --num 10
exa search "typescript best practices" --type fast --format json
```

**Options:**
- `--num` - Number of results (default: 8)
- `--type` - Search type: `auto` or `fast` (default: auto)
- `--livecrawl` - Live crawl mode: `fallback` or `preferred` (default: fallback)
- `--format` - Output format: `text`, `json`, or `markdown` (default: text)
- `--api-key` - Override API key

### `exa code <query>`

Search for code examples and documentation.

```bash
exa code "React useState hook TypeScript" --tokens 3000
exa code "express middleware authentication" --format markdown
```

**Options:**
- `--tokens` - Token count 1000-50000 (default: 5000)
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa crawl <url>`

Extract content from a specific URL.

```bash
exa crawl https://docs.exa.ai --max-chars 5000
exa crawl https://example.com/article --format json
```

**Options:**
- `--max-chars` - Maximum characters to extract (default: 3000)
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa company <name>`

Research a company.

```bash
exa company Anthropic --num 5
exa company "OpenAI" --format json
```

**Options:**
- `--num` - Number of results (default: 3)
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa people <query>`

Search for people and professional profiles.

```bash
exa people "VP Engineering AI startups" --num 10
exa people "machine learning researcher" --format json
```

**Options:**
- `--num` - Number of results (default: 5)
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa search-advanced <query>`

Advanced search with full filter control.

```bash
exa search-advanced "AI agents 2026" \
  --category news \
  --include-domains techcrunch.com,wired.com \
  --start-date 2026-01-01 \
  --highlights
```

**Options:**
- `--num` - Number of results, max 100 (default: 10)
- `--type` - Search type: `auto`, `fast`, or `neural`
- `--category` - Category filter: `company`, `research paper`, `news`, `tweet`, `personal site`, `people`, `financial report`
- `--include-domains` - Comma-separated domains to include
- `--exclude-domains` - Comma-separated domains to exclude
- `--start-date` - Start published date (YYYY-MM-DD)
- `--end-date` - End published date (YYYY-MM-DD)
- `--highlights` - Enable highlights
- `--summary` - Enable summaries
- `--livecrawl` - Mode: `never`, `fallback`, `preferred`, `always`
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa research start <instructions>`

Start an AI research agent for complex questions.

```bash
exa research start "Compare flagship GPUs from NVIDIA, AMD, and Intel in 2026"
exa research start "Analyze the electric vehicle market trends" --model exa-research-pro
```

**Options:**
- `--model` - Research model: `exa-research-fast`, `exa-research`, `exa-research-pro` (default: exa-research-fast)
- `--format` - Output format (default: text)
- `--api-key` - Override API key

### `exa research check <id>`

Check the status of a research task.

```bash
exa research check abc123...
```

### `exa config`

Manage configuration stored in `~/.exarc`.

```bash
exa config list              # Show all config
exa config set apiKey YOUR_KEY   # Set API key
exa config set output json   # Set default output format
exa config get apiKey        # Get a config value
exa config clear             # Reset to defaults
```

### `exa completion <shell>`

Generate shell completion scripts.

```bash
# Bash
exa completion bash > /etc/bash_completion.d/exa

# Zsh
exa completion zsh > ~/.zsh/completions/_exa

# Fish
exa completion fish > ~/.config/fish/completions/exa.fish
```

## Configuration

Configuration is stored in `~/.exarc`:

```json
{
  "apiKey": "your-api-key",
  "output": "text",
  "defaultNum": 8
}
```

### API Key

The CLI works with the free MCP tier by default (no API key required). To get higher rate limits:

1. Get an API key from https://dashboard.exa.ai/api-keys
2. Set it via config: `exa config set apiKey YOUR_KEY`
3. Or use `--api-key` flag per command
4. Or set `EXA_API_KEY` environment variable

## Output Formats

- `text` (default) - Human-readable with colors
- `json` - Raw JSON output for scripting
- `markdown` - Markdown formatted with links

## Development

```bash
# Clone and install
git clone https://github.com/bigknoxy/exa-cli.git
cd exa-cli
npm install

# Build
npm run build

# Test
npm test

# Development mode
npm run dev search "test query"
```

## Requirements

- Node.js 18+
- npm or bun

## License

MIT
