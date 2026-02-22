import { homedir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

/**
 * Path to the config file (~/.exarc)
 */
export const CONFIG_FILE_PATH = join(homedir(), ".exarc");

/**
 * Shape of the configuration object
 */
export interface Config {
  apiKey?: string;
  output?: string;
  defaultNum?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Config = {
  output: "json",
  defaultNum: 10,
};

/**
 * Load configuration from ~/.exarc
 * @returns The loaded configuration or default config if file doesn't exist
 */
export function loadConfig(): Config {
  try {
    if (!existsSync(CONFIG_FILE_PATH)) {
      return { ...DEFAULT_CONFIG };
    }

    const content = readFileSync(CONFIG_FILE_PATH, "utf-8");
    const config = JSON.parse(content) as Partial<Config>;

    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...config,
    };
  } catch (error) {
    console.warn("Failed to load config, using defaults:", 
      error instanceof Error ? error.message : "Unknown error");
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration to ~/.exarc
 * @param config - The configuration to save
 */
export function saveConfig(config: Config): void {
  try {
    const content = JSON.stringify(config, null, 2);
    writeFileSync(CONFIG_FILE_PATH, content, "utf-8");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save config: ${errorMessage}`);
  }
}

/**
 * Update specific config values while preserving others
 * @param updates - Partial config to merge with existing config
 * @returns The updated configuration
 */
export function updateConfig(updates: Partial<Config>): Config {
  const currentConfig = loadConfig();
  const updatedConfig = { ...currentConfig, ...updates };
  saveConfig(updatedConfig);
  return updatedConfig;
}
