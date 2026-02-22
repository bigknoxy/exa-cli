import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatCrawlResult } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_FORMATS = ['text', 'json', 'markdown'] as const

export default defineCommand({
  meta: {
    name: 'crawl',
    description: 'Extract content from a URL',
  },
  args: {
    url: {
      type: 'positional',
      required: true,
      description: 'URL to crawl',
    },
    'max-chars': {
      type: 'string',
      default: '3000',
      description: 'Maximum characters to extract',
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
    const { url, 'max-chars': maxChars, format, 'api-key': apiKey } = args

    const maxCharacters = parseInt(String(maxChars), 10) || 3000
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    const mcpClient = getMcpClient()
    
    try {
      await mcpClient.connect(apiKey as string | undefined)

      const result = await mcpClient.callTool('crawling_exa', {
        url,
        maxCharacters,
      })

      const formatted = formatCrawlResult(result, outputFormat)
      console.log(formatted)
    } catch (error) {
      consola.error('Failed to crawl URL:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await mcpClient.close()
    }
  },
})
