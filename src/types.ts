/**
 * Shared TypeScript types for Exa CLI
 */

/**
 * Output format for search results
 */
export type OutputFormat = 'text' | 'json' | 'markdown';

/**
 * Configuration options for Exa API
 */
export interface ExaConfig {
  /** Exa API key */
  apiKey: string;
  /** Output format for results */
  output: OutputFormat;
  /** Default number of results to return */
  defaultNum: number;
}

/**
 * Search result from Exa API
 */
export interface SearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Title of the result */
  title: string;
  /** URL of the result */
  url: string;
  /** Text content/description */
  text: string;
  /** Published date (if available) */
  publishedDate?: string;
  /** Author (if available) */
  author?: string;
  /** Score/relevance (0-1) */
  score?: number;
}

/**
 * Search request options
 */
export interface SearchOptions {
  /** Search query string */
  query: string;
  /** Number of results to return */
  numResults?: number;
  /** Output format */
  output?: OutputFormat;
  /** Include highlights in results */
  highlights?: boolean;
  /** Domain filters */
  domains?: string[];
  /** Exclude domains */
  excludeDomains?: string[];
}

/**
 * MCP tool definition for Exa search
 */
export interface ExaTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: {
      query: { type: 'string'; description: string };
      numResults?: { type: 'number'; description: string };
    };
    required: string[];
  };
}
