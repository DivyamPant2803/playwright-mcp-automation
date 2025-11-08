import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';

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
    const { selector, value, timeout = 30000 } = args;
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
  },
};

