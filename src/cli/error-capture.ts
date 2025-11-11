#!/usr/bin/env node

/**
 * Error Capture CLI
 * Manage error capture settings
 */

import { ErrorConfig } from '../config/error-config.js';
import { resolve } from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const projectRoot = resolve(process.cwd());
  const errorConfig = ErrorConfig.getInstance(projectRoot);

  try {
    switch (command) {
      case 'enable':
        await errorConfig.enable();
        console.log('✅ Error capture enabled');
        break;

      case 'disable':
        await errorConfig.disable();
        console.log('✅ Error capture disabled');
        break;

      case 'status':
        const config = errorConfig.getConfig();
        console.log('\n📊 Error Capture Status:');
        console.log(`   Enabled: ${config.enabled ? '✅ Yes' : '❌ No'}`);
        console.log(`   Output Directory: ${errorConfig.getOutputDir()}`);
        console.log(`   Formats: ${errorConfig.getFormats().join(', ') || 'None'}`);
        break;

      case 'formats':
        const formatArgs = args.slice(1);
        if (formatArgs.length === 0) {
          console.error('❌ Error: Please specify formats (markdown, html, json, all, or none)');
          process.exit(1);
        }

        if (formatArgs[0] === 'all') {
          await errorConfig.setFormats('all');
          console.log('✅ All report formats enabled (markdown, html, json)');
        } else if (formatArgs[0] === 'none') {
          await errorConfig.setFormats('none');
          console.log('✅ All report formats disabled');
        } else {
          const formats = formatArgs.filter(f => ['markdown', 'html', 'json'].includes(f)) as ('markdown' | 'html' | 'json')[];
          if (formats.length === 0) {
            console.error('❌ Error: Invalid format. Use: markdown, html, json, all, or none');
            process.exit(1);
          }
          await errorConfig.setFormats(formats);
          console.log(`✅ Report formats set to: ${formats.join(', ')}`);
        }
        break;

      default:
        console.log('Usage: playwright-mcp-error-capture <command>');
        console.log('');
        console.log('Commands:');
        console.log('  enable              Enable error capture');
        console.log('  disable             Disable error capture');
        console.log('  status              Show current error capture status');
        console.log('  formats <formats>   Set report formats (markdown, html, json, all, none)');
        console.log('');
        console.log('Examples:');
        console.log('  playwright-mcp-error-capture enable');
        console.log('  playwright-mcp-error-capture formats markdown html');
        console.log('  playwright-mcp-error-capture formats all');
        console.log('  playwright-mcp-error-capture status');
        process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);


