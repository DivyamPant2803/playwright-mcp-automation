/**
 * @playwright-mcp/automation
 * 
 * Lightweight Playwright MCP automation package
 * Zero-config, works with all AI IDEs
 */

export { TestGenerator } from './generators/test-generator.js';
export { MCPTestRunner } from './runner/mcp-test-runner.js';
export { ProjectDetector } from './detectors/project-detector.js';
export { ConfigManager } from './config/config-manager.js';
export { envConfig } from './config/environment.js';
export { ErrorCapture } from './utils/error-capture.js';
export { ErrorConfig } from './config/error-config.js';
export { ReportGenerator } from './utils/report-generator.js';
export { default as ErrorReporter } from './reporters/error-reporter.js';

// Re-export types
export type { 
  TestGenerationRequest, 
  TestCase, 
  TestStep, 
  TestResult,
  ErrorCaptureConfig,
  ErrorReport,
  ErrorDetails,
  NetworkLog,
  ConsoleLog,
  DOMState
} from './types.js';






