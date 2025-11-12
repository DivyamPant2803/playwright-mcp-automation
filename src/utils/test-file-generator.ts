/**
 * Test File Generator
 * Generates Playwright test files from executed test steps
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { validatePath } from './path-validator.js';

export interface ExecutedTestStep {
  tool: string;
  parameters: Record<string, any>;
  description: string;
  result?: any;
  success?: boolean;
  expectedResult?: string;
}

export interface TestFileGenerationRequest {
  testName: string;
  testType: 'api' | 'ui' | 'e2e';
  description: string;
  steps: ExecutedTestStep[];
  url?: string;
  endpoint?: string;
  outputDir?: string;
  projectRoot?: string;
}

export class TestFileGenerator {
  /**
   * Generate a Playwright test file from executed test steps
   */
  static generateTestFile(request: TestFileGenerationRequest): string {
    const { testName, testType, description, steps, url, endpoint } = request;
    
    const testContent = this.generateTestContent(testName, testType, description, steps, url, endpoint);
    return testContent;
  }

  /**
   * Generate and save a Playwright test file
   */
  static async saveTestFile(request: TestFileGenerationRequest): Promise<string> {
    const projectRoot = request.projectRoot || process.cwd();
    const outputDir = request.outputDir || this.getDefaultTestDir(request.testType, projectRoot);
    
    // Validate and ensure output directory exists
    let safeOutputDir: string;
    try {
      safeOutputDir = validatePath(outputDir, projectRoot);
    } catch (error: any) {
      throw new Error(`Invalid output directory: ${error.message}`);
    }

    if (!existsSync(safeOutputDir)) {
      mkdirSync(safeOutputDir, { recursive: true });
    }

    // Generate sanitized filename
    const sanitizedName = request.testName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    const filename = `${sanitizedName}.spec.ts`;
    const filepath = join(safeOutputDir, filename);

    // Generate test content
    const testContent = this.generateTestContent(
      request.testName,
      request.testType,
      request.description,
      request.steps,
      request.url,
      request.endpoint
    );

    // Write file
    writeFileSync(filepath, testContent, 'utf-8');
    
    return filepath;
  }

  /**
   * Get default test directory based on test type
   */
  private static getDefaultTestDir(testType: 'api' | 'ui' | 'e2e', projectRoot: string): string {
    return join(projectRoot, 'tests', testType);
  }

  /**
   * Generate test file content
   */
  private static generateTestContent(
    testName: string,
    testType: 'api' | 'ui' | 'e2e',
    description: string,
    steps: ExecutedTestStep[],
    url?: string,
    endpoint?: string
  ): string {
    const lines: string[] = [];
    
    // Add imports
    lines.push("import { test, expect } from '@playwright/test';");
    lines.push('');

    // Add test description
    lines.push(`/**`);
    lines.push(` * ${description}`);
    lines.push(` * Generated from executed test automation`);
    lines.push(` */`);
    lines.push('');

    // Generate test function
    const fixture = testType === 'api' ? 'request' : testType === 'e2e' ? 'page, request' : 'page';
    lines.push(`test('${testName}', async ({ ${fixture} }) => {`);

    // Add test steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepCode = this.convertStepToCode(step, testType, i + 1);
      
      if (stepCode) {
        lines.push('');
        lines.push(`  // Step ${i + 1}: ${step.description}`);
        lines.push(...stepCode.split('\n').map(line => `  ${line}`));
      }
    }

    lines.push('});');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Convert an executed test step to Playwright code
   */
  private static convertStepToCode(
    step: ExecutedTestStep,
    testType: 'api' | 'ui' | 'e2e',
    stepNumber: number
  ): string {
    const { tool, parameters } = step;
    const lines: string[] = [];

    switch (tool) {
      case 'playwright_navigate':
        if (parameters.url) {
          lines.push(`await page.goto('${this.escapeString(parameters.url)}');`);
        }
        break;

      case 'playwright_click':
        if (parameters.selector) {
          lines.push(`await page.click('${this.escapeString(parameters.selector)}');`);
        } else if (parameters.text) {
          lines.push(`await page.getByText('${this.escapeString(parameters.text)}').click();`);
        } else if (parameters.role && parameters.name) {
          lines.push(`await page.getByRole('${parameters.role}', { name: '${this.escapeString(parameters.name)}' }).click();`);
        }
        break;

      case 'playwright_fill':
        if (parameters.selector && parameters.value !== undefined) {
          lines.push(`await page.fill('${this.escapeString(parameters.selector)}', '${this.escapeString(String(parameters.value))}');`);
        } else if (parameters.label && parameters.value !== undefined) {
          lines.push(`await page.getByLabel('${this.escapeString(parameters.label)}').fill('${this.escapeString(String(parameters.value))}');`);
        }
        break;

      case 'playwright_wait_for':
        if (parameters.selector) {
          lines.push(`await page.waitForSelector('${this.escapeString(parameters.selector)}');`);
        } else if (parameters.text) {
          lines.push(`await page.waitForSelector('text=${this.escapeString(parameters.text)}');`);
        } else if (parameters.url) {
          lines.push(`await page.waitForURL('${this.escapeString(parameters.url)}');`);
        } else if (parameters.timeout) {
          lines.push(`await page.waitForTimeout(${parameters.timeout});`);
        }
        break;

      case 'playwright_get_text':
        if (parameters.selector) {
          lines.push(`const text = await page.textContent('${this.escapeString(parameters.selector)}');`);
          if (step.expectedResult) {
            lines.push(`expect(text).toContain('${this.escapeString(step.expectedResult)}');`);
          }
        }
        break;

      case 'playwright_assert':
        if (parameters.selector) {
          if (parameters.visible !== false) {
            lines.push(`await expect(page.locator('${this.escapeString(parameters.selector)}')).toBeVisible();`);
          }
        } else if (parameters.text) {
          lines.push(`await expect(page.getByText('${this.escapeString(parameters.text)}')).toBeVisible();`);
        } else if (parameters.url) {
          lines.push(`await expect(page).toHaveURL('${this.escapeString(parameters.url)}');`);
        }
        break;

      case 'playwright_screenshot':
        const screenshotPath = parameters.path || `screenshot-${stepNumber}.png`;
        lines.push(`await page.screenshot({ path: '${this.escapeString(screenshotPath)}' });`);
        break;

      case 'playwright_api_request':
        if (testType === 'api' || testType === 'e2e') {
          const method = (parameters.method || 'GET').toUpperCase();
          const apiUrl = parameters.url || parameters.endpoint || '';
          const headers = parameters.headers || {};
          const body = parameters.body;

          lines.push(`const response = await request.${method.toLowerCase()}('${this.escapeString(apiUrl)}', {`);
          
          if (Object.keys(headers).length > 0) {
            lines.push(`  headers: ${JSON.stringify(headers, null, 2).split('\n').join('\n  ')},`);
          }
          
          if (body) {
            if (typeof body === 'string') {
              try {
                // Try to parse as JSON for formatting
                const parsed = JSON.parse(body);
                lines.push(`  data: ${JSON.stringify(parsed, null, 2).split('\n').join('\n  ')},`);
              } catch {
                lines.push(`  data: ${JSON.stringify(body)},`);
              }
            } else {
              lines.push(`  data: ${JSON.stringify(body, null, 2).split('\n').join('\n  ')},`);
            }
          }
          
          lines.push(`});`);
          
          // Add status assertion if expected
          if (step.expectedResult) {
            const expectedStatus = this.extractExpectedStatus(step.expectedResult);
            if (expectedStatus) {
              lines.push(`expect(response.status()).toBe(${expectedStatus});`);
            }
          } else {
            lines.push(`expect(response.ok()).toBeTruthy();`);
          }
        }
        break;

      default:
        // Unknown tool - add comment
        lines.push(`// ${tool}: ${JSON.stringify(parameters)}`);
        break;
    }

    return lines.join('\n');
  }

  /**
   * Escape string for use in code
   */
  private static escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Extract expected status code from expected result string
   */
  private static extractExpectedStatus(expectedResult: string): number | null {
    const match = expectedResult.match(/\b(200|201|204|400|401|403|404|500)\b/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Generate test file template for AI to use
   */
  static generateTestFileTemplate(testType: 'api' | 'ui' | 'e2e'): string {
    const templates = {
      api: `import { test, expect } from '@playwright/test';

test('API test', async ({ request }) => {
  // Add your API test steps here
  const response = await request.get('/api/endpoint');
  expect(response.ok()).toBeTruthy();
});`,

      ui: `import { test, expect } from '@playwright/test';

test('UI test', async ({ page }) => {
  // Navigate to the page
  await page.goto('/path');
  
  // Add your UI test steps here
  await page.click('button');
  await expect(page.locator('.element')).toBeVisible();
});`,

      e2e: `import { test, expect } from '@playwright/test';

test('E2E test', async ({ page, request }) => {
  // Setup via API
  await request.post('/api/setup', { data: {} });
  
  // UI interactions
  await page.goto('/path');
  await page.click('button');
  
  // Verify via API
  const response = await request.get('/api/verify');
  expect(response.ok()).toBeTruthy();
});`
    };

    return templates[testType];
  }
}

