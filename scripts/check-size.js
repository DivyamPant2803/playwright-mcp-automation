#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

try {
  // Get package size
  const result = execSync('npm pack --dry-run --json', {
    cwd: packageRoot,
    encoding: 'utf-8'
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

