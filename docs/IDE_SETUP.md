# IDE Setup Guide

This guide shows how to set up the Playwright MCP server with different AI IDEs.

## Universal Setup

The package works with **all AI IDEs** using the same universal prompts. Just reference the prompts:

```
Using @playwright-mcp/automation prompts, generate tests for...
```

## Cursor

### Automatic Setup
Run `npx playwright-mcp-init` - it will auto-detect Cursor and configure it.

### Manual Setup
1. Create `.cursor/mcp.json` in your project root:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["./node_modules/@playwright-mcp/automation/mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

2. Restart Cursor
3. The Playwright MCP tools will be available in Cursor's AI features

### Usage
```
Using @playwright-mcp/automation prompts, generate API tests for /api/users
```

## VS Code + GitHub Copilot

### Automatic Setup
Run `npx playwright-mcp-init` - it will auto-detect VS Code and configure it.

### Manual Setup
1. Install the MCP extension for VS Code (if available)
2. Add to `.vscode/settings.json`:
```json
{
  "mcp.servers": {
    "playwright": {
      "command": "node",
      "args": ["./node_modules/@playwright-mcp/automation/mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

3. Reload VS Code window
4. Use Copilot with the prompts

### Usage
```
Using @playwright-mcp/automation prompts, generate UI tests for the users page
```

## JetBrains AI Assistant

### Automatic Setup
Run `npx playwright-mcp-init` - it will auto-detect JetBrains and configure it.

### Manual Setup
1. Install the MCP plugin for your JetBrains IDE
2. Create `.idea/mcp.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
  <component name="MCP">
    <servers>
      <server name="playwright" command="node" args="./node_modules/@playwright-mcp/automation/mcp-server/dist/index.js" />
    </servers>
  </component>
</project>
```

3. Restart your IDE
4. Use AI Assistant with the prompts

### Usage
```
Using @playwright-mcp/automation prompts, generate E2E tests for user registration flow
```

## Codeium

### Setup
Codeium uses VS Code configuration. Follow the VS Code setup instructions above.

### Usage
Same as VS Code - use the universal prompts.

## Generic AI Assistant

### Setup
If your IDE doesn't have MCP support, you can still use the prompts:

1. Reference the prompts directly:
```
Using the API test generation prompt from @playwright-mcp/automation, generate tests for /api/users
```

2. The AI will use the prompt structure to generate tests
3. You can manually execute the MCP tools if needed

### Usage
Simply reference the prompts in your AI assistant - they work universally.

## Troubleshooting

### MCP Server Not Found
- Ensure package is installed: `npm install -D @playwright-mcp/automation`
- Check MCP server path in config
- Verify `mcp-server/dist/index.js` exists

### IDE Not Detecting MCP
- Restart your IDE after configuration
- Check IDE-specific MCP extension/plugin is installed
- Verify config file syntax is correct

### Prompts Not Working
- Prompts work with any AI assistant - no MCP required
- Just reference: "Using @playwright-mcp/automation prompts..."
- The AI will use the prompt structure to generate tests






