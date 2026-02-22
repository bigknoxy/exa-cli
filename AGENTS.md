# AI Coding Agent Guidelines for exa-cli

This document provides essential information for AI coding agents working in this repository.

## Project Overview

exa-cli is a TypeScript CLI wrapper for the Exa MCP server. It provides command-line access to Exa's search, crawl, and research capabilities. Built with `citty` for CLI framework, `consola` for logging, and `chalk` for terminal colors.

## Build Commands

```bash
npm run build          # Compile TypeScript to ./dist
npm run dev            # Run with tsx in development mode
npm start              # Run compiled CLI from ./dist
npm run clean          # Remove ./dist directory
npm run rebuild        # Clean and rebuild
```

## Testing

No test framework is currently configured. When adding tests, consider:
- Jest or Vitest for unit tests
- Place tests in `__tests__/` directories or alongside source files with `.test.ts` suffix
- Run single test file: `npx vitest run path/to/test.ts`

## Linting & Type Checking

No linter is configured. TypeScript provides type checking via `tsc`:
```bash
npx tsc --noEmit       # Type check without emitting files
```

Recommended additions: ESLint with `@typescript-eslint` and Prettier.

## Code Style Guidelines

### Imports

- Use ES modules with `.js` extensions in imports (required for ESM):
  ```typescript
  import { something } from './module.js'  // Correct
  import { something } from './module'     // Incorrect
  ```

- Group imports logically:
  1. External packages (Node.js built-ins, then third-party)
  2. Internal modules (relative paths)

- Use `import type` for type-only imports:
  ```typescript
  import type { OutputFormat } from '../types.js'
  ```

### Formatting

- No explicit formatting rules defined. Follow existing code patterns.
- TypeScript strict mode is enabled with additional checks:
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`

### Types

- Prefer explicit type annotations for function parameters and return types
- Use `interface` for object shapes, `type` for unions/primitives
- Export types that are reused across modules from `src/types.ts`
- Avoid `any`; use `unknown` when type is genuinely unknown

### Naming Conventions

- **Files**: kebab-case (`search-advanced.ts`, `mcp-client.ts`)
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for module-level, camelCase otherwise
- **Command files**: Match CLI command names (e.g., `search.ts` for `exa search`)

### Error Handling

- Use try/catch blocks with proper error messages
- Log errors with `consola.error()`:
  ```typescript
  catch (error) {
    consola.error('Operation failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
  ```

- Throw descriptive errors with context:
  ```typescript
  throw new Error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown'}`)
  ```

### Async Patterns

- Use `async/await` (not `.then()` chains)
- Always handle promise rejections
- Use `finally` for cleanup (e.g., closing MCP client)

### CLI Commands

Commands use `citty`'s `defineCommand`:

```typescript
export default defineCommand({
  meta: {
    name: 'command-name',
    description: 'Brief description',
  },
  args: {
    query: {
      type: 'positional',
      required: true,
      description: 'Argument description',
    },
    option: {
      type: 'string',
      default: 'value',
      description: 'Option description',
    },
  },
  async run({ args }) {
    // Implementation
  },
})
```

### MCP Client Usage

```typescript
import { getMcpClient } from '../lib/mcp-client.js'

const client = getMcpClient()
try {
  await client.connect(apiKey)
  const result = await client.callTool('tool_name', { /* args */ })
  // Process result
} finally {
  await client.close()
}
```

### Output Formatting

Use the output utilities from `src/lib/output.ts`:

```typescript
import { formatOutput, formatCrawlResult } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const output = formatOutput(result, 'text')  // or 'json' or 'markdown'
console.log(output)
```

## Project Structure

```
src/
  index.ts           # CLI entry point, registers all commands
  types.ts           # Shared TypeScript types
  commands/
    index.ts         # Re-exports all commands
    search.ts        # exa search command
    search-advanced.ts
    code.ts
    crawl.ts
    company.ts
    people.ts
    research.ts
    config.ts
    completion.ts
  lib/
    mcp-client.ts    # MCP client singleton and connection handling
    config.ts        # Config file I/O (~/.exarc)
    output.ts        # Output formatting utilities
```

## Dependencies

- `citty` - CLI framework
- `consola` - Logging
- `chalk` - Terminal colors
- `@modelcontextprotocol/sdk` - MCP protocol client
- `zod` - Schema validation

## Node.js Requirements

- Node.js >= 18.0.0 (per `package.json` engines)
- ES modules (`"type": "module"` in package.json)
