/**
 * Test Generator Utility
 * Generates test prompts for AI agents
 */

import type { TestGenerationRequest } from '../types.js';
import { envConfig } from '../config/environment.js';

export class TestGenerator {
  private apiBaseUrl: string;
  private uiBaseUrl: string;

  constructor(apiBaseUrl?: string, uiBaseUrl?: string) {
    const config = envConfig.getConfig();
    this.apiBaseUrl = apiBaseUrl || config.apiUrl;
    this.uiBaseUrl = uiBaseUrl || config.uiUrl;
  }

  /**
   * Generate a prompt for API test generation
   */
  generateApiTestPrompt(request: TestGenerationRequest): string {
    return `You are an expert test automation engineer. **EXECUTE API tests immediately** for the following endpoint using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP tools. Use the MCP tools to perform actual API requests.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**Endpoint Information:**
- Base URL: ${this.apiBaseUrl}
- Endpoint: ${request.endpoint || 'Not specified'}
- Method: ${request.method || 'GET'}
- Description: ${request.description}

**Test Requirements:**
1. **IMMEDIATELY execute** the \`playwright_api_request\` tool to make HTTP requests
2. Test the following scenarios:
${request.scenarios?.map(s => `   - ${s}`).join('\n') || '   - Successful request (200/201 status)\n   - Invalid input validation (400 status)\n   - Not found scenarios (404 status)'}
3. Validate response structure and data
4. Test edge cases and boundary conditions

**Available MCP Tools:**
- \`playwright_api_request\`: Make HTTP requests (GET, POST, PUT, DELETE, PATCH) (EXECUTE THIS TOOL)
  - Parameters: method, url, headers, body
  - Returns: status, statusText, headers, data

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Use the \`playwright_api_request\` tool to execute each test scenario - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Validate the response status codes using the tool results
3. **EXECUTE**: Validate the response data structure using the tool results
4. **EXECUTE**: Test error cases with invalid inputs using the tool
5. Document any assumptions or limitations

**PHASE 1 - EXECUTION (Do this first):**
- Execute each test scenario immediately using the MCP tools
- Run the API requests now using the \`playwright_api_request\` tool
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically \`tests/api/\`)
- Use the following template structure:
  \`\`\`typescript
  import { test, expect } from '@playwright/test';
  
  test('Test Name', async ({ request }) => {
    // Convert executed steps to Playwright code
    const response = await request.get('/api/endpoint');
    expect(response.ok()).toBeTruthy();
    // etc.
  });
  \`\`\`
- The generated test file should be executable and match the executed test flow`;
  }

  /**
   * Generate a prompt for UI test generation
   */
  generateUITestPrompt(request: TestGenerationRequest): string {
    return `You are an expert test automation engineer. **EXECUTE UI tests immediately** for the following page/component using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP browser automation tools. Use the MCP tools to perform actual browser automation.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**Page Information:**
- URL: ${request.url || this.uiBaseUrl}
- Description: ${request.description}

**Test Requirements:**
1. **IMMEDIATELY execute** the \`playwright_navigate\` tool to navigate to the page
2. **IMMEDIATELY execute** the \`playwright_click\` tool to interact with elements
3. **IMMEDIATELY execute** the \`playwright_fill\` tool to fill form inputs
4. **IMMEDIATELY execute** the \`playwright_wait_for\` tool to wait for elements
5. **IMMEDIATELY execute** the \`playwright_get_text\` tool to extract text content
6. **IMMEDIATELY execute** the \`playwright_assert\` tool to validate conditions
7. **IMMEDIATELY execute** the \`playwright_screenshot\` tool to capture screenshots when needed

**Test Scenarios:**
${request.scenarios?.map(s => `   - ${s}`).join('\n') || '   - Page load and initial state validation\n   - Form interactions and validations\n   - Button clicks and navigation\n   - Data display and content validation'}

**Available MCP Tools:**
- \`playwright_navigate\`: Navigate to a URL (EXECUTE THIS TOOL)
- \`playwright_click\`: Click an element by selector (EXECUTE THIS TOOL)
- \`playwright_fill\`: Fill an input field (EXECUTE THIS TOOL)
- \`playwright_wait_for\`: Wait for a condition (EXECUTE THIS TOOL)
- \`playwright_get_text\`: Get text content (EXECUTE THIS TOOL)
- \`playwright_assert\`: Assert a condition (EXECUTE THIS TOOL)
- \`playwright_screenshot\`: Capture screenshots (EXECUTE THIS TOOL)

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Navigate to the page using \`playwright_navigate\` tool - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Wait for key elements to be visible using \`playwright_wait_for\` tool - CALL THE TOOL
3. **EXECUTE**: Interact with elements using \`playwright_click\` and \`playwright_fill\` tools - CALL THE TOOLS
4. **EXECUTE**: Validate results using \`playwright_assert\` and \`playwright_get_text\` tools - CALL THE TOOLS
5. **EXECUTE**: Capture screenshots for important states using \`playwright_screenshot\` tool - CALL THE TOOL
6. Handle errors gracefully and provide clear error messages

**PHASE 1 - EXECUTION (Do this first):**
- Execute each test step immediately using the MCP tools
- Run the tests in the browser now using the MCP browser automation tools
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically \`tests/ui/\`)
- Use the following template structure:
  \`\`\`typescript
  import { test, expect } from '@playwright/test';
  
  test('Test Name', async ({ page }) => {
    // Convert executed steps to Playwright code
    await page.goto('url');
    await page.click('selector');
    // etc.
  });
  \`\`\`
- The generated test file should be executable and match the executed test flow`;
  }

  /**
   * Generate a prompt for E2E test generation
   */
  generateE2ETestPrompt(request: TestGenerationRequest): string {
    return `You are an expert test automation engineer. **EXECUTE end-to-end tests immediately** for the following user journey using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP browser automation and API tools. Use the MCP tools to perform actual automation.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**User Journey:**
${request.description}

**Application Information:**
- UI URL: ${this.uiBaseUrl}
- API URL: ${this.apiBaseUrl}

**Test Requirements:**
1. Combine API and UI testing using MCP tools
2. Test complete user workflows from start to finish
3. Validate data consistency between UI and API
4. Test error scenarios and recovery
5. Validate state changes across the application

**Test Scenarios:**
${request.scenarios?.map(s => `   - ${s}`).join('\n') || '   - Complete user workflow\n   - Data consistency validation\n   - Error handling and recovery'}

**Available MCP Tools:**
- \`playwright_navigate\`: Navigate to URLs (EXECUTE THIS TOOL)
- \`playwright_click\`: Click elements (EXECUTE THIS TOOL)
- \`playwright_fill\`: Fill form inputs (EXECUTE THIS TOOL)
- \`playwright_api_request\`: Make API calls (EXECUTE THIS TOOL)
- \`playwright_wait_for\`: Wait for conditions (EXECUTE THIS TOOL)
- \`playwright_get_text\`: Extract text (EXECUTE THIS TOOL)
- \`playwright_assert\`: Assert conditions (EXECUTE THIS TOOL)
- \`playwright_screenshot\`: Capture screenshots (EXECUTE THIS TOOL)

**Test Strategy:**
1. Use \`playwright_api_request\` to set up test data via API
2. Use \`playwright_navigate\` to navigate to the UI
3. Use UI interaction tools to perform user actions
4. Use \`playwright_api_request\` to verify backend state
5. Use \`playwright_assert\` to validate UI state
6. Capture screenshots at key points

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Set up test data using \`playwright_api_request\` tool - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Navigate through the UI following the user journey using \`playwright_navigate\` - CALL THE TOOL
3. **EXECUTE**: Validate each step of the journey using \`playwright_assert\` and \`playwright_get_text\` - CALL THE TOOLS
4. **EXECUTE**: Verify data consistency between UI and API using both UI and API tools - CALL THE TOOLS
5. **EXECUTE**: Test error scenarios and edge cases using the tools - CALL THE TOOLS
6. Clean up test data if needed using \`playwright_api_request\` - CALL THE TOOL

**PHASE 1 - EXECUTION (Do this first):**
- Execute the complete test flow immediately using the MCP tools
- Run the tests in the browser and API now using the MCP tools
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically \`tests/e2e/\`)
- Use the following template structure:
  \`\`\`typescript
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
  \`\`\`
- The generated test file should be executable and match the executed test flow`;
  }

  /**
   * Generate a test prompt based on the request type
   */
  generatePrompt(request: TestGenerationRequest): string {
    switch (request.type) {
      case 'api':
        return this.generateApiTestPrompt(request);
      case 'ui':
        return this.generateUITestPrompt(request);
      case 'e2e':
        return this.generateE2ETestPrompt(request);
      default:
        throw new Error(`Unknown test type: ${request.type}`);
    }
  }
}







