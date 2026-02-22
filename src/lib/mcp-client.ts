import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import type { CallToolResult, ListToolsResult } from "@modelcontextprotocol/sdk/types.js"

const MCP_SERVER_URL = "https://mcp.exa.ai/mcp"

const ALL_TOOLS = [
  "web_search_exa",
  "web_search_advanced_exa",
  "get_code_context_exa",
  "crawling_exa",
  "company_research_exa",
  "people_search_exa",
  "deep_researcher_start",
  "deep_researcher_check",
].join(",")

export class ExaMcpClient {
  private client: Client | null = null
  private transport: StreamableHTTPClientTransport | SSEClientTransport | null = null
  private connected: boolean = false

  async connect(apiKey?: string): Promise<void> {
    if (this.connected && this.client) {
      return
    }

    const resolvedApiKey = apiKey || process.env.EXA_API_KEY

    try {
      const params = new URLSearchParams()
      params.set("tools", ALL_TOOLS)
      if (resolvedApiKey) {
        params.set("exaApiKey", resolvedApiKey)
      }
      const url = `${MCP_SERVER_URL}?${params.toString()}`

      this.client = new Client({
        name: "exa-cli",
        version: "1.0.0",
      })

      try {
        this.transport = new StreamableHTTPClientTransport(new URL(url))
        await this.client.connect(this.transport)
        this.connected = true
        return
      } catch (httpError) {
        console.warn("StreamableHTTP failed, trying SSE:", httpError instanceof Error ? httpError.message : "Unknown")
      }

      try {
        this.transport = new SSEClientTransport(new URL(url))
        await this.client.connect(this.transport)
        this.connected = true
        return
      } catch (sseError) {
        console.warn("SSE transport failed:", sseError instanceof Error ? sseError.message : "Unknown")
      }

      throw new Error("Failed to connect with both transport types")
    } catch (error) {
      this.connected = false
      this.client = null
      this.transport = null
      throw new Error(`Failed to connect to Exa MCP: ${error instanceof Error ? error.message : "Unknown"}`)
    }
  }

  async listTools(): Promise<ListToolsResult> {
    if (!this.client || !this.connected) {
      throw new Error("Not connected. Call connect() first.")
    }
    const result = await this.client.listTools()
    return result as ListToolsResult
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.client || !this.connected) {
      throw new Error("Not connected. Call connect() first.")
    }
    const result = await this.client.callTool({ name, arguments: args })
    return result as CallToolResult
  }

  isConnected(): boolean {
    return this.connected
  }

  async close(): Promise<void> {
    if (this.client && this.connected) {
      try {
        await this.client.close()
      } catch {
        // Ignore close errors
      }
    }
    this.client = null
    this.transport = null
    this.connected = false
  }
}

let mcpClientInstance: ExaMcpClient | null = null

export function getMcpClient(): ExaMcpClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new ExaMcpClient()
  }
  return mcpClientInstance
}

export function createMcpClient(): ExaMcpClient {
  return new ExaMcpClient()
}

export type { CallToolResult, ListToolsResult }
