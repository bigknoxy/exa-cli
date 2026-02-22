/**
 * Company research command - Wraps the MCP company_research_exa tool
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_FORMATS = ['text', 'json', 'markdown'] as const

export default defineCommand({
  meta: {
    name: 'company',
    description: 'Research a company',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'Company name to research',
    },
    num: {
      type: 'string',
      default: '3',
      description: 'Number of results',
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
    const { name, num, format, 'api-key': apiKey } = args

    const numResults = parseInt(String(num), 10) || 3
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('company_research_exa', {
        companyName: name,
        numResults,
      })

      const output = formatOutput(result, outputFormat)
      console.log(output)
    } catch (error) {
      consola.error('Company research failed:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await client.close()
    }
  },
})
