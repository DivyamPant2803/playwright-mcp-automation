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
    return `You are an expert test automation engineer. Generate comprehensive API tests for the following endpoint using the Playwright MCP server tools.

**Endpoint Information:**
- Base URL: ${this.apiBaseUrl}
- Endpoint: ${request.endpoint || 'Not specified'}
- Method: ${request.method || 'GET'}
- Description: ${request.description}

**Test Requirements:**
1. Use the \`playwright_api_request\` tool to make HTTP requests
2. Test the following scenarios:
${request.scenarios?.map(s => `   - ${s}`).join('\n') || '   - Successful request (200/201 status)\n   - Invalid input validation (400 status)\n   - Not found scenarios (404 status)'}
3. Validate response structure and data
4. Test edge cases and boundary conditions

**Available MCP Tools:**
- \`playwright_api_request\`: Make HTTP requests (GET, POST, PUT, DELETE, PATCH)
  - Parameters: method, url, headers, body
  - Returns: status, statusText, headers, data

**Instructions:**
1. Use the \`playwright_api_request\` tool to execute each test scenario
2. Validate the response status codes
3. Validate the response data structure
4. Test error cases with invalid inputs
5. Document any assumptions or limitations

Generate the test steps using the MCP tools and provide clear assertions for each scenario.`;
  }

  /**
   * Generate a prompt for UI test generation
   */
  generateUITestPrompt(request: TestGenerationRequest): string {
    return `You are an expert test automation engineer. Generate comprehensive UI tests for the following page/component using the Playwright MCP server tools.

**Page Information:**
- URL: ${request.url || this.uiBaseUrl}
- Description: ${request.description}

**Test Requirements:**
1. Use the \`playwright_navigate\` tool to navigate to the page
2. Use the \`playwright_click\` tool to interact with elements
3. Use the \`playwright_fill\` tool to fill form inputs
4. Use the \`playwright_wait_for\` tool to wait for elements
5. Use the \`playwright_get_text\` tool to extract text content
6. Use the \`playwright_assert\` tool to validate conditions
7. Use the \`playwright_screenshot\` tool to capture screenshots when needed

**Test Scenarios:**
${request.scenarios?.map(s => `   - ${s}`).join('\n') || '   - Page load and initial state validation\n   - Form interactions and validations\n   - Button clicks and navigation\n   - Data display and content validation'}

**Available MCP Tools:**
- \`playwright_navigate\`: Navigate to a URL
- \`playwright_click\`: Click an element by selector
- \`playwright_fill\`: Fill an input field
- \`playwright_wait_for\`: Wait for a condition
- \`playwright_get_text\`: Get text content
- \`playwright_assert\`: Assert a condition
- \`playwright_screenshot\`: Capture screenshots

**Instructions:**
1. Navigate to the page using \`playwright_navigate\`
2. Wait for key elements to be visible using \`playwright_wait_for\`
3. Interact with elements using \`playwright_click\` and \`playwright_fill\`
4. Validate results using \`playwright_assert\` and \`playwright_get_text\`
5. Capture screenshots for important states using \`playwright_screenshot\`
6. Handle errors gracefully and provide clear error messages

Generate the test steps using the MCP tools and provide clear validation for each scenario.`;
  }

  /**
   * Generate a prompt for E2E test generation
   */
  generateE2ETestPrompt(request: TestGenerationRequest): string {
    return `You are an expert test automation engineer. Generate comprehensive end-to-end tests for the following user journey using the Playwright MCP server tools.

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
- \`playwright_navigate\`: Navigate to URLs
- \`playwright_click\`: Click elements
- \`playwright_fill\`: Fill form inputs
- \`playwright_api_request\`: Make API calls
- \`playwright_wait_for\`: Wait for conditions
- \`playwright_get_text\`: Extract text
- \`playwright_assert\`: Assert conditions
- \`playwright_screenshot\`: Capture screenshots

**Test Strategy:**
1. Use \`playwright_api_request\` to set up test data via API
2. Use \`playwright_navigate\` to navigate to the UI
3. Use UI interaction tools to perform user actions
4. Use \`playwright_api_request\` to verify backend state
5. Use \`playwright_assert\` to validate UI state
6. Capture screenshots at key points

**Instructions:**
1. Start by setting up test data using API requests
2. Navigate through the UI following the user journey
3. Validate each step of the journey
4. Verify data consistency between UI and API
5. Test error scenarios and edge cases
6. Clean up test data if needed

Generate the complete test flow using the MCP tools and provide comprehensive validation for the entire user journey.`;
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

