#!/usr/bin/env node

/**
 * Playwright MCP Test CLI
 * Run tests with various options
 */

import { spawn } from 'child_process';
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
    // Parse arguments safely
    const testType = args.find(arg => ['api', 'ui', 'e2e'].includes(arg));
    
    // Whitelist of allowed Playwright arguments
    const allowedArgs = [
      '--grep', '--timeout', '--workers', '--headed', '--ui',
      '--debug', '--reporter', '--output-dir', '--retries', '--max-failures',
      '--list', '--project', '--grep-invert', '--global-timeout', '--forbid-only',
      '--fully-parallel', '--shard', '--update-snapshots', '--config'
    ];
    
    // Build safe argument array
    const safeArgs: string[] = ['test'];
    
    if (testType) {
      safeArgs.push('--project', testType);
    }
    
    // Filter and validate other arguments
    const otherArgs = args.filter(arg => !['api', 'ui', 'e2e'].includes(arg));
    for (const arg of otherArgs) {
      const argName = arg.split('=')[0];
      if (allowedArgs.includes(argName)) {
        if (arg.includes('=')) {
          const [key, value] = arg.split('=', 2);
          safeArgs.push(key, value);
        } else {
          safeArgs.push(argName);
        }
      }
    }

    console.log(`🧪 Running tests: npx playwright ${safeArgs.join(' ')}\n`);
    
    // Use spawn instead of execSync for safety (prevents command injection)
    const child = spawn('npx', ['playwright', ...safeArgs], {
      stdio: 'inherit',
      cwd: projectRoot,
      shell: false, // Important: don't use shell to prevent injection
    });

    child.on('error', (error) => {
      console.error('❌ Error running tests:', error.message);
      process.exit(1);
    });

    child.on('exit', (code) => {
      process.exit(code || 0);
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests().catch(console.error);






