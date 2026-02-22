/**
 * Research command - Wraps the MCP deep_researcher_start and deep_researcher_check tools
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_MODELS = ['exa-research-fast', 'exa-research', 'exa-research-pro'] as const
const VALID_FORMATS = ['text', 'json', 'markdown'] as const

const startCommand = defineCommand({
  meta: {
    name: 'start',
    description: 'Start a new deep research task',
  },
  args: {
    instructions: {
      type: 'positional',
      required: true,
      description: 'Research instructions/question',
    },
    model: {
      type: 'string',
      default: 'exa-research-fast',
      description: `Research model (${VALID_MODELS.join(', ')})`,
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
    const { instructions, model, format, 'api-key': apiKey } = args

    const researchModel = VALID_MODELS.includes(model as typeof VALID_MODELS[number]) 
      ? model 
      : 'exa-research-fast'
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) 
      ? format as OutputFormat 
      : 'text'

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('deep_researcher_start', {
        instructions,
        model: researchModel,
      })

      const output = formatOutput(result, outputFormat)
      
      // Try to extract the research ID from the result
      let researchId = ''
      if (result.content && result.content.length > 0) {
        const content = result.content[0]
        if (content.type === 'text') {
          // Try to parse the ID from the text output
          const idMatch = content.text?.match(/(?:research[_-]?id|id)[:\s]*["']?([a-zA-Z0-9-]+)["']?/i)
          if (idMatch) {
            researchId = idMatch[1]
          } else {
            // If we can't parse it, just show the raw output
            console.log(output)
            return
          }
        }
      }

      if (researchId) {
        consola.info(`Research started with ID: ${researchId}`)
        console.log('\nRun the following command to check the status:')
        console.log(`  exa research check ${researchId}`)
      } else {
        console.log(output)
      }
    } catch (error) {
      consola.error('Failed to start research:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await client.close()
    }
  },
})

const checkCommand = defineCommand({
  meta: {
    name: 'check',
    description: 'Check the status of a deep research task',
  },
  args: {
    id: {
      type: 'positional',
      required: true,
      description: 'Research ID to check',
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
    const { id, format, 'api-key': apiKey } = args

    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) 
      ? format as OutputFormat 
      : 'text'

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('deep_researcher_check', {
        researchId: id,
      })

      // Try to determine status from the result
      let status = 'unknown'

      if (result.content && result.content.length > 0) {
        const content = result.content[0]
        if (content.type === 'text' && content.text) {
          const text = content.text.toLowerCase()
          
          // Determine status from the output
          if (text.includes('"status"') || text.includes("'status'")) {
            // Try to extract status from JSON
            const statusMatch = text.match(/"status"\s*:\s*"([^"]+)"/)
            if (statusMatch) {
              status = statusMatch[1]
            }
          } else if (text.includes('completed') || text.includes('finished')) {
            status = 'completed'
          } else if (text.includes('failed') || text.includes('error')) {
            status = 'failed'
          } else if (text.includes('running') || text.includes('processing')) {
            status = 'running'
          } else if (text.includes('pending') || text.includes('queued')) {
            status = 'pending'
          }
        }
      }

      // Display status
      const statusColors: Record<string, string> = {
        pending: '\x1b[33m',   // Yellow
        running: '\x1b[36m',   // Cyan
        completed: '\x1b[32m', // Green
        failed: '\x1b[31m',    // Red
        unknown: '\x1b[90m',   // Gray
      }
      const reset = '\x1b[0m'
      const color = statusColors[status] || statusColors.unknown

      console.log(`Status: ${color}${status.toUpperCase()}${reset}`)
      console.log('')

      // Show the full output
      const output = formatOutput(result, outputFormat)
      console.log(output)

      if (status === 'completed') {
        consola.success('Research completed!')
      } else if (status === 'failed') {
        consola.error('Research failed!')
      } else if (status === 'running' || status === 'pending') {
        consola.info('Research is still in progress. Check again later.')
      }
    } catch (error) {
      consola.error('Failed to check research:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    } finally {
      await client.close()
    }
  },
})

export default defineCommand({
  meta: {
    name: 'research',
    description: 'Deep research using Exa AI',
  },
  subCommands: {
    start: startCommand,
    check: checkCommand,
  },
})
