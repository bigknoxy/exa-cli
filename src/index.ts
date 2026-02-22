#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { search, searchAdvanced, code, crawl, company, people, config, research, completion } from './commands/index.js'

const main = defineCommand({
  meta: {
    name: 'exa',
    version: '0.1.0',
    description: 'CLI for Exa search API - wraps Exa MCP tools',
  },
  subCommands: {
    search,
    'search-advanced': searchAdvanced,
    code,
    crawl,
    company,
    people,
    config,
    research,
    completion,
  },
})

runMain(main)
