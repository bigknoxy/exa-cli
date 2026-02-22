import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadConfig, saveConfig, updateConfig, CONFIG_FILE_PATH } from '../lib/config.js'

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}))

import { readFileSync, writeFileSync, existsSync } from 'fs'

describe('config.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock: file does not exist (for loadConfig default tests)
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(readFileSync).mockReturnValue('')
    vi.mocked(writeFileSync).mockImplementation(() => undefined)
  })

  describe('loadConfig', () => {
    it('should return default config when file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false)

      const result = loadConfig()

      expect(result).toEqual({
        output: 'json',
        defaultNum: 10,
      })
      expect(existsSync).toHaveBeenCalledWith(CONFIG_FILE_PATH)
    })

    it('should merge loaded config with defaults', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ apiKey: 'test-key', defaultNum: 5 })
      )

      const result = loadConfig()

      expect(result).toEqual({
        output: 'json',
        defaultNum: 5,
        apiKey: 'test-key',
      })
    })

    it('should use default values when loaded config has missing fields', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}))

      const result = loadConfig()

      expect(result).toEqual({
        output: 'json',
        defaultNum: 10,
      })
    })

    it('should return defaults when JSON parse fails', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue('invalid json')

      const result = loadConfig()

      expect(result).toEqual({
        output: 'json',
        defaultNum: 10,
      })
    })

    it('should handle arbitrary config fields', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ customField: 'value', anotherField: 123 })
      )

      const result = loadConfig()

      expect(result).toHaveProperty('customField', 'value')
      expect(result).toHaveProperty('anotherField', 123)
    })
  })

  describe('saveConfig', () => {
    it('should write config to file', () => {
      const config = { apiKey: 'test-key', output: 'text', defaultNum: 5 }

      saveConfig(config)

      expect(writeFileSync).toHaveBeenCalledWith(
        CONFIG_FILE_PATH,
        JSON.stringify(config, null, 2),
        'utf-8'
      )
    })

    it('should throw error when write fails', () => {
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('Permission denied')
      })

      expect(() => saveConfig({})).toThrow('Failed to save config: Permission denied')
    })
  })

  describe('updateConfig', () => {
    beforeEach(() => {
      // Reset mocks for updateConfig tests
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ output: 'text', defaultNum: 20 })
      )
      vi.mocked(writeFileSync).mockImplementation(() => undefined)
    })

    it('should load existing config, merge updates, and save', () => {
      const result = updateConfig({ output: 'json' })

      expect(readFileSync).toHaveBeenCalled()
      expect(writeFileSync).toHaveBeenCalled()
      expect(result).toEqual({
        output: 'json',
        defaultNum: 20,
      })
    })

    it('should preserve existing fields when updating partial config', () => {
      const result = updateConfig({ apiKey: 'new-key' })

      expect(result).toEqual({
        output: 'text',
        defaultNum: 20,
        apiKey: 'new-key',
      })
    })

    it('should add new fields when updating', () => {
      const result = updateConfig({ apiKey: 'new-api-key' })

      expect(result).toHaveProperty('apiKey', 'new-api-key')
    })
  })

  describe('roundtrip', () => {
    it('should save and load config correctly', () => {
      const config = { apiKey: 'roundtrip-test', output: 'markdown', defaultNum: 25 }

      saveConfig(config)

      // Clear mock to test fresh load
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(config))

      const loaded = loadConfig()

      expect(loaded).toEqual(config)
    })
  })
})
