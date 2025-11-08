/**
 * IDE Configuration Generator
 * Generates IDE-specific configuration files for MCP server
 */

import { IDEDetector, type IDE } from './ide-detector.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class IDEConfigGenerator {
  /**
   * Generate IDE configuration for MCP server
   */
  static async generate(projectRoot: string = process.cwd()): Promise<void> {
    const detection = IDEDetector.detect();
    
    if (!detection.needsConfig || detection.ide === 'unknown') {
      if (detection.ide === 'unknown') {
        console.log('ℹ️  IDE not detected. MCP server can still be configured manually.');
        console.log('   See documentation for IDE-specific setup instructions.');
      }
      return;
    }

    // Calculate MCP server path relative to project root
    const mcpServerPath = join(
      projectRoot,
      'node_modules',
      '@playwright-mcp',
      'automation',
      'mcp-server',
      'dist',
      'index.js'
    );

    const config = IDEDetector.generateConfig(detection.ide, mcpServerPath);
    
    if (!config || !detection.configPath) {
      return;
    }

    try {
      await IDEDetector.writeConfig(detection.ide, detection.configPath, config);
      console.log(`✅ Generated ${detection.ide} MCP configuration`);
      console.log(`   Config file: ${detection.configPath}`);
      
      if (detection.ide === 'vscode' || detection.ide === 'codeium') {
        console.log('   💡 Make sure you have the MCP extension installed in VS Code');
      }
    } catch (error: any) {
      console.warn(`⚠️  Could not generate ${detection.ide} config:`, error.message);
    }
  }

  /**
   * Get IDE-specific setup instructions
   */
  static getSetupInstructions(ide: IDE): string {
    switch (ide) {
      case 'cursor':
        return `Cursor MCP Configuration:
1. The MCP config has been generated at .cursor/mcp.json
2. Restart Cursor for changes to take effect
3. The Playwright MCP server will be available in Cursor's AI features`;

      case 'vscode':
      case 'codeium':
        return `VS Code / Codeium MCP Configuration:
1. Install the MCP extension for VS Code
2. The config has been added to .vscode/settings.json
3. Reload VS Code window
4. The Playwright MCP server will be available in Copilot/Codeium`;

      case 'jetbrains':
        return `JetBrains IDE Configuration:
1. The MCP config has been generated at .idea/mcp.xml
2. Install the MCP plugin for your JetBrains IDE
3. Restart your IDE
4. The Playwright MCP server will be available in AI Assistant`;

      default:
        return `Generic Setup:
1. Configure MCP server manually in your IDE settings
2. Use the MCP server path from node_modules/@playwright-mcp/automation/mcp-server/dist/index.js
3. See documentation for IDE-specific instructions`;
    }
  }
}

