import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector, validateTimeout, validateFillValue } from '../utils/input-validator.js';
import { getSafeErrorMessage } from '../utils/error-sanitizer.js';

export const fillTool: PlaywrightTool = {
  name: 'playwright_fill',
  description: 'Fill an input field with text',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector, text, or test ID to identify the input element',
      },
      value: {
        type: 'string',
        description: 'The text to fill into the input',
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for the element in milliseconds',
        default: 30000,
      },
    },
    required: ['selector', 'value'],
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    try {
    // Validate inputs
    const selector = validateSelector(args.selector);
    const value = validateFillValue(args.value);
    const timeout = validateTimeout(args.timeout ?? 30000);
    
    const page = await manager.getPage();
    
    let element;
    if (selector.startsWith('text=') || selector.startsWith('data-testid=')) {
      element = page.locator(selector);
    } else {
      element = page.locator(selector).first();
    }
    
    await element.fill(value, { timeout });
    return {
      content: [
        {
          type: 'text',
          text: `Filled ${selector} with: ${value}`,
        },
      ],
    };
    } catch (error: any) {
      const page = await manager.getPage().catch(() => null);
      const errorDetails: any = {
        message: getSafeErrorMessage(error),
        type: error?.name || 'Error',
        selector: args.selector,
        timestamp: new Date().toISOString(),
      };
      
      if (page) {
        try {
          errorDetails.pageUrl = page.url();
          errorDetails.pageTitle = await page.title().catch(() => 'unknown');
        } catch {
          // Ignore errors capturing page state
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Failed to fill element: ${getSafeErrorMessage(error)}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

