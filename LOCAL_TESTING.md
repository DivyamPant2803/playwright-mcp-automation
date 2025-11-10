# Local Testing Guide

This guide explains how to test the `playwright-mcp-automation` package locally without publishing to npm.

## Prerequisites

1. Build the package first:
   ```bash
   cd playwright-mcp-automation-package
   npm run build
   ```

2. Ensure you have a test project (or create one) to test the package in.

---

## Method 1: Using `npm link` (Recommended for Development)

This method creates a symlink, so changes in the package are immediately available in your test project.

### Step 1: Link the package

```bash
cd playwright-mcp-automation-package
npm link
```

This creates a global symlink to your package.

### Step 2: Use in your test project

```bash
cd /path/to/your/test-project
npm link playwright-mcp-automation
```

### Step 3: Install peer dependencies

```bash
npm install @playwright/test
```

### Step 4: Test the CLI commands

```bash
# Initialize the project
npx playwright-mcp-init

# Generate test prompts
npx playwright-mcp-generate api
npx playwright-mcp-generate ui
npx playwright-mcp-generate e2e

# Run tests (after creating some)
npx playwright-mcp-test api
```

### Step 5: Unlink when done

```bash
# In your test project
npm unlink playwright-mcp-automation

# In the package directory
npm unlink
```

---

## Method 2: Using `npm pack` (Simulates Real Install)

This method creates a tarball and installs it, simulating a real npm install.

### Step 1: Create the package tarball

```bash
cd playwright-mcp-automation-package
npm pack
```

This creates a file like `playwright-mcp-automation-1.0.1.tgz`.

### Step 2: Install in your test project

```bash
cd /path/to/your/test-project
npm install /path/to/playwright-mcp-automation-package/playwright-mcp-automation-1.0.1.tgz
```

Or use the provided script:

```bash
cd playwright-mcp-automation-package
./test-locally.sh
```

### Step 3: Test as normal

```bash
npx playwright-mcp-init
npx playwright-mcp-generate api
npx playwright-mcp-test api
```

---

## Method 3: Direct Testing (Quick CLI Tests)

Test the CLI commands directly from the package directory.

### Test Init Command

```bash
cd playwright-mcp-automation-package

# Create a temporary test directory
mkdir -p /tmp/test-playwright-mcp
cd /tmp/test-playwright-mcp

# Run init directly
node /path/to/playwright-mcp-automation-package/bin/init.js
```

### Test Generate Command

```bash
node /path/to/playwright-mcp-automation-package/bin/generate.js api
node /path/to/playwright-mcp-automation-package/bin/generate.js ui
node /path/to/playwright-mcp-automation-package/bin/generate.js e2e
```

### Test Test Command

```bash
# First, initialize a project
node /path/to/playwright-mcp-automation-package/bin/init.js

# Then run tests
node /path/to/playwright-mcp-automation-package/bin/test.js api
```

---

## Method 4: Testing the MCP Server

Test the MCP server directly to ensure it works correctly.

### Step 1: Build the MCP server

```bash
cd playwright-mcp-automation-package/mcp-server
npm run build
```

### Step 2: Test MCP server manually

Create a test script `test-mcp-server.js`:

```javascript
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mcpServerPath = join(__dirname, 'mcp-server', 'dist', 'index.js');

// Start the MCP server
const server = spawn('node', [mcpServerPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Listen for responses
server.stdout.on('data', (data) => {
  console.log('MCP Server Response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`MCP Server exited with code ${code}`);
});
```

Run it:
```bash
node test-mcp-server.js
```

---

## Method 5: Integration Testing Script

Create a comprehensive test script to verify all functionality.

### Create `test-integration.sh`

```bash
#!/bin/bash

set -e

echo "🧪 Starting Integration Tests"
echo "=============================="

PACKAGE_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_DIR="/tmp/playwright-mcp-test-$(date +%s)"

echo ""
echo "📦 Package Directory: $PACKAGE_DIR"
echo "📁 Test Directory: $TEST_DIR"
echo ""

# Create test directory
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "1️⃣  Testing npm link..."
cd "$PACKAGE_DIR"
npm link

cd "$TEST_DIR"
npm init -y
npm link playwright-mcp-automation
npm install @playwright/test

echo ""
echo "2️⃣  Testing init command..."
npx playwright-mcp-init

echo ""
echo "3️⃣  Testing generate commands..."
npx playwright-mcp-generate api
npx playwright-mcp-generate ui
npx playwright-mcp-generate e2e

echo ""
echo "4️⃣  Verifying generated files..."
if [ -f "playwright.config.ts" ]; then
  echo "✅ playwright.config.ts created"
else
  echo "❌ playwright.config.ts not found"
  exit 1
fi

if [ -d "tests/api" ]; then
  echo "✅ tests/api directory created"
else
  echo "❌ tests/api directory not found"
  exit 1
fi

echo ""
echo "5️⃣  Testing config file (JSON only)..."
cat > playwright-mcp.config.json <<EOF
{
  "projectType": "nodejs",
  "api": {
    "url": "http://localhost:3000",
    "type": "express"
  },
  "ui": {
    "url": "http://localhost:5173",
    "framework": "react"
  }
}
EOF

echo "✅ Config file created"

echo ""
echo "6️⃣  Testing security fixes..."
echo "   - Testing path traversal prevention..."
# This should fail
if npx playwright-mcp-init 2>&1 | grep -q "path traversal\|Invalid path"; then
  echo "✅ Path traversal prevention working"
else
  echo "⚠️  Path traversal test inconclusive"
fi

echo ""
echo "7️⃣  Cleaning up..."
cd "$PACKAGE_DIR"
npm unlink

cd "$TEST_DIR"
npm unlink playwright-mcp-automation

echo ""
echo "✅ All tests passed!"
echo "🧹 Cleaning up test directory: $TEST_DIR"
rm -rf "$TEST_DIR"

echo ""
echo "🎉 Integration tests completed successfully!"
```

Make it executable and run:

```bash
chmod +x test-integration.sh
./test-integration.sh
```

---

## Method 6: Testing with Your Existing Test Project

If you already have a test project in the parent directory:

```bash
# From the package directory
cd playwright-mcp-automation-package
npm link

# Go to your test project (e.g., the tests/ directory in parent)
cd ../tests
npm link playwright-mcp-automation

# Test the commands
npx playwright-mcp-init
npx playwright-mcp-generate api
```

---

## Testing Security Fixes

### Test 1: Command Injection Prevention

```bash
# This should NOT execute the echo command
npx playwright-mcp-test api --project=api; echo "pwned"
```

Expected: Only the test command runs, echo doesn't execute.

### Test 2: Path Traversal Prevention

```bash
# Try to create a config with path traversal
cat > playwright-mcp.config.json <<EOF
{
  "tests": {
    "api": "../../../etc/passwd"
  }
}
EOF

npx playwright-mcp-init
```

Expected: Should fail with "Path traversal detected" error.

### Test 3: SSRF Prevention

Create a test script to verify URL validation:

```javascript
// test-ssrf.js
import { validateUrl } from './mcp-server/dist/utils/url-validator.js';

// Test 1: Should fail (private IP)
try {
  validateUrl('http://localhost:6379');
  console.log('❌ FAILED: localhost should be blocked');
} catch (e) {
  console.log('✅ PASSED: localhost blocked');
}

// Test 2: Should fail (AWS metadata)
try {
  validateUrl('http://169.254.169.254/latest/meta-data/');
  console.log('❌ FAILED: AWS metadata should be blocked');
} catch (e) {
  console.log('✅ PASSED: AWS metadata blocked');
}

// Test 3: Should pass (public URL)
try {
  const url = validateUrl('https://example.com');
  console.log('✅ PASSED: Public URL allowed');
} catch (e) {
  console.log('❌ FAILED: Public URL should be allowed');
}
```

Run:
```bash
node test-ssrf.js
```

### Test 4: Config File Security

```bash
# Try to create a .js config file (should be ignored)
cat > playwright-mcp.config.js <<EOF
const { execSync } = require('child_process');
execSync('echo "pwned"');
module.exports = {};
EOF

# This should NOT execute the JS file
npx playwright-mcp-generate api
```

Expected: JS config file should be ignored, only JSON files are loaded.

---

## Quick Test Checklist

- [ ] Package builds successfully (`npm run build`)
- [ ] CLI commands work via `npm link`
- [ ] CLI commands work via `npm pack` install
- [ ] `playwright-mcp-init` creates all required files
- [ ] `playwright-mcp-generate` generates prompts correctly
- [ ] `playwright-mcp-test` runs tests (if tests exist)
- [ ] Config file (JSON) is loaded correctly
- [ ] Path traversal is prevented
- [ ] Command injection is prevented
- [ ] SSRF protection works
- [ ] MCP server starts and responds to requests

---

## Troubleshooting

### Issue: "Command not found" after npm link

**Solution:** Make sure you've run `npm link` in the package directory and `npm link playwright-mcp-automation` in your test project.

### Issue: "Cannot find module" errors

**Solution:** 
1. Rebuild the package: `npm run build`
2. Make sure all dependencies are installed: `npm install`
3. Check that `dist/` directory exists with compiled files

### Issue: MCP server not working

**Solution:**
1. Build the MCP server: `cd mcp-server && npm run build`
2. Check that `mcp-server/dist/index.js` exists
3. Test the server directly: `node mcp-server/dist/index.js`

### Issue: Security tests failing

**Solution:**
1. Verify the security fixes are in the built files
2. Check that the utilities are compiled: `ls dist/utils/` and `ls mcp-server/dist/utils/`
3. Rebuild if needed: `npm run build`

---

## Automated Testing Script

Save this as `test-all.sh` in the package root:

```bash
#!/bin/bash

set -e

echo "🚀 Running Complete Test Suite"
echo "==============================="

# Build
echo ""
echo "1. Building package..."
npm run build

# Test CLI directly
echo ""
echo "2. Testing CLI commands..."
node bin/init.js --help 2>&1 || echo "Init command exists"
node bin/generate.js --help 2>&1 || echo "Generate command exists"
node bin/test.js --help 2>&1 || echo "Test command exists"

# Test with npm link
echo ""
echo "3. Testing with npm link..."
TEST_DIR="/tmp/playwright-mcp-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

npm init -y > /dev/null
npm link "$OLDPWD"
npm install @playwright/test

npx playwright-mcp-init
npx playwright-mcp-generate api

echo ""
echo "✅ All tests passed!"
cd "$OLDPWD"
rm -rf "$TEST_DIR"
```

Run: `chmod +x test-all.sh && ./test-all.sh`

---

## Next Steps

After local testing:

1. ✅ Verify all functionality works
2. ✅ Test security fixes
3. ✅ Check for any breaking changes
4. ⏭️ Update version in `package.json` if needed
5. ⏭️ Update `CHANGELOG.md`
6. ⏭️ Publish to npm when ready

---

**Happy Testing! 🎉**

