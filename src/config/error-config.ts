/**
 * Error Configuration Manager
 * Manages error capture settings with smart defaults
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { ErrorCaptureConfig, ProjectConfig } from '../types.js';
import { validatePath } from '../utils/path-validator.js';

export class ErrorConfig {
  private static instance: ErrorConfig;
  private config: ErrorCaptureConfig;
  private projectRoot: string;
  private configPath: string;

  private constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = resolve(projectRoot);
    this.configPath = join(this.projectRoot, 'playwright-mcp.config.json');
    this.config = this.loadConfig();
  }

  static getInstance(projectRoot?: string): ErrorConfig {
    if (!ErrorConfig.instance) {
      ErrorConfig.instance = new ErrorConfig(projectRoot);
    }
    return ErrorConfig.instance;
  }

  /**
   * Load configuration from file, environment variables, or use defaults
   */
  private loadConfig(): ErrorCaptureConfig {
    // Check environment variables first
    const envEnabled = process.env.PLAYWRIGHT_MCP_ERROR_CAPTURE_ENABLED;
    const envOutputDir = process.env.PLAYWRIGHT_MCP_ERROR_REPORT_DIR;
    const envFormats = process.env.PLAYWRIGHT_MCP_ERROR_FORMATS;

    // Try to load from config file
    if (existsSync(this.configPath)) {
      try {
        validatePath(this.configPath, this.projectRoot);
        const configContent = readFileSync(this.configPath, 'utf-8');
        const projectConfig: ProjectConfig = JSON.parse(configContent);
        
        if (projectConfig.errorCapture) {
          // Merge with environment variables (env takes precedence)
          return {
            enabled: envEnabled !== undefined ? envEnabled === 'true' : (projectConfig.errorCapture.enabled ?? true),
            outputDir: envOutputDir || projectConfig.errorCapture.outputDir || './test-results/error-reports',
            formats: envFormats 
              ? envFormats.split(',').map(f => f.trim()) as ('markdown' | 'html' | 'json')[]
              : (projectConfig.errorCapture.formats || ['markdown', 'html', 'json']),
          };
        }
      } catch (error) {
        // If config file parsing fails, use defaults
        console.warn('Could not load error capture config from file, using defaults');
      }
    }

    // Use defaults with environment variable overrides
    return {
      enabled: envEnabled !== undefined ? envEnabled === 'true' : true,
      outputDir: envOutputDir || './test-results/error-reports',
      formats: envFormats 
        ? envFormats.split(',').map(f => f.trim()) as ('markdown' | 'html' | 'json')[]
        : ['markdown', 'html', 'json'],
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ErrorCaptureConfig {
    return { ...this.config };
  }

  /**
   * Check if error capture is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * Get output directory (resolved to absolute path)
   */
  getOutputDir(): string {
    const dir = this.config.outputDir || './test-results/error-reports';
    return resolve(this.projectRoot, dir);
  }

  /**
   * Get enabled report formats
   */
  getFormats(): ('markdown' | 'html' | 'json')[] {
    return this.config.formats || ['markdown', 'html', 'json'];
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<ErrorCaptureConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  /**
   * Save configuration to file
   */
  private async saveConfig(): Promise<void> {
    try {
      let projectConfig: ProjectConfig = {};
      
      if (existsSync(this.configPath)) {
        try {
          validatePath(this.configPath, this.projectRoot);
          const configContent = readFileSync(this.configPath, 'utf-8');
          projectConfig = JSON.parse(configContent);
        } catch {
          // If file exists but can't be parsed, start fresh
          projectConfig = {};
        }
      }

      projectConfig.errorCapture = this.config;
      
      validatePath(this.configPath, this.projectRoot);
      writeFileSync(this.configPath, JSON.stringify(projectConfig, null, 2), 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to save error capture config: ${error.message}`);
    }
  }

  /**
   * Enable error capture
   */
  async enable(): Promise<void> {
    await this.updateConfig({ enabled: true });
  }

  /**
   * Disable error capture
   */
  async disable(): Promise<void> {
    await this.updateConfig({ enabled: false });
  }

  /**
   * Set report formats
   */
  async setFormats(formats: ('markdown' | 'html' | 'json')[] | 'all' | 'none'): Promise<void> {
    if (formats === 'all') {
      await this.updateConfig({ formats: ['markdown', 'html', 'json'] });
    } else if (formats === 'none') {
      await this.updateConfig({ formats: [] });
    } else {
      await this.updateConfig({ formats });
    }
  }

  /**
   * Reload configuration from file
   */
  reload(): void {
    this.config = this.loadConfig();
  }
}


