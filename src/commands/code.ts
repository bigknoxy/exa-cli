import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_FORMATS = ['text', 'json', 'markdown'] as const

export default defineCommand({
  meta: {
    name: 'code',
    description: 'Search for code examples and documentation',
  },
  args: {
    query: {
      type: 'positional',
      required: true,
      description: 'Code search query (include language/framework)',
    },
    tokens: {
      type: 'string',
      default: '5000',
      description: 'Token count (1000-50000)',
    },
    format: {
      type: 'string',
      default: 'text',
      description: `Output format (${VALID_FORMATS.join(', ')})`,
    },
    'api-key': {
      type: 'string',
      description: 'Exa API key',
    },
  },
  async run({ args }) {
    const { query, tokens, format, 'api-key': apiKey } = args
    
    const tokensNum = Math.min(Math.max(parseInt(String(tokens), 10) || 5000, 1000), 50000)
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    const mcpClient = getMcpClient()
    
    try {
      await mcpClient.connect(apiKey as string | undefined)

      const result = await mcpClient.callTool('get_code_context_exa', {
        query,
        tokensNum,
      })

      const formatted = formatOutput(result, outputFormat)
      console.log(formatted)
    } catch (error) {
      consola.error('Failed to search code:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await mcpClient.close()
    }
  },
})
