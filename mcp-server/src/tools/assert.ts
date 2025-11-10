import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector, validateTimeout } from '../utils/input-validator.js';

export const assertTool: PlaywrightTool = {
  name: 'playwright_assert',
  description: 'Assert a condition on the page (element visibility, text content, URL, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['visible', 'hidden', 'text', 'url', 'count'],
        description: 'Type of assertion',
      },
      selector: {
        type: 'string',
        description: 'CSS selector for element assertions',
      },
      expectedText: {
        type: 'string',
        description: 'Expected text content (for text assertion)',
      },
      expectedUrl: {
        type: 'string',
        description: 'Expected URL pattern (for URL assertion)',
      },
      expectedCount: {
        type: 'number',
        description: 'Expected count of elements (for count assertion)',
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait in milliseconds',
        default: 5000,
      },
    },
    required: ['type'],
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    // Validate inputs
    const type = args.type;
    const selector = args.selector ? validateSelector(args.selector) : undefined;
    const expectedText = args.expectedText;
    const expectedUrl = args.expectedUrl;
    const expectedCount = args.expectedCount;
    const timeout = validateTimeout(args.timeout ?? 5000);
    const page = await manager.getPage();
    
    try {
      switch (type) {
        case 'visible':
          if (!selector) {
            throw new Error('Selector is required for visible assertion');
          }
          await page.locator(selector).first().waitFor({ state: 'visible', timeout });
          return {
            content: [
              {
                type: 'text',
                text: `Assertion passed: Element ${selector} is visible`,
              },
            ],
          };
          
        case 'hidden':
          if (!selector) {
            throw new Error('Selector is required for hidden assertion');
          }
          await page.locator(selector).first().waitFor({ state: 'hidden', timeout });
          return {
            content: [
              {
                type: 'text',
                text: `Assertion passed: Element ${selector} is hidden`,
              },
            ],
          };
          
        case 'text':
          if (!selector || !expectedText) {
            throw new Error('Selector and expectedText are required for text assertion');
          }
          const actualText = await page.locator(selector).first().textContent();
          if (actualText?.includes(expectedText)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Assertion passed: Element ${selector} contains text "${expectedText}"`,
                },
              ],
            };
          } else {
            throw new Error(`Text assertion failed. Expected "${expectedText}", got "${actualText}"`);
          }
          
        case 'url':
          if (!expectedUrl) {
            throw new Error('expectedUrl is required for URL assertion');
          }
          const currentUrl = page.url();
          if (currentUrl.includes(expectedUrl)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Assertion passed: URL contains "${expectedUrl}"`,
                },
              ],
            };
          } else {
            throw new Error(`URL assertion failed. Expected URL containing "${expectedUrl}", got "${currentUrl}"`);
          }
          
        case 'count':
          if (!selector || expectedCount === undefined) {
            throw new Error('Selector and expectedCount are required for count assertion');
          }
          const count = await page.locator(selector).count();
          if (count === expectedCount) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Assertion passed: Found ${count} elements matching ${selector}`,
                },
              ],
            };
          } else {
            throw new Error(`Count assertion failed. Expected ${expectedCount}, got ${count}`);
          }
          
        default:
          throw new Error(`Unknown assertion type: ${type}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Assertion failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

