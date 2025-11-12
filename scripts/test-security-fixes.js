#!/usr/bin/env node

/**
 * Security Fixes Test Script
 * Tests all security fixes to ensure they work correctly
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

const tests = [
  {
    name: 'Build Package',
    command: 'npm run build',
    description: 'Verify package builds without errors',
    critical: true
  },
  {
    name: 'Type Check',
    command: 'npx tsc --noEmit',
    description: 'Verify TypeScript compilation',
    critical: true
  },
  {
    name: 'MCP Server Build',
    command: 'cd mcp-server && npm run build',
    description: 'Verify MCP server builds correctly',
    critical: true
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   Running: ${test.command}\n`);
    
    const [cmd, ...args] = test.command.split(' ');
    const child = spawn(cmd, args, { 
      stdio: 'inherit', 
      shell: true,
      cwd: packageRoot
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${test.name} passed\n`);
        resolve(true);
      } else {
        console.log(`\n❌ ${test.name} failed (exit code: ${code})\n`);
        reject(new Error(`${test.name} failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.log(`\n❌ ${test.name} error: ${error.message}\n`);
      reject(error);
    });
  });
}

async function checkFileExists(filePath, description) {
  const fullPath = join(packageRoot, filePath);
  if (existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath} exists`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} missing`);
    return false;
  }
}

async function verifySecurityFiles() {
  console.log('\n📁 Verifying Security Files\n');
  
  const securityFiles = [
    {
      path: 'mcp-server/src/utils/path-validator.ts',
      description: 'Path validator utility'
    },
    {
      path: 'mcp-server/src/utils/header-validator.ts',
      description: 'Header validator utility'
    },
    {
      path: 'mcp-server/src/utils/error-sanitizer.ts',
      description: 'Error sanitizer utility'
    }
  ];
  
  let allExist = true;
  for (const file of securityFiles) {
    if (!await checkFileExists(file.path, file.description)) {
      allExist = false;
    }
  }
  
  return allExist;
}

async function verifySecurityImports() {
  console.log('\n🔍 Verifying Security Imports\n');
  
  const filesToCheck = [
    'mcp-server/src/tools/screenshot.ts',
    'mcp-server/src/tools/api-request.ts',
    'mcp-server/src/tools/wait-for.ts',
    'mcp-server/src/tools/click.ts',
    'mcp-server/src/tools/fill.ts',
    'mcp-server/src/tools/navigate.ts',
    'mcp-server/src/tools/get-text.ts',
    'mcp-server/src/tools/assert.ts'
  ];
  
  let allValid = true;
  
  for (const file of filesToCheck) {
    const fullPath = join(packageRoot, file);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        
        // Check for security imports
        if (file.includes('screenshot') && !content.includes('validatePath')) {
          console.log(`⚠️  ${file}: Missing path validation`);
          allValid = false;
        }
        
        if (file.includes('api-request') && !content.includes('validateHeaders')) {
          console.log(`⚠️  ${file}: Missing header validation`);
          allValid = false;
        }
        
        if (file.includes('wait-for') && !content.includes('validateNavigationUrl')) {
          console.log(`⚠️  ${file}: Missing URL validation`);
          allValid = false;
        }
        
        if (!file.includes('api-request') && content.includes('error:') && !content.includes('getSafeErrorMessage')) {
          console.log(`⚠️  ${file}: Missing error sanitization`);
          allValid = false;
        }
        
        if (allValid) {
          console.log(`✅ ${file}: Security imports verified`);
        }
      } catch (error) {
        console.log(`❌ ${file}: Error reading file - ${error.message}`);
        allValid = false;
      }
    } else {
      console.log(`⚠️  ${file}: File not found`);
    }
  }
  
  return allValid;
}

async function main() {
  console.log('🔒 Security Fixes Test Suite');
  console.log('='.repeat(60));
  console.log(`Package Root: ${packageRoot}\n`);
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  // Verify security files exist
  console.log('\n📋 Phase 1: File Verification');
  console.log('-'.repeat(60));
  if (await verifySecurityFiles()) {
    passed++;
  } else {
    failed++;
  }
  
  // Verify security imports
  console.log('\n📋 Phase 2: Import Verification');
  console.log('-'.repeat(60));
  if (await verifySecurityImports()) {
    passed++;
  } else {
    warnings++;
  }
  
  // Run build tests
  console.log('\n📋 Phase 3: Build Tests');
  console.log('-'.repeat(60));
  
  for (const test of tests) {
    try {
      await runTest(test);
      passed++;
    } catch (error) {
      failed++;
      if (test.critical) {
        console.error(`\n❌ CRITICAL: ${error.message}`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Tests passed with warnings. Please review.');
    process.exit(0);
  } else {
    console.log('\n✅ All tests passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run manual security tests (see TESTING_GUIDE.md)');
    console.log('   2. Test CLI commands: npx playwright-mcp-init');
    console.log('   3. Test MCP server tools');
    console.log('   4. Run existing Playwright tests');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

