// Export path for Playwright reporter
// Re-export from dist after build
// This allows importing as: @playwright-mcp/automation/reporters/error-reporter
// When installed, this file will be at: node_modules/@playwright-mcp/automation/reporters/error-reporter.js
// And dist will be at: node_modules/@playwright-mcp/automation/dist/reporters/error-reporter.js
export { default } from '../dist/reporters/error-reporter.js';

