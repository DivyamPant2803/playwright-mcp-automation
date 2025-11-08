# Universal Test Generation Prompts

These prompts are **IDE-agnostic** and work with **all AI coding assistants** including:
- Cursor
- VS Code + GitHub Copilot
- JetBrains AI Assistant
- Codeium
- Any other AI IDE

## How to Use

### Simple Reference Method

Just reference the prompt in your AI assistant:

```
Using @playwright-mcp/automation prompts, generate API tests for /api/users
```

```
Using the UI test generation prompt from @playwright-mcp/automation, test the users page
```

```
Using the E2E test prompt from @playwright-mcp/automation, test the complete user registration flow
```

### With Specific Details

Provide your specific requirements:

```
Using @playwright-mcp/automation API prompt, generate tests for:
- Endpoint: /api/products
- Methods: GET, POST, PUT, DELETE
- Test scenarios: CRUD operations, validation errors, edge cases
```

## Available Prompts

- **api.md**: API test generation
- **ui.md**: UI test generation  
- **e2e.md**: End-to-end test generation

## Key Features

- **Universal**: Works with any AI IDE
- **No IDE-specific code**: Pure markdown prompts
- **Model-agnostic**: Works with GPT-4, Claude, Gemini, etc.
- **Simple**: Just reference and provide details
- **Flexible**: Customize with your specific requirements

## Best Practices

1. **Be specific**: Provide exact endpoints, URLs, and scenarios
2. **Include context**: Mention your framework, expected behaviors
3. **Request validation**: Ask for specific validations
4. **Mention edge cases**: Include error scenarios and boundary conditions

## Examples

### API Testing
```
Using @playwright-mcp/automation API prompt:
- Endpoint: /api/users
- Test: GET all, POST create, PUT update, DELETE remove
- Validate: Response structure, status codes, error handling
```

### UI Testing
```
Using @playwright-mcp/automation UI prompt:
- URL: http://localhost:5173/users
- Test: Form submission, data display, navigation
- Validate: Form validation, success messages, error states
```

### E2E Testing
```
Using @playwright-mcp/automation E2E prompt:
- Journey: User registration → Email verification → Login → Dashboard
- Validate: Data consistency between UI and API at each step
```

