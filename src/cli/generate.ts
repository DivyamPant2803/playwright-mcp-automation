#!/usr/bin/env node

/**
 * Playwright MCP Generate CLI
 * Generate test prompts for AI agents
 */

import { TestGenerator } from '../generators/test-generator.js';
import { ConfigManager } from '../config/config-manager.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generate() {
  const args = process.argv.slice(2);
  const testType = args[0] as 'api' | 'ui' | 'e2e';

  if (!testType || !['api', 'ui', 'e2e'].includes(testType)) {
    console.log('Usage: playwright-mcp-generate <api|ui|e2e>');
    console.log('\nExamples:');
    console.log('  playwright-mcp-generate api');
    console.log('  playwright-mcp-generate ui');
    console.log('  playwright-mcp-generate e2e');
    process.exit(1);
  }

  try {
    const configManager = new ConfigManager();
    const config = await configManager.getConfig();
    
    const generator = new TestGenerator(
      config.api?.url,
      config.ui?.url
    );

    // Read prompt template
    const packageRoot = join(__dirname, '../..');
    const promptPath = join(
      packageRoot,
      'prompts/universal',
      `${testType}.md`
    );
    
    let promptTemplate = '';
    try {
      promptTemplate = readFileSync(promptPath, 'utf-8');
    } catch {
      // Fallback to generated prompt
      const request = {
        type: testType,
        description: `Generate ${testType} tests`,
      };
      promptTemplate = generator.generatePrompt(request);
    }

    console.log('📝 Test Generation Prompt:\n');
    console.log('─'.repeat(60));
    console.log(promptTemplate);
    console.log('─'.repeat(60));
    console.log('\n💡 Copy this prompt and use it with your AI assistant');
    console.log('   Example: "Using this prompt, generate tests for /api/users"');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generate().catch(console.error);

