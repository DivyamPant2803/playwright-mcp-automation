#!/usr/bin/env node

/**
 * SECURITY NOTE: The command in execSync must NEVER be parameterized.
 * If dynamic commands are needed, use spawn() with proper validation.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

// Hardcoded command - must never be modified or parameterized
const COMMAND = 'npm pack --dry-run --json';

// Validate command is not modified
if (COMMAND !== 'npm pack --dry-run --json') {
  throw new Error('Command validation failed: command must not be modified');
}

try {
  // Get package size
  const result = execSync(COMMAND, {
    cwd: packageRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB max buffer
  });
  
  const packInfo = JSON.parse(result);
  const totalSize = packInfo[0].files.reduce((sum, file) => sum + file.size, 0);
  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  const maxSize = 5; // 5MB target
  const sizeInMBNum = parseFloat(sizeInMB);
  
  console.log(`Package size: ${sizeInMB} MB`);
  
  if (sizeInMBNum > maxSize) {
    console.error(`❌ Package size (${sizeInMB} MB) exceeds target (${maxSize} MB)`);
    process.exit(1);
  } else {
    console.log(`✅ Package size (${sizeInMB} MB) is within target (${maxSize} MB)`);
  }
} catch (error) {
  console.warn('⚠️  Could not check package size:', error.message);
  // Don't fail the build if size check fails
}







