#!/usr/bin/env node

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

// Build CLI binaries
const cliFiles = ['init', 'test', 'generate'];

for (const cliFile of cliFiles) {
  const binPath = join(packageRoot, 'bin', `${cliFile}.js`);
  const sourcePath = join(packageRoot, 'dist', 'cli', `${cliFile}.js`);
  
  // Create executable wrapper
  const wrapper = `#!/usr/bin/env node

import('../dist/cli/${cliFile}.js').catch(err => {
  console.error('Error loading CLI:', err);
  process.exit(1);
});
`;

  writeFileSync(binPath, wrapper, 'utf-8');
  
  // Make executable (Unix-like systems)
  try {
    const { execSync } = await import('child_process');
    execSync(`chmod +x "${binPath}"`, { cwd: packageRoot });
  } catch {
    // Ignore chmod errors on Windows
  }
}

console.log('✅ CLI binaries built');

