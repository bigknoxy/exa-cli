#!/usr/bin/env node
import { createRequire } from 'node:module'
import { defineCommand, runMain } from 'citty'
import { search, searchAdvanced, code, crawl, company, people, config, research, completion } from './commands/index.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const main = defineCommand({
  meta: {
    name: 'exa',
    version: pkg.version,
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
