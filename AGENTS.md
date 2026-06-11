# AI Coding Agent Guidelines for exa-cli

## Overview
CLI wrapper for Exa MCP server. Stack: citty (CLI), consola (logging), chalk (colors). Node 18+, ESM required.

## Structure
```
src/
  commands/      # CLI commands
  lib/           # Utilities (mcp-client.ts, output.ts, config.ts)
  index.ts       # Entry point
  types.ts       # Shared types (OutputFormat, ExaConfig, SearchResult)
```

## MCP Tools Map
| CLI Command | MCP Tool |
|-------------|----------|
| search | web_search_exa |
| search-advanced | web_search_advanced_exa |
| code | get_code_context_exa |
| crawl | crawling_exa |
| company | company_research_exa |
| people | people_search_exa |
| research start | deep_researcher_start |
| research check | deep_researcher_check |

## Commands
search.ts, search-advanced.ts, code.ts, crawl.ts, company.ts, people.ts, research.ts, config.ts, completion.ts

## Critical Patterns

### Error Handling (Required)
```typescript
try {
  // ... code
} catch (error) {
  consola.error('Operation failed:', error instanceof Error ? error.message : 'Unknown')
  process.exit(1)
} finally {
  await client.close()
}
```

### Validation
```typescript
value: (val: string) => {
  if (!validValues.includes(val)) {
    throw new Error(`Invalid value: ${val}. Valid: ${validValues.join(', ')}`)
  }
  return val
}
```

### MCP Client
```typescript
import { getMcpClient } from '../lib/mcp-client.js'
const client = getMcpClient()
try {
  await client.connect(apiKey)
  const result = await client.callTool('tool_name', { /* args */ })
} finally {
  await client.close()
}
```

### Output Formatting
```typescript
import { formatOutput, formatCrawlResult } from '../lib/output.js'
console.log(formatOutput(result, 'text')) // or 'json' or 'markdown'
```

### CLI Command
```typescript
export default defineCommand({
  meta: { name: 'cmd', description: 'Brief description' },
  args: {
    query: { type: 'positional', required: true, description: 'Query' },
    format: { type: 'string', default: 'text', description: 'Format' },
  },
  async run({ args }) { },
})
```

## Conventions
- Files: kebab-case (search-advanced.ts)
- Functions/vars: camelCase
- Types: PascalCase
- Constants: UPPER_SNAKE_CASE (module-level)
- Imports: `.js` extension required (ESM)
- Types: `import type { X } from './x.js'`

## Build/Test
```bash
npm run build          # Compile to ./dist
npx vitest run src/__tests__/output.test.ts
npx tsc --noEmit       # Type check
```