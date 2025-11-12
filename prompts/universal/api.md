# API Test Generation Prompt

**Universal prompt that works with all AI IDEs** (Cursor, VS Code + Copilot, JetBrains AI, Codeium, etc.)

## Usage

Simply reference this prompt in your AI assistant:

```
Using the API test generation prompt from @playwright-mcp/automation, generate tests for:
- Endpoint: {YOUR_ENDPOINT}
- Methods: {GET, POST, PUT, DELETE}
- Test scenarios: {YOUR_SCENARIOS}
```

## Prompt Template

You are an expert test automation engineer. **EXECUTE API tests immediately** for the following endpoint using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP tools. Use the MCP tools to perform actual API requests.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**Endpoint Information:**
- Base URL: {API_BASE_URL}
- Endpoint: {ENDPOINT}
- Method: {HTTP_METHOD}
- Request Body (if applicable): {REQUEST_BODY}
- Expected Response: {EXPECTED_RESPONSE}

**Test Requirements:**
1. Use the `playwright_api_request` tool to make HTTP requests
2. Test the following scenarios:
   - Successful request (200/201 status)
   - Invalid input validation (400 status)
   - Not found scenarios (404 status)
   - Error handling (500 status if applicable)
3. Validate response structure and data
4. Test edge cases and boundary conditions

**Available MCP Tools:**
- `playwright_api_request`: Make HTTP requests (GET, POST, PUT, DELETE, PATCH)
  - Parameters: method, url, headers, body
  - Returns: status, statusText, headers, data

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Use the `playwright_api_request` tool to execute each test scenario - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Validate the response status codes using the tool results
3. **EXECUTE**: Validate the response data structure using the tool results
4. **EXECUTE**: Test error cases with invalid inputs using the tool
5. Document any assumptions or limitations

**PHASE 1 - EXECUTION (Do this first):**
- Execute each test scenario immediately using the MCP tools
- Run the API requests now using the `playwright_api_request` tool
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically `tests/api/`)
- Use the following template structure:
  ```typescript
  import { test, expect } from '@playwright/test';
  
  test('Test Name', async ({ request }) => {
    // Convert executed steps to Playwright code
    const response = await request.get('/api/endpoint');
    expect(response.ok()).toBeTruthy();
    // etc.
  });
  ```
- The generated test file should be executable and match the executed test flow

## Example Usage

```
Generate API tests for:
- Endpoint: /api/users
- Methods: GET, POST, PUT, DELETE
- Test CRUD operations with proper validation
- Edge cases: empty strings, invalid email formats, duplicate entries
```







