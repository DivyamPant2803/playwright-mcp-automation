# E2E Test Generation Prompt

**Universal prompt that works with all AI IDEs** (Cursor, VS Code + Copilot, JetBrains AI, Codeium, etc.)

## Usage

Simply reference this prompt in your AI assistant:

```
Using the E2E test generation prompt from @playwright-mcp/automation, generate tests for:
- User Journey: {YOUR_JOURNEY}
- Validate: {YOUR_VALIDATION_REQUIREMENTS}
```

## Prompt Template

You are an expert test automation engineer. **EXECUTE end-to-end tests immediately** for the following user journey using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP browser automation and API tools. Use the MCP tools to perform actual automation.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**User Journey:**
{USER_JOURNEY_DESCRIPTION}

**Application Information:**
- UI URL: {UI_BASE_URL}
- API URL: {API_BASE_URL}
- User Flow: {USER_FLOW_STEPS}

**Test Requirements:**
1. Combine API and UI testing using MCP tools
2. Test complete user workflows from start to finish
3. Validate data consistency between UI and API
4. Test error scenarios and recovery
5. Validate state changes across the application

**Available MCP Tools:**
- `playwright_navigate`: Navigate to URLs
- `playwright_click`: Click elements
- `playwright_fill`: Fill form inputs
- `playwright_api_request`: Make API calls
- `playwright_wait_for`: Wait for conditions
- `playwright_get_text`: Extract text
- `playwright_assert`: Assert conditions
- `playwright_screenshot`: Capture screenshots

**Test Strategy:**
1. Use `playwright_api_request` to set up test data via API
2. Use `playwright_navigate` to navigate to the UI
3. Use UI interaction tools to perform user actions
4. Use `playwright_api_request` to verify backend state
5. Use `playwright_assert` to validate UI state
6. Capture screenshots at key points

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Set up test data using `playwright_api_request` tool - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Navigate through the UI following the user journey using `playwright_navigate` - CALL THE TOOL
3. **EXECUTE**: Validate each step of the journey using `playwright_assert` and `playwright_get_text` - CALL THE TOOLS
4. **EXECUTE**: Verify data consistency between UI and API using both UI and API tools - CALL THE TOOLS
5. **EXECUTE**: Test error scenarios and edge cases using the tools - CALL THE TOOLS
6. Clean up test data if needed using `playwright_api_request` - CALL THE TOOL

**PHASE 1 - EXECUTION (Do this first):**
- Execute the complete test flow immediately using the MCP tools
- Run the tests in the browser and API now using the MCP tools
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically `tests/e2e/`)
- Use the following template structure:
  ```typescript
  import { test, expect } from '@playwright/test';
  
  test('Test Name', async ({ page, request }) => {
    // Setup via API
    await request.post('/api/setup', { data: {} });
    
    // UI interactions
    await page.goto('/path');
    await page.click('button');
    
    // Verify via API
    const response = await request.get('/api/verify');
    expect(response.ok()).toBeTruthy();
  });
  ```
- The generated test file should be executable and match the executed test flow

## Example Usage

```
Generate E2E test for:
- User Journey: Create user via API, view in UI, edit via UI, verify in API, delete via UI
- Validate that UI actions reflect in API and vice versa
- Test error scenarios and data consistency
```







