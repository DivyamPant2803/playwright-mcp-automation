/**
 * IDE Detector
 * Detects which IDE the user is using and generates appropriate configs
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { validatePath } from './path-validator.js';

export type IDE = 'cursor' | 'vscode' | 'jetbrains' | 'codeium' | 'unknown';

export interface IDEDetectionResult {
  ide: IDE;
  configPath?: string;
  needsConfig: boolean;
}

export class IDEDetector {
  /**
   * Detect which IDE is being used
   */
  static detect(): IDEDetectionResult {
    const cwd = process.cwd();

    // Check for Cursor
    if (existsSync(join(cwd, '.cursor'))) {
      return {
        ide: 'cursor',
        configPath: join(cwd, '.cursor', 'mcp.json'),
        needsConfig: !existsSync(join(cwd, '.cursor', 'mcp.json')),
      };
    }

    // Check for VS Code
    if (existsSync(join(cwd, '.vscode'))) {
      return {
        ide: 'vscode',
        configPath: join(cwd, '.vscode', 'settings.json'),
        needsConfig: true, // Always generate MCP config for VS Code
      };
    }

    // Check for JetBrains
    if (existsSync(join(cwd, '.idea'))) {
      return {
        ide: 'jetbrains',
        configPath: join(cwd, '.idea', 'mcp.xml'),
        needsConfig: !existsSync(join(cwd, '.idea', 'mcp.xml')),
      };
    }

    // Check for Codeium (uses VS Code config)
    if (existsSync(join(cwd, '.codeium'))) {
      return {
        ide: 'codeium',
        configPath: join(cwd, '.vscode', 'settings.json'),
        needsConfig: true,
      };
    }

    return {
      ide: 'unknown',
      needsConfig: false,
    };
  }

  /**
   * Generate IDE-specific MCP configuration
   */
  static generateConfig(ide: IDE, mcpServerPath: string): string | null {
    const cwd = resolve(process.cwd());
    // Use proper path resolution instead of string replacement
    const relativePath = relative(cwd, resolve(mcpServerPath));

    switch (ide) {
      case 'cursor':
        return JSON.stringify({
          mcpServers: {
            playwright: {
              command: 'node',
              args: [relativePath],
              env: {
                NODE_ENV: 'production',
              },
            },
          },
        }, null, 2);

      case 'vscode':
      case 'codeium':
        // VS Code uses settings.json with MCP extension
        return JSON.stringify({
          'mcp.servers': {
            playwright: {
              command: 'node',
              args: [relativePath],
              env: {
                NODE_ENV: 'production',
              },
            },
          },
        }, null, 2);

      case 'jetbrains':
        // JetBrains uses XML format
        return `<?xml version="1.0" encoding="UTF-8"?>
<project>
  <component name="MCP">
    <servers>
      <server name="playwright" command="node" args="${relativePath}" />
    </servers>
  </component>
</project>`;

      default:
        return null;
    }
  }

  /**
   * Write IDE configuration file
   */
  static async writeConfig(ide: IDE, configPath: string, content: string): Promise<void> {
    const cwd = resolve(process.cwd());
    
    // Validate config path to prevent path traversal
    let safeConfigPath: string;
    try {
      safeConfigPath = validatePath(configPath, cwd);
    } catch (error: any) {
      throw new Error(`Invalid config path: ${error.message}`);
    }
    
    // Use proper path resolution instead of string manipulation
    const dir = dirname(safeConfigPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // For VS Code, merge with existing settings.json
    if (ide === 'vscode' || ide === 'codeium') {
      if (existsSync(safeConfigPath)) {
        try {
          const existing = JSON.parse(readFileSync(safeConfigPath, 'utf-8'));
          const newConfig = JSON.parse(content);
          const merged = { ...existing, ...newConfig };
          writeFileSync(safeConfigPath, JSON.stringify(merged, null, 2), 'utf-8');
          return;
        } catch {
          // If merge fails, write new file
        }
      }
    }

    writeFileSync(safeConfigPath, content, 'utf-8');
  }
}






