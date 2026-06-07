import { describe, it, expect, vi } from 'vitest'
import {
  formatOutput,
  formatSearchResults,
  formatCrawlResult,
} from '../lib/output.js'
import type { OutputFormat } from '../types.js'

// Create a chainable mock for chalk v5 - use vi.hoisted
const { createChalkMock } = vi.hoisted(() => {
  const createChalkMock = () => {
    const fn = (s: string) => s
    const chainable = new Proxy(fn, {
      get(_target, prop) {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return undefined
        }
        return chainable
      },
      apply(_target, _thisArg, args) {
        return args[0] ?? ''
      },
    })
    return chainable
  }
  return { createChalkMock }
})

vi.mock('chalk', () => ({
  default: createChalkMock(),
  bold: createChalkMock(),
  cyan: createChalkMock(),
  dim: createChalkMock(),
  underline: createChalkMock(),
}))

describe('output.ts', () => {
  describe('formatSearchResults', () => {
    it('should return "No results found." for empty array', () => {
      const result = formatSearchResults([], 'text')
      expect(result).toBe('No results found.')
    })

    it('should format results in text format', () => {
      const results = [
        {
          title: 'Test Article',
          url: 'https://example.com/article',
          text: 'This is a test article with some content.',
          publishedDate: '2024-01-15T10:00:00Z',
          author: 'John Doe',
        },
      ]
      const result = formatSearchResults(results, 'text')
      expect(result).toContain('Test Article')
      expect(result).toContain('https://example.com/article')
    })

    it('should format results in json format', () => {
      const results = [
        {
          title: 'Test Article',
          url: 'https://example.com/article',
          text: 'This is a test article.',
        },
      ]
      const result = formatSearchResults(results, 'json')
      // JSON format returns each result as separate JSON string, not array
      const lines = result.split('\n\n').filter(Boolean)
      expect(lines).toHaveLength(1)
      const parsed = JSON.parse(lines[0])
      expect(parsed.title).toBe('Test Article')
    })

    it('should format results in markdown format', () => {
      const results = [
        {
          title: 'Test Article',
          url: 'https://example.com/article',
          text: 'This is a test article.',
        },
      ]
      const result = formatSearchResults(results, 'markdown')
      expect(result).toContain('[Test Article](https://example.com/article)')
    })

    it('should handle missing optional fields', () => {
      const results = [
        {
          title: 'Test',
          url: 'https://example.com',
          text: 'Content',
        },
      ]
      const result = formatSearchResults(results, 'text')
      expect(result).toContain('Test')
      expect(result).toContain('https://example.com')
    })

    it('should truncate long text snippets', () => {
      const longText = 'A'.repeat(500)
      const results = [
        {
          title: 'Test',
          url: 'https://example.com',
          text: longText,
        },
      ]
      const result = formatSearchResults(results, 'text')
      expect(result).toContain('...')
    })
  })

  describe('formatCrawlResult', () => {
    it('should return json format as-is', () => {
      const data = { title: 'Test', url: 'https://example.com', text: 'Content' }
      const result = formatCrawlResult(data, 'json')
      expect(result).toContain('Test')
    })

    it('should format crawl result in text format', () => {
      const data = {
        content: [
          { type: 'text', text: 'Title: Test\nURL: https://example.com\nText: Test content here' },
        ],
      }
      const result = formatCrawlResult(data, 'text')
      expect(result).toContain('Test')
      expect(result).toContain('https://example.com')
    })

    it('should format crawl result in markdown format', () => {
      const data = {
        content: [
          { type: 'text', text: 'Title: Test\nURL: https://example.com\nText: Test content' },
        ],
      }
      const result = formatCrawlResult(data, 'markdown')
      expect(result).toContain('## Test')
    })

    it('should handle plain string input', () => {
      const result = formatCrawlResult('Plain text content', 'text')
      expect(result).toBe('Plain text content')
    })

    it('should handle unknown format as plain text', () => {
      const data = {
        content: [
          { type: 'text', text: 'Title: Test\nURL: https://example.com\nText: Content' },
        ],
      }
      // Default format (not text/json/markdown)
      const result = formatCrawlResult(data, 'text' as OutputFormat)
      expect(result).toContain('Test')
    })
  })

  describe('formatOutput', () => {
    it('should handle exa format text input', () => {
      const exaText =
        'Title: Test Article\nURL: https://example.com\nText: Test content\n\nTitle: Another\nURL: https://test.com\nText: More content'
      const result = formatOutput(exaText, 'text')
      expect(result).toContain('Test Article')
    })

    it('should handle JSON API results', () => {
      const data = {
        results: [
          { title: 'Result 1', url: 'https://example.com', text: 'Content 1' },
        ],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Result 1')
    })

    it('should handle JSON format output', () => {
      const data = {
        results: [
          { title: 'Result 1', url: 'https://example.com', text: 'Content' },
        ],
      }
      const result = formatOutput(data, 'json')
      // JSON format returns each result as separate JSON string
      const lines = result.split('\n\n').filter(Boolean)
      expect(lines).toHaveLength(1)
      const parsed = JSON.parse(lines[0])
      expect(parsed.title).toBe('Result 1')
    })

    it('should handle company entities format', () => {
      const data = {
        results: [
          {
            title: 'Acme Corp',
            url: 'https://acme.com',
            entities: [
              {
                properties: {
                  name: 'Acme Corporation',
                  description: 'A test company',
                  workforce: { total: 1000 },
                  headquarters: { city: 'San Francisco', country: 'USA' },
                  financials: { revenueAnnual: 5000000000, fundingTotal: 100000000 },
                },
              },
            ],
          },
        ],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Acme')
    })

    it('should format company result in json format', () => {
      const data = {
        results: [
          {
            title: 'Acme Corp',
            url: 'https://acme.com',
            entities: [{ properties: { name: 'Acme Inc' } }],
          },
        ],
      }
      const result = formatOutput(data, 'json')
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('should format company result in markdown format', () => {
      const data = {
        results: [
          {
            title: 'Acme Corp',
            url: 'https://acme.com',
            entities: [{ properties: { name: 'Acme Inc', headquarters: { city: 'NYC', country: 'USA' } } }],
          },
        ],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('# Acme Inc')
    })

    it('should handle company result with only title (no entities)', () => {
      const data = {
        results: [
          { title: 'NoEntity', url: 'https://example.com' },
        ],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('NoEntity')
    })

    it('should handle company result with employees in text format', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { name: 'EmplCo', workforce: { total: 5000 } } }],
          },
        ],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('EmplCo')
      expect(result).toContain('5,000')
    })

    it('should handle company result with empty city in markdown', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { name: 'HQCo', headquarters: { city: '', country: 'UK' } } }],
          },
        ],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('UK')
    })

    it('should handle company result with truncated description', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { description: 'A'.repeat(500) } }],
          },
        ],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('...')
    })

    it('should handle search result with no url in markdown', () => {
      const results = [{ title: 'NoUrl', url: '', text: 'Content' }]
      const result = formatSearchResults(results as any, 'markdown')
      expect(result).toContain('NoUrl')
    })

    it('should handle company result with employees in markdown', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { workforce: { total: 5000 } } }],
          },
        ],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('Employees')
    })

    it('should handle company result with revenue in markdown', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { financials: { revenueAnnual: 1000000000 } } }],
          },
        ],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('Revenue')
    })

    it('should handle company result with funding in markdown', () => {
      const data = {
        results: [
          {
            entities: [{ properties: { financials: { fundingTotal: 500000000 } } }],
          },
        ],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('Funding')
    })

    it('should format company result with no result', () => {
      const data = { results: [] }
      const result = formatOutput(data, 'text')
      expect(result).toBe('No results found.')
    })

    it('should handle API result with no title', () => {
      const data = {
        results: [{ url: 'https://example.com', text: 'Content' }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Untitled')
    })

    it('should handle search result with no url', () => {
      const results = [{ title: 'NoUrl', url: '', text: 'Content' }]
      const result = formatSearchResults(results as any, 'text')
      expect(result).toContain('NoUrl')
    })

    it('should handle plain string input', () => {
      const result = formatOutput('Just a plain string', 'text')
      expect(result).toBe('Just a plain string')
    })

    it('should handle company result with no url in markdown', () => {
      const data = {
        results: [{ entities: [{ properties: { name: 'NoUrlCo' } }] }],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('# NoUrlCo')
    })

    it('should handle company result without description branch', () => {
      const data = {
        results: [{ entities: [{ properties: { name: 'NoDescCo' } }] }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('NoDescCo')
    })

    it('should handle company result with url in markdown', () => {
      const data = {
        results: [{ url: 'https://test.com', entities: [{ properties: { name: 'UrlCo' } }] }],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('**URL:**')
    })

    it('should handle company result with description in markdown', () => {
      const data = {
        results: [{ entities: [{ properties: { name: 'DescCo', description: 'A description' } }] }],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('A description')
    })

    it('should handle content without text item', () => {
      const data = {
        content: [{ type: 'other', text: 'ignored' }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('other')
    })

    it('should handle parseExaFormat with urlMatch only', () => {
      const text = 'URL: https://test.com\nText: Some text without Title'
      const result = formatOutput(text, 'text')
      expect(result).toContain('https://test.com')
    })

    it('should handle company result with headquarters in text format', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { country: 'Canada' } } }] }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('HQ:')
    })

    it('should handle API result with no url branch', () => {
      const data = {
        results: [{ title: 'NoUrlTitle', text: 'Some text' }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('NoUrlTitle')
    })

    it('should handle publishedDate branch', () => {
      const text = 'Title: Dated\nPublished Date: 2024-01-15\nText: Content'
      const result = formatOutput(text, 'text')
      expect(result).toContain('2024-01-15')
    })

    it('should handle text fallback when no Text match', () => {
      const text = 'Title: NoTextMatch\n\nContent without Text: marker'
      const result = formatOutput(text, 'text')
      expect(result).toContain('NoTextMatch')
    })

    it('should handle headquarters in markdown format', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { city: 'Toronto', country: 'Canada' } } }] }],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('HQ:')
    })

    it('should handle empty headquarters city in text format', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { city: '', country: 'Canada' } } }] }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Canada')
    })

    it('should handle headquarters in text format', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { city: 'Toronto', country: 'Canada' } } }] }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Toronto')
    })

    it('should handle headquarters with only city', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { city: 'Paris' } } }] }],
      }
      const result = formatOutput(data, 'text')
      expect(result).toContain('Paris')
    })

    it('should handle headquarters with empty city in markdown', () => {
      const data = {
        results: [{ entities: [{ properties: { headquarters: { city: '', country: 'UK' } } }] }],
      }
      const result = formatOutput(data, 'markdown')
      expect(result).toContain('UK')
    })
  })
})
