/**
 * Search command - Wraps the MCP web_search_exa tool
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_TYPES = ['auto', 'fast'] as const
const VALID_LIVECRAWL = ['fallback', 'preferred'] as const
const VALID_FORMATS = ['text', 'json', 'markdown'] as const

export default defineCommand({
  meta: {
    name: 'search',
    description: 'Search the web using Exa',
  },
  args: {
    query: {
      type: 'positional',
      required: true,
      description: 'Search query',
    },
    num: {
      type: 'string',
      default: '8',
      description: 'Number of results',
    },
    type: {
      type: 'string',
      default: 'auto',
      description: `Search type (${VALID_TYPES.join(', ')})`,
    },
    livecrawl: {
      type: 'string',
      default: 'fallback',
      description: `Live crawl mode (${VALID_LIVECRAWL.join(', ')})`,
    },
    format: {
      type: 'string',
      default: 'text',
      description: `Output format (${VALID_FORMATS.join(', ')})`,
    },
    'api-key': {
      type: 'string',
      description: 'Override API key',
    },
  },
  async run({ args }) {
    const { query, num, type, livecrawl, format, 'api-key': apiKey } = args

    const numResults = parseInt(String(num), 10) || 8
    const searchType = VALID_TYPES.includes(type as typeof VALID_TYPES[number]) ? type : 'auto'
    const livecrawlMode = VALID_LIVECRAWL.includes(livecrawl as typeof VALID_LIVECRAWL[number]) ? livecrawl : 'fallback'
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('web_search_exa', {
        query,
        numResults,
        type: searchType,
        livecrawl: livecrawlMode,
      })

      const output = formatOutput(result, outputFormat)
      console.log(output)
    } catch (error) {
      consola.error('Search failed:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await client.close()
    }
  },
})
