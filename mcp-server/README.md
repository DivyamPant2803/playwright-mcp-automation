# Playwright MCP Server

Model Context Protocol server for Playwright browser automation, enabling AI agents to control browsers and interact with web applications.

## Installation

```bash
npm install
npm run build
```

## Configuration for Cursor

Add this to your Cursor MCP settings (usually in `~/.cursor/mcp.json` or workspace settings):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["/absolute/path/to/playwright-mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

Or if using npm script:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npm",
      "args": ["run", "start"],
      "cwd": "/absolute/path/to/playwright-mcp-server"
    }
  }
}
```

## Development

```bash
npm run dev
```

## Available Tools

- `playwright_navigate`: Navigate to a URL
- `playwright_click`: Click an element
- `playwright_fill`: Fill an input field
- `playwright_screenshot`: Take a screenshot
- `playwright_api_request`: Make an API request
- `playwright_wait_for`: Wait for a condition
- `playwright_get_text`: Get text content
- `playwright_assert`: Assert a condition

## Security

- Browser instances run in headless mode
- All operations are sandboxed
- API requests can be restricted via environment variables







