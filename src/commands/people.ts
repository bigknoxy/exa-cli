/**
 * People search command - Wraps the MCP people_search_exa tool
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_FORMATS = ['text', 'json', 'markdown'] as const

export default defineCommand({
  meta: {
    name: 'people',
    description: 'Search for people and profiles',
  },
  args: {
    query: {
      type: 'positional',
      required: true,
      description: 'Search query for finding people',
    },
    num: {
      type: 'string',
      default: '5',
      description: 'Number of results',
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
    const { query, num, format, 'api-key': apiKey } = args

    const numResults = parseInt(String(num), 10) || 5
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('people_search_exa', {
        query,
        numResults,
      })

      const output = formatOutput(result, outputFormat)
      console.log(output)
    } catch (error) {
      consola.error('People search failed:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await client.close()
    }
  },
})
