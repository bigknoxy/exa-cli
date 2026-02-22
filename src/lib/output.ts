import chalk from 'chalk'
import type { OutputFormat } from '../types.js'

interface ParsedResult {
  title: string
  url: string
  publishedDate?: string
  author?: string
  text: string
}

interface CompanyEntity {
  properties?: {
    name?: string
    description?: string
    workforce?: { total?: number }
    headquarters?: { city?: string; country?: string }
    financials?: { revenueAnnual?: number; fundingTotal?: number }
  }
}

interface ExaResult {
  title?: string
  url?: string
  text?: string
  entities?: CompanyEntity[]
}

interface ExaResponse {
  results?: ExaResult[]
  requestId?: string
}

function extractTextContent(data: unknown): string {
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as Record<string, unknown>).content)
  ) {
    const content = (data as { content: { type: string; text: string }[] }).content
    const textItem = content.find((item) => item.type === 'text')
    if (textItem?.text) {
      return textItem.text
    }
  }
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}

function parseExaFormat(text: string): ParsedResult[] {
  const results: ParsedResult[] = []
  const blocks = text.split(/(?=^Title:)/m).filter(b => b.trim())
  
  for (const block of blocks) {
    const titleMatch = block.match(/^Title:\s*(.+)$/m)
    const urlMatch = block.match(/^URL:\s*(.+)$/m)
    const dateMatch = block.match(/^Published Date:\s*(.+)$/m)
    const authorMatch = block.match(/^Author:\s*(.+)$/m)
    const textMatch = block.match(/^Text:\s*([\s\S]+?)(?=^Title:|$)/m)
    
    if (titleMatch || urlMatch) {
      results.push({
        title: titleMatch?.[1]?.trim() || '',
        url: urlMatch?.[1]?.trim() || '',
        publishedDate: dateMatch?.[1]?.trim(),
        author: authorMatch?.[1]?.trim(),
        text: textMatch?.[1]?.trim() || block.trim(),
      })
    }
  }
  
  return results
}

function tryParseJson(text: string): ExaResponse | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function formatOutput(data: unknown, format: OutputFormat): string {
  const text = extractTextContent(data)
  
  const parsed = parseExaFormat(text)
  if (parsed.length > 0) {
    return formatSearchResults(parsed, format)
  }
  
  const jsonData = tryParseJson(text)
  if (jsonData?.results?.[0]?.entities) {
    return formatCompanyResult(jsonData, format)
  }
  if (jsonData?.results) {
    return formatApiResults(jsonData.results, format)
  }
  
  return text
}

function formatCompanyResult(data: ExaResponse, format: OutputFormat): string {
  const result = data.results?.[0]
  if (!result) return 'No results found.'
  
  const entity = result.entities?.[0]?.properties
  const name = entity?.name || result.title || 'Unknown Company'
  const url = result.url || ''
  const description = entity?.description || ''
  const employees = entity?.workforce?.total
  const headquarters = entity?.headquarters
  const revenue = entity?.financials?.revenueAnnual
  const funding = entity?.financials?.fundingTotal
  
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }
  
  if (format === 'markdown') {
    let md = `# ${name}\n\n`
    if (url) md += `**URL:** ${url}\n\n`
    if (description) md += `${description}\n\n`
    if (employees) md += `**Employees:** ${employees.toLocaleString()}\n\n`
    if (headquarters) md += `**HQ:** ${headquarters.city || ''}, ${headquarters.country || ''}\n\n`
    if (revenue) md += `**Revenue:** $${(revenue / 1e9).toFixed(1)}B\n\n`
    if (funding) md += `**Total Funding:** $${(funding / 1e9).toFixed(1)}B\n\n`
    return md
  }
  
  let output = `${chalk.bold.cyan(name)}\n`
  if (url) output += `${chalk.dim.underline(url)}\n`
  output += '\n'
  if (description) output += `${chalk.dim(description.slice(0, 300))}${description.length > 300 ? '...' : ''}\n\n`
  if (employees) output += `${chalk.bold('Employees:')} ${employees.toLocaleString()}\n`
  if (headquarters) output += `${chalk.bold('HQ:')} ${headquarters.city || ''}, ${headquarters.country || ''}\n`
  if (revenue) output += `${chalk.bold('Revenue:')} $${(revenue / 1e9).toFixed(1)}B\n`
  if (funding) output += `${chalk.bold('Funding:')} $${(funding / 1e9).toFixed(1)}B\n`
  
  return output
}

function formatApiResults(results: ExaResult[], format: OutputFormat): string {
  const parsed: ParsedResult[] = results.map(r => ({
    title: r.title || '',
    url: r.url || '',
    text: r.text || '',
  }))
  return formatSearchResults(parsed, format)
}

export function formatSearchResults(results: ParsedResult[], format: OutputFormat): string {
  if (results.length === 0) {
    return 'No results found.'
  }
  
  const output = results.map((result, i) => {
    const num = chalk.cyan(`${i + 1}.`)
    const title = chalk.bold(result.title || 'Untitled')
    const url = chalk.dim.underline(result.url)
    const date = result.publishedDate ? chalk.dim(` (${result.publishedDate.split('T')[0]})`) : ''
    
    const snippet = truncateText(result.text, 200)
    
    if (format === 'markdown') {
      const mdLink = result.url ? `[${result.title}](${result.url})` : result.title
      return `${i + 1}. ${mdLink}${date}\n   ${snippet}`
    }
    
    if (format === 'json') {
      return JSON.stringify({
        title: result.title,
        url: result.url,
        publishedDate: result.publishedDate,
        text: snippet,
      }, null, 2)
    }
    
    return `${num} ${title}${date}\n   ${url}\n   ${chalk.dim(snippet)}`
  })
  
  return output.join('\n\n')
}

function truncateText(text: string, maxLength: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + '...'
}

export function formatCrawlResult(data: unknown, format: OutputFormat): string {
  const text = extractTextContent(data)
  
  if (format === 'json') {
    return text
  }
  
  const parsed = parseExaFormat(text)
  if (parsed.length > 0) {
    const result = parsed[0]
    const title = chalk.bold(result.title)
    const url = chalk.dim.underline(result.url)
    const content = truncateText(result.text, 1000)
    
    if (format === 'markdown') {
      return `## ${result.title}\n\n${result.url}\n\n${content}`
    }
    
    return `${title}\n${url}\n\n${content}`
  }
  
  return truncateText(text, 1000)
}
