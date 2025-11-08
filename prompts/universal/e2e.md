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

You are an expert test automation engineer. Generate comprehensive end-to-end tests for the following user journey using the Playwright MCP server tools.

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

**Instructions:**
1. Start by setting up test data using API requests
2. Navigate through the UI following the user journey
3. Validate each step of the journey
4. Verify data consistency between UI and API
5. Test error scenarios and edge cases
6. Clean up test data if needed

Generate the complete test flow using the MCP tools and provide comprehensive validation for the entire user journey.

## Example Usage

```
Generate E2E test for:
- User Journey: Create user via API, view in UI, edit via UI, verify in API, delete via UI
- Validate that UI actions reflect in API and vice versa
- Test error scenarios and data consistency
```

