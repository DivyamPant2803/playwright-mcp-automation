/**
 * Environment Configuration
 * Zero-config system with smart defaults
 */

export interface TestEnvironment {
  apiUrl: string;
  uiUrl: string;
  apiTimeout: number;
  uiTimeout: number;
  headless: boolean;
  slowMo: number;
  testEnv: 'development' | 'staging' | 'production';
  parallelWorkers: number;
  screenshotPath: string;
  videoPath: string;
  reportPath: string;
}

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: TestEnvironment;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadConfig(): TestEnvironment {
    const env = process.env.TEST_ENV || process.env.NODE_ENV || 'development';
    
    return {
      apiUrl: process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000',
      uiUrl: process.env.UI_URL || process.env.VITE_APP_URL || 'http://localhost:5173',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      uiTimeout: parseInt(process.env.UI_TIMEOUT || '30000', 10),
      headless: process.env.HEADLESS !== 'false',
      slowMo: parseInt(process.env.SLOW_MO || '0', 10),
      testEnv: env as 'development' | 'staging' | 'production',
      parallelWorkers: parseInt(process.env.PARALLEL_WORKERS || (process.env.CI ? '1' : '4'), 10),
      screenshotPath: process.env.SCREENSHOT_PATH || './test-results/screenshots',
      videoPath: process.env.VIDEO_PATH || './test-results/videos',
      reportPath: process.env.REPORT_PATH || './test-results',
    };
  }

  getConfig(): TestEnvironment {
    return { ...this.config };
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getUiUrl(): string {
    return this.config.uiUrl;
  }

  isHeadless(): boolean {
    return this.config.headless;
  }

  getTestEnv(): string {
    return this.config.testEnv;
  }
}

export const envConfig = EnvironmentConfig.getInstance();






