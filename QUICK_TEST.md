# Quick Testing Guide

## Fastest Way to Test (3 Steps)

### 1. Build the package
```bash
cd playwright-mcp-automation-package
npm run build
```

### 2. Link the package
```bash
npm link
```

### 3. Test in your project
```bash
cd /path/to/your/test-project
npm link playwright-mcp-automation
npm install @playwright/test
npx playwright-mcp-init
```

That's it! The package is now available in your test project.

---

## Quick Test Commands

```bash
# Initialize
npx playwright-mcp-init

# Generate prompts
npx playwright-mcp-generate api
npx playwright-mcp-generate ui
npx playwright-mcp-generate e2e

# Run tests
npx playwright-mcp-test api
```

---

## Automated Test

Run the automated test script:

```bash
./test-all.sh
```

This will:
- ✅ Build the package
- ✅ Verify CLI commands exist
- ✅ Test with npm link
- ✅ Verify files are created correctly

---

## Alternative: Use npm pack

```bash
# Create tarball
npm pack

# Install in test project
cd /path/to/test-project
npm install /path/to/playwright-mcp-automation-1.0.1.tgz
```

---

## Unlink When Done

```bash
# In test project
npm unlink playwright-mcp-automation

# In package directory
npm unlink
```

---

For detailed testing instructions, see [LOCAL_TESTING.md](./LOCAL_TESTING.md)

