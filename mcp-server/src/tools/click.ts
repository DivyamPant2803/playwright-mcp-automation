import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector, validateTimeout } from '../utils/input-validator.js';

export const clickTool: PlaywrightTool = {
  name: 'playwright_click',
  description: 'Click an element on the page using a selector',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector, text, or test ID to identify the element',
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for the element in milliseconds',
        default: 30000,
      },
    },
    required: ['selector'],
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    // Validate inputs
    const selector = validateSelector(args.selector);
    const timeout = validateTimeout(args.timeout ?? 30000);
    
    const page = await manager.getPage();
    
    // Try different selector strategies
    let element;
    if (selector.startsWith('text=') || selector.startsWith('data-testid=')) {
      element = page.locator(selector);
    } else {
      element = page.locator(selector).first();
    }
    
    await element.click({ timeout });
    return {
      content: [
        {
          type: 'text',
          text: `Clicked element: ${selector}`,
        },
      ],
    };
  },
};

