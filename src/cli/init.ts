#!/usr/bin/env node

/**
 * Playwright MCP Init CLI
 * One-command setup with zero configuration
 */

import { ConfigManager } from '../config/config-manager.js';
import { ProjectDetector } from '../detectors/project-detector.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { validateDirectoryPath } from '../utils/path-validator.js';

async function init() {
  const projectRoot = resolve(process.cwd());
  const configManager = new ConfigManager(projectRoot);
  const detector = new ProjectDetector(projectRoot);

  console.log('🚀 Initializing Playwright MCP Automation...\n');

  try {
    // Auto-detect project
    console.log('📋 Detecting project configuration...');
    const detected = await detector.detect();
    
    console.log(`   ✓ Project type: ${detected.projectType}`);
    if (detected.uiFramework) {
      console.log(`   ✓ UI Framework: ${detected.uiFramework}`);
    }
    if (detected.apiType) {
      console.log(`   ✓ API Type: ${detected.apiType}`);
    }
    if (detected.uiUrl) {
      console.log(`   ✓ UI URL: ${detected.uiUrl}`);
    }
    if (detected.apiUrl) {
      console.log(`   ✓ API URL: ${detected.apiUrl}`);
    }

    // Get config (uses smart defaults)
    const config = await configManager.getConfig();

    // Create test directories if they don't exist
    const testDirs = [
      config.tests?.api || './tests/api',
      config.tests?.ui || './tests/ui',
      config.tests?.e2e || './tests/e2e',
    ];

    console.log('\n📁 Creating test directories...');
    for (const dir of testDirs) {
      try {
        // Validate path to prevent path traversal attacks
        const safeDir = validateDirectoryPath(dir, projectRoot);
        if (!existsSync(safeDir)) {
          mkdirSync(safeDir, { recursive: true });
          console.log(`   ✓ Created ${dir}`);
        }
      } catch (error: any) {
        console.error(`   ✗ Invalid path: ${dir} - ${error.message}`);
      }
    }

    // Generate or update Playwright config
    const playwrightConfigPath = join(projectRoot, 'playwright.config.ts');
    if (!existsSync(playwrightConfigPath)) {
      console.log('\n⚙️  Generating Playwright configuration...');
      const playwrightConfig = generatePlaywrightConfig(config);
      writeFileSync(playwrightConfigPath, playwrightConfig, 'utf-8');
      console.log(`   ✓ Created playwright.config.ts`);
    } else {
      // Update existing config to add error reporter if not present
      console.log('\n⚙️  Updating Playwright configuration...');
      const updated = updatePlaywrightConfig(playwrightConfigPath);
      if (updated) {
        console.log(`   ✓ Updated playwright.config.ts (added error reporter)`);
      } else {
        console.log(`   ✓ playwright.config.ts already has error reporter`);
      }
    }

    // Generate IDE config if needed
    const { IDEConfigGenerator } = await import('../utils/ide-config-generator.js');
    await IDEConfigGenerator.generate(projectRoot);
    
    const detection = (await import('../utils/ide-detector.js')).IDEDetector.detect();
    if (detection.ide !== 'unknown') {
      console.log('\n🔧 IDE Configuration:');
      console.log(IDEConfigGenerator.getSetupInstructions(detection.ide));
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Install Playwright browsers: npx playwright install');
    console.log('   2. Use prompts in your AI IDE:');
    console.log('      "Using @playwright-mcp/automation prompts, generate API tests for /api/users"');
    console.log('\n💡 Tip: No config file needed - everything works with smart defaults!');
  } catch (error: any) {
    console.error('❌ Error during initialization:', error.message);
    process.exit(1);
  }
}

function generatePlaywrightConfig(config: any): string {
  return `import { defineConfig, devices } from '@playwright/test';

const API_BASE_URL = process.env.API_URL || '${config.api?.url || 'http://localhost:5000'}';
const UI_BASE_URL = process.env.UI_URL || '${config.ui?.url || 'http://localhost:5173'}';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['@playwright-mcp/automation/reporters/error-reporter'],
  ],
  use: {
    baseURL: UI_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
  ],
});
`;
}

function updatePlaywrightConfig(configPath: string): boolean {
  try {
    const content = readFileSync(configPath, 'utf-8');
    
    // Check if error reporter is already present
    if (content.includes('@playwright-mcp/automation/reporters/error-reporter')) {
      return false; // Already present
    }
    
    // Find the reporter array - look for "reporter:" followed by an array
    const reporterIndex = content.indexOf('reporter:');
    if (reporterIndex === -1) {
      console.log('   ⚠️  Could not auto-update: no reporter property found in playwright.config.ts');
      console.log('   💡 Please manually add: [\'@playwright-mcp/automation/reporters/error-reporter\'] to your reporter array');
      return false;
    }
    
    // Find the opening bracket after "reporter:"
    const afterReporter = content.substring(reporterIndex);
    const bracketStart = afterReporter.indexOf('[');
    if (bracketStart === -1) {
      console.log('   ⚠️  Could not auto-update: no reporter array found in playwright.config.ts');
      console.log('   💡 Please manually add: [\'@playwright-mcp/automation/reporters/error-reporter\'] to your reporter array');
      return false;
    }
    
    // Find the matching closing bracket (handle nested brackets)
    let bracketCount = 0;
    let bracketEnd = bracketStart;
    for (let i = bracketStart; i < afterReporter.length; i++) {
      if (afterReporter[i] === '[') bracketCount++;
      if (afterReporter[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          bracketEnd = i;
          break;
        }
      }
    }
    
    if (bracketCount !== 0) {
      console.log('   ⚠️  Could not auto-update: malformed reporter array in playwright.config.ts');
      console.log('   💡 Please manually add: [\'@playwright-mcp/automation/reporters/error-reporter\'] to your reporter array');
      return false;
    }
    
    // Extract the array content
    const arrayContent = afterReporter.substring(bracketStart + 1, bracketEnd);
    const arrayStartPos = reporterIndex + bracketStart;
    const arrayEndPos = reporterIndex + bracketEnd;
    
    // Determine indentation
    const lines = arrayContent.split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const indentMatch = lastLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '    ';
    
    // Build the new reporter entry
    const reporterEntry = `${indent}['@playwright-mcp/automation/reporters/error-reporter'],`;
    
    // Check if we need to add a comma
    const needsComma = arrayContent.trim().length > 0 && !arrayContent.trim().endsWith(',');
    
    // Construct new content
    const beforeArray = content.substring(0, arrayEndPos);
    const afterArray = content.substring(arrayEndPos);
    const newArrayContent = arrayContent + 
      (needsComma ? ',' : '') + '\n' +
      reporterEntry;
    
    const newContent = content.substring(0, arrayStartPos + 1) + newArrayContent + afterArray;
    
    writeFileSync(configPath, newContent, 'utf-8');
    return true;
  } catch (error: any) {
    console.log(`   ⚠️  Could not auto-update playwright.config.ts: ${error.message}`);
    console.log('   💡 Please manually add: [\'@playwright-mcp/automation/reporters/error-reporter\'] to your reporter array');
    return false;
  }
}


init().catch(console.error);

