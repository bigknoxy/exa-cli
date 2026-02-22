/**
 * Search Advanced command - Wraps the MCP web_search_advanced_exa tool
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { getMcpClient } from '../lib/mcp-client.js'
import { formatOutput } from '../lib/output.js'
import type { OutputFormat } from '../types.js'

const VALID_TYPES = ['auto', 'fast', 'neural'] as const
const VALID_LIVECRAWL = ['never', 'fallback', 'preferred', 'always'] as const
const VALID_FORMATS = ['text', 'json', 'markdown'] as const
const VALID_CATEGORIES = ['company', 'research paper', 'news', 'tweet', 'personal site', 'people', 'financial report'] as const

export default defineCommand({
  meta: {
    name: 'search-advanced',
    description: 'Advanced web search with filters',
  },
  args: {
    query: {
      type: 'positional',
      required: true,
      description: 'Search query',
    },
    num: {
      type: 'string',
      default: '10',
      description: 'Number of results (max 100)',
    },
    type: {
      type: 'string',
      default: 'auto',
      description: `Search type (${VALID_TYPES.join(', ')})`,
    },
    category: {
      type: 'string',
      description: `Category filter (${VALID_CATEGORIES.join(', ')})`,
    },
    'include-domains': {
      type: 'string',
      description: 'Comma-separated domains to include',
    },
    'exclude-domains': {
      type: 'string',
      description: 'Comma-separated domains to exclude',
    },
    'start-date': {
      type: 'string',
      description: 'Start published date (YYYY-MM-DD)',
    },
    'end-date': {
      type: 'string',
      description: 'End published date (YYYY-MM-DD)',
    },
    highlights: {
      type: 'boolean',
      description: 'Enable highlights',
    },
    summary: {
      type: 'boolean',
      description: 'Enable summaries',
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
    const {
      query,
      num,
      type,
      category,
      'include-domains': includeDomains,
      'exclude-domains': excludeDomains,
      'start-date': startDate,
      'end-date': endDate,
      highlights,
      summary,
      livecrawl,
      format,
      'api-key': apiKey,
    } = args

    const numResults = Math.min(parseInt(String(num), 10) || 10, 100)
    const searchType = VALID_TYPES.includes(type as typeof VALID_TYPES[number]) ? type : 'auto'
    const livecrawlMode = VALID_LIVECRAWL.includes(livecrawl as typeof VALID_LIVECRAWL[number]) ? livecrawl : 'fallback'
    const outputFormat = VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]) ? format as OutputFormat : 'text'

    // Parse category if provided
    const categoryValue = category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
      ? category
      : undefined

    // Parse include-domains and exclude-domains as arrays
    const includeDomainsArray = includeDomains
      ? String(includeDomains).split(',').map(d => d.trim()).filter(Boolean)
      : undefined

    const excludeDomainsArray = excludeDomains
      ? String(excludeDomains).split(',').map(d => d.trim()).filter(Boolean)
      : undefined

    // Build args object, only including defined optional params
    const toolArgs: Record<string, unknown> = {
      query,
      numResults,
      type: searchType,
      livecrawl: livecrawlMode,
    }

    if (categoryValue) {
      toolArgs.category = categoryValue
    }

    if (includeDomainsArray && includeDomainsArray.length > 0) {
      toolArgs.includeDomains = includeDomainsArray
    }

    if (excludeDomainsArray && excludeDomainsArray.length > 0) {
      toolArgs.excludeDomains = excludeDomainsArray
    }

    if (startDate) {
      toolArgs.startPublishedDate = startDate
    }

    if (endDate) {
      toolArgs.endPublishedDate = endDate
    }

    if (highlights) {
      toolArgs.highlights = true
    }

    if (summary) {
      toolArgs.summary = true
    }

    const client = getMcpClient()

    try {
      await client.connect(apiKey as string | undefined)

      const result = await client.callTool('web_search_advanced_exa', toolArgs)

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
