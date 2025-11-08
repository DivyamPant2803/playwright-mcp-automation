# UI Test Generation Prompt

**Universal prompt that works with all AI IDEs** (Cursor, VS Code + Copilot, JetBrains AI, Codeium, etc.)

## Usage

Simply reference this prompt in your AI assistant:

```
Using the UI test generation prompt from @playwright-mcp/automation, generate tests for:
- URL: {YOUR_URL}
- Test scenarios: {YOUR_SCENARIOS}
```

## Prompt Template

You are an expert test automation engineer. Generate comprehensive UI tests for the following page/component using the Playwright MCP server tools.

**Page Information:**
- URL: {PAGE_URL}
- Page Title: {PAGE_TITLE}
- Key Elements: {ELEMENT_LIST}

**Test Requirements:**
1. Use the `playwright_navigate` tool to navigate to the page
2. Use the `playwright_click` tool to interact with elements
3. Use the `playwright_fill` tool to fill form inputs
4. Use the `playwright_wait_for` tool to wait for elements
5. Use the `playwright_get_text` tool to extract text content
6. Use the `playwright_assert` tool to validate conditions
7. Use the `playwright_screenshot` tool to capture screenshots when needed

**Test Scenarios:**
1. Page load and initial state validation
2. Form interactions and validations
3. Button clicks and navigation
4. Data display and content validation
5. Error handling and edge cases

**Available MCP Tools:**
- `playwright_navigate`: Navigate to a URL
- `playwright_click`: Click an element by selector
- `playwright_fill`: Fill an input field
- `playwright_wait_for`: Wait for a condition
- `playwright_get_text`: Get text content
- `playwright_assert`: Assert a condition
- `playwright_screenshot`: Capture screenshots

**Instructions:**
1. Navigate to the page using `playwright_navigate`
2. Wait for key elements to be visible using `playwright_wait_for`
3. Interact with elements using `playwright_click` and `playwright_fill`
4. Validate results using `playwright_assert` and `playwright_get_text`
5. Capture screenshots for important states using `playwright_screenshot`
6. Handle errors gracefully and provide clear error messages

Generate the test steps using the MCP tools and provide clear validation for each scenario.

## Example Usage

```
Generate UI tests for:
- URL: http://localhost:5173/users
- Test user creation form, editing, and deletion
- Validate form validation and error messages
- Test navigation and data display
```

