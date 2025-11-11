/**
 * Configuration Manager
 * Zero-config system with smart defaults and optional config file
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { ProjectConfig } from '../types.js';
import { ProjectDetector } from '../detectors/project-detector.js';
import { validatePath } from '../utils/path-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigManager {
  private config: ProjectConfig | null = null;
  private configPath: string;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = resolve(projectRoot);
    // Changed to .json for security - only JSON files are allowed
    this.configPath = join(this.projectRoot, 'playwright-mcp.config.json');
  }

  /**
   * Get configuration with smart defaults
   * No config file required - uses auto-detection
   * Security: Only JSON config files are allowed (no JS execution)
   */
  async getConfig(): Promise<ProjectConfig> {
    if (this.config) {
      return this.config as ProjectConfig;
    }

    // Try to load from file first (only JSON files for security)
    if (existsSync(this.configPath)) {
      try {
        // Validate path to prevent path traversal
        validatePath(this.configPath, this.projectRoot);
        
        // Only allow JSON files - never execute JS code
        if (!this.configPath.endsWith('.json')) {
          throw new Error('Only JSON config files are allowed for security reasons');
        }
        
        // Read and parse JSON instead of importing JS
        const configContent = readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(configContent) as ProjectConfig;
        return this.config;
      } catch (error: any) {
        // Don't expose full error details in production
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? 'Could not load config file, using defaults'
          : `Could not load config file, using defaults: ${error.message}`;
        console.warn(errorMessage);
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
      errorCapture: {
        enabled: true,
        outputDir: './test-results/error-reports',
        formats: ['markdown', 'html', 'json'],
      },
    };

    return this.config;
  }

  /**
   * Generate config file (optional - only if user wants customization)
   * Security: Only generates JSON files (no JS execution)
   */
  async generateConfigFile(config?: Partial<ProjectConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const finalConfig = { ...currentConfig, ...config };

    // Only generate JSON files for security
    const configContent = JSON.stringify(finalConfig, null, 2);

    // Validate path before writing
    validatePath(this.configPath, this.projectRoot);
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

