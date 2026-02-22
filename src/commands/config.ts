/**
 * Config command - Manage ~/.exarc configuration file
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { loadConfig, saveConfig } from '../lib/config.js'

const VALID_KEYS = ['apiKey', 'output', 'defaultNum'] as const
const VALID_OUTPUT_VALUES = ['text', 'json', 'markdown'] as const

type ValidKey = typeof VALID_KEYS[number]
type ValidOutput = typeof VALID_OUTPUT_VALUES[number]

export default defineCommand({
  meta: {
    name: 'config',
    description: 'Manage CLI configuration',
  },
  args: {
    action: {
      type: 'positional',
      required: true,
      description: 'Action to perform (set, get, list, clear)',
      value: (val: string) => {
        const validActions = ['set', 'get', 'list', 'clear']
        if (!validActions.includes(val)) {
          throw new Error(`Invalid action: ${val}. Valid actions: ${validActions.join(', ')}`)
        }
        return val
      },
    },
    key: {
      type: 'positional',
      required: false,
      description: 'Config key (apiKey, output, defaultNum)',
    },
    value: {
      type: 'positional',
      required: false,
      description: 'Config value',
    },
  },
  async run({ args }) {
    const { action, key, value } = args

    switch (action) {
      case 'list': {
        const config = loadConfig()
        consola.info('Current configuration:')
        consola.box(config)
        break
      }

      case 'get': {
        if (!key) {
          consola.error('Error: key is required for "get" action')
          process.exit(1)
        }
        
        if (!VALID_KEYS.includes(key as ValidKey)) {
          consola.error(`Invalid key: ${key}. Valid keys: ${VALID_KEYS.join(', ')}`)
          process.exit(1)
        }

        const config = loadConfig()
        const configKey = key as ValidKey
        const configValue = config[configKey]

        if (configValue === undefined) {
          consola.warn(`Config key "${key}" is not set`)
        } else {
          consola.info(`${key}: ${configValue}`)
        }
        break
      }

      case 'set': {
        if (!key || value === undefined) {
          consola.error('Error: both key and value are required for "set" action')
          process.exit(1)
        }

        if (!VALID_KEYS.includes(key as ValidKey)) {
          consola.error(`Invalid key: ${key}. Valid keys: ${VALID_KEYS.join(', ')}`)
          process.exit(1)
        }

        const configKey = key as ValidKey

        // Validate value based on key
        if (configKey === 'defaultNum') {
          const numValue = parseInt(String(value), 10)
          if (isNaN(numValue) || numValue < 1) {
            consola.error('Error: defaultNum must be a positive number')
            process.exit(1)
          }
        }

        if (configKey === 'output' && !VALID_OUTPUT_VALUES.includes(value as ValidOutput)) {
          consola.error(`Invalid output value: ${value}. Valid values: ${VALID_OUTPUT_VALUES.join(', ')}`)
          process.exit(1)
        }

        const config = loadConfig()
        
        // Parse value appropriately and set on config
        if (configKey === 'defaultNum') {
          config.defaultNum = parseInt(String(value), 10)
        } else if (configKey === 'apiKey') {
          config.apiKey = value as string
        } else if (configKey === 'output') {
          config.output = value as string
        }

        saveConfig(config)

        consola.success(`Set ${key} = ${value}`)
        break
      }

      case 'clear': {
        const defaultConfig = {
          output: 'json',
          defaultNum: 10,
        }
        saveConfig(defaultConfig)
        consola.success('Config cleared and reset to defaults')
        break
      }

      default:
        consola.error(`Unknown action: ${action}`)
        process.exit(1)
    }
  },
})
