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

// Re-export types
export type { TestGenerationRequest, TestCase, TestStep, TestResult } from './types.js';






