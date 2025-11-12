# @playwright-mcp/automation

**Lightweight Playwright MCP automation package - zero config, works with all AI IDEs**

## Quick Start (2 Minutes)

```bash
# Install
npm install -D @playwright-mcp/automation

# Initialize (auto-detects everything)
npx playwright-mcp-init

# Done! Start using prompts in your AI IDE
```

## Features

- ✅ **Zero Configuration**: Works out of the box with smart defaults
- ✅ **Lightweight**: < 5MB package size
- ✅ **Universal**: Works with all AI IDEs (Cursor, VS Code + Copilot, JetBrains, Codeium, etc.)
- ✅ **Auto-Detection**: Automatically detects project type, ports, frameworks
- ✅ **Smart Defaults**: No config file needed unless you want customization

## Installation

```bash
npm install -D @playwright-mcp/automation
npx playwright-mcp-init
```

That's it! The package will:
- Auto-detect your project type (React, Vue, Angular, .NET, Node.js)
- Auto-detect API and UI URLs
- Create test directories
- Generate Playwright config
- Configure MCP server for your IDE

## Usage with AI IDEs

### Universal Prompt Format

Works identically in **all AI IDEs** (Cursor, VS Code + Copilot, JetBrains AI, Codeium, etc.):

```
Using @playwright-mcp/automation prompts, generate API tests for /api/users
```

```
Using the UI test generation prompt from @playwright-mcp/automation, test the users page
```

```
Using the E2E test prompt from @playwright-mcp/automation, test the complete user registration flow
```

### Example: API Tests

```
Using @playwright-mcp/automation API prompt, generate tests for:
- Endpoint: /api/users
- Methods: GET, POST, PUT, DELETE
- Test scenarios: CRUD operations, validation errors, edge cases
```

### Example: UI Tests

```
Using @playwright-mcp/automation UI prompt, generate tests for:
- URL: http://localhost:5173/users
- Test: Form submission, data display, navigation
- Validate: Form validation, success messages, error states
```

### Example: E2E Tests

```
Using @playwright-mcp/automation E2E prompt, generate tests for:
- Journey: User registration → Email verification → Login → Dashboard
- Validate: Data consistency between UI and API at each step
```

## CLI Commands

```bash
# Initialize (one-time setup)
npx playwright-mcp-init

# Run tests
npx playwright-mcp-test          # Run all tests
npx playwright-mcp-test api      # Run API tests only
npx playwright-mcp-test ui       # Run UI tests only
npx playwright-mcp-test e2e      # Run E2E tests only

# Generate test prompts
npx playwright-mcp-generate api  # Show API test generation prompt
npx playwright-mcp-generate ui   # Show UI test generation prompt
npx playwright-mcp-generate e2e  # Show E2E test generation prompt
```

## Configuration (Optional)

The package works with **zero configuration**. A config file is only needed for customization:

```javascript
// playwright-mcp.config.js (optional)
export default {
  // All values auto-detected, only override if needed
  projectType: 'react',
  api: {
    url: 'http://localhost:5000',
  },
  ui: {
    url: 'http://localhost:5173',
  },
};
```

## IDE Support

### Cursor
- Auto-detected and configured
- MCP config generated at `.cursor/mcp.json`
- Restart Cursor after setup

### VS Code + GitHub Copilot
- Auto-detected and configured
- Config added to `.vscode/settings.json`
- Install MCP extension for VS Code
- Reload window

### JetBrains AI
- Auto-detected and configured
- Config generated at `.idea/mcp.xml`
- Install MCP plugin
- Restart IDE

### Codeium
- Uses VS Code configuration
- Works with Codeium extension

### Any Other AI IDE
- Prompts work universally
- Configure MCP server manually if needed
- See documentation for setup instructions

## Project Detection

The package automatically detects:
- **Project Type**: React, Vue, Angular, .NET, Node.js
- **Frameworks**: Vite, Webpack, CRA, Express, FastAPI
- **Ports**: Scans common ports (3000, 5000, 5173, 8000)
- **URLs**: From package.json scripts and .env files
- **IDE**: Cursor, VS Code, JetBrains

## Available MCP Tools

- `playwright_navigate`: Navigate to URLs
- `playwright_click`: Click elements
- `playwright_fill`: Fill form inputs
- `playwright_screenshot`: Capture screenshots
- `playwright_api_request`: Make API requests
- `playwright_wait_for`: Wait for conditions
- `playwright_get_text`: Extract text content
- `playwright_assert`: Assert conditions

## Package Structure

```
@playwright-mcp/automation/
├── prompts/universal/    # IDE-agnostic prompts
├── mcp-server/          # Bundled MCP server
└── dist/                # Compiled code
```

## Requirements

- Node.js 20+
- Playwright (peer dependency)
- TypeScript (optional, peer dependency)

## Security Considerations

### MCP Server Security

The Playwright MCP server is designed for **local use only**. It does not include authentication or authorization mechanisms.

**Important Security Notes:**
- ✅ The server should only run on localhost
- ✅ Never expose the MCP server to the public internet
- ✅ The server communicates via stdio, which is secure for local use
- ⚠️ If you need network access, implement proper authentication

### Environment Variables

The following environment variables control security settings:

- `ALLOWED_API_HOSTS`: Comma-separated list of allowed API hosts (prevents SSRF)
- `ALLOWED_UI_DOMAINS`: Comma-separated list of allowed UI domains
- `ALLOW_LOCALHOST`: Set to `true` to allow localhost connections (default: false)
- `API_REQUEST_TIMEOUT`: Timeout for API requests in milliseconds (default: 30000)
- `SCREENSHOT_OUTPUT_DIR`: Directory for screenshot output (default: `./test-results/screenshots`)
- `NODE_ENV`: Set to `production` to enable production security settings

### Security Features

- ✅ Path traversal protection on all file operations
- ✅ SSRF protection with URL validation
- ✅ HTTP header injection prevention
- ✅ Input validation and sanitization
- ✅ Error message sanitization (no stack traces in production)
- ✅ Request timeouts to prevent DoS
- ✅ Content-Type validation on API responses

## License

MIT

## Support

- **Documentation**: See `prompts/universal/README.md` for prompt usage
- **Issues**: Check troubleshooting section
- **IDE Setup**: See IDE-specific guides in documentation







