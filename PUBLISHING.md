# Publishing Guide

This guide will help you publish `@playwright-mcp/automation` to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup) if you don't have one
2. **Login**: Authenticate with npm
   ```bash
   npm login
   ```

## Pre-Publishing Checklist

- [ ] Update version in `package.json` (use semantic versioning)
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Update `README.md` if needed
- [ ] Test the build: `npm run build`
- [ ] Test locally: `npm pack` and install in a test project
- [ ] Update repository URL in `package.json` (replace `yourusername`)

## Publishing Steps

### 1. Update Package Metadata

Edit `package.json` and update:
- `repository.url`: Replace `yourusername` with your GitHub username
- `author`: Add your name and email (optional)
- `version`: Use semantic versioning (1.0.0, 1.0.1, etc.)

### 2. Build the Package

```bash
cd playwright-mcp-automation-package
npm install
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Build the MCP server
- Build CLI executables
- Check package size

### 3. Test Locally (Recommended)

Create a test package and install it locally:

```bash
# Create a tarball
npm pack

# This creates: playwright-mcp-automation-1.0.0.tgz

# In a test project, install it:
cd /path/to/test-project
npm install /path/to/playwright-mcp-automation-package/playwright-mcp-automation-1.0.0.tgz
```

Test that everything works:
- `npx playwright-mcp-init` should work
- `npx playwright-mcp-generate` should show prompts
- `npx playwright-mcp-test` should run tests

### 4. Publish to npm

**For scoped packages** (`@playwright-mcp/automation`):

```bash
# Make sure you're logged in
npm whoami

# Publish (scoped packages are private by default, use --access public)
npm publish --access public
```

**Note**: If you want to publish as an unscoped package instead:
1. Change `name` in `package.json` from `@playwright-mcp/automation` to `playwright-mcp-automation`
2. Then run: `npm publish`

### 5. Verify Publication

```bash
# Check if package is published
npm view @playwright-mcp/automation

# Or visit
# https://www.npmjs.com/package/@playwright-mcp/automation
```

## Version Management

Use semantic versioning:

- **Patch** (1.0.0 → 1.0.1): Bug fixes
  ```bash
  npm version patch
  npm publish --access public
  ```

- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
  ```bash
  npm version minor
  npm publish --access public
  ```

- **Major** (1.0.0 → 2.0.0): Breaking changes
  ```bash
  npm version major
  npm publish --access public
  ```

## Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm login`
- For scoped packages, you may need to create an npm organization or use `--access public`

### "Package name already exists"

- The package name is taken. Either:
  - Use a different name
  - Use a scoped package: `@yourusername/playwright-mcp-automation`
  - Contact the owner of the existing package

### Build Errors

- Make sure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build:ts`
- Verify MCP server builds: `cd mcp-server && npm run build`

### Size Warnings

The package should be lightweight (< 5MB). If you get size warnings:
- Check what's included in the `files` array in `package.json`
- Run `npm run size-check` to see package size
- Remove unnecessary files from the package

## Post-Publishing

1. **Create a GitHub Release**: Tag the version and create release notes
2. **Update Documentation**: Update any docs that reference installation
3. **Announce**: Share on social media, forums, etc.

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish within 72 hours of publishing, and only if absolutely necessary.

```bash
npm unpublish @playwright-mcp/automation@1.0.0
```

For scoped packages:
```bash
npm unpublish @playwright-mcp/automation@1.0.0 --access public
```

## Continuous Publishing (CI/CD)

You can set up GitHub Actions to automatically publish on tags:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

