/**
 * Configuration Manager
 * Zero-config system with smart defaults and optional config file
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ProjectConfig } from '../types.js';
import { ProjectDetector } from '../detectors/project-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigManager {
  private config: ProjectConfig | null = null;
  private configPath: string;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.configPath = join(projectRoot, 'playwright-mcp.config.js');
  }

  /**
   * Get configuration with smart defaults
   * No config file required - uses auto-detection
   */
  async getConfig(): Promise<ProjectConfig> {
    if (this.config) {
      return this.config as ProjectConfig;
    }

    // Try to load from file first
    if (existsSync(this.configPath)) {
      try {
        const configModule = await import(this.configPath);
        this.config = (configModule.default || configModule) as ProjectConfig;
        return this.config;
      } catch (error) {
        console.warn('Could not load config file, using defaults:', error);
      }
    }

    // Use smart defaults with auto-detection
    const detector = new ProjectDetector(this.projectRoot);
    const detected = await detector.detect();

    this.config = {
      projectType: detected.projectType,
      api: {
        url: detected.apiUrl || 'http://localhost:5000',
        type: detected.apiType,
      },
      ui: {
        url: detected.uiUrl || 'http://localhost:5173',
        framework: detected.uiFramework,
      },
      mcp: {
        enabled: true,
        serverPath: './node_modules/@playwright-mcp/automation/mcp-server/dist/index.js',
      },
      tests: {
        api: './tests/api',
        ui: './tests/ui',
        e2e: './tests/e2e',
      },
    };

    return this.config;
  }

  /**
   * Generate config file (optional - only if user wants customization)
   */
  async generateConfigFile(config?: Partial<ProjectConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const finalConfig = { ...currentConfig, ...config };

    const configContent = `// Playwright MCP Automation Configuration
// This file is optional - package works with zero config
// Only customize if you need to override auto-detected settings

export default ${JSON.stringify(finalConfig, null, 2)};
`;

    writeFileSync(this.configPath, configContent, 'utf-8');
    console.log(`✅ Config file generated at ${this.configPath}`);
  }

  /**
   * Check if config file exists
   */
  hasConfigFile(): boolean {
    return existsSync(this.configPath);
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}

