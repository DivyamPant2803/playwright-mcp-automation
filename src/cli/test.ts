#!/usr/bin/env node

/**
 * Playwright MCP Test CLI
 * Run tests with various options
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

async function runTests() {
  const args = process.argv.slice(2);
  const projectRoot = process.cwd();
  const playwrightConfig = join(projectRoot, 'playwright.config.ts');

  if (!existsSync(playwrightConfig)) {
    console.error('❌ playwright.config.ts not found. Run: npx playwright-mcp-init');
    process.exit(1);
  }

  try {
    // Parse arguments
    const testType = args.find(arg => ['api', 'ui', 'e2e'].includes(arg));
    const otherArgs = args.filter(arg => !['api', 'ui', 'e2e'].includes(arg));

    let command = 'npx playwright test';
    
    if (testType) {
      command += ` --project=${testType}`;
    }

    if (otherArgs.length > 0) {
      command += ` ${otherArgs.join(' ')}`;
    }

    console.log(`🧪 Running tests: ${command}\n`);
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
  } catch (error: any) {
    if (error.status !== 0) {
      process.exit(error.status || 1);
    }
    throw error;
  }
}

runTests().catch(console.error);

