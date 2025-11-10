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

You are an expert test automation engineer. Generate comprehensive API tests for the following endpoint using the Playwright MCP server tools.

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

**Instructions:**
1. Use the `playwright_api_request` tool to execute each test scenario
2. Validate the response status codes
3. Validate the response data structure
4. Test error cases with invalid inputs
5. Document any assumptions or limitations

Generate the test steps using the MCP tools and provide clear assertions for each scenario.

## Example Usage

```
Generate API tests for:
- Endpoint: /api/users
- Methods: GET, POST, PUT, DELETE
- Test CRUD operations with proper validation
- Edge cases: empty strings, invalid email formats, duplicate entries
```






