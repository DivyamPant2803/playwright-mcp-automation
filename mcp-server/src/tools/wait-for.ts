import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';

export const waitForTool: PlaywrightTool = {
  name: 'playwright_wait_for',
  description: 'Wait for a condition on the page (element, URL, or timeout)',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector to wait for element to appear',
      },
      url: {
        type: 'string',
        description: 'URL pattern to wait for navigation',
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait in milliseconds',
        default: 30000,
      },
      state: {
        type: 'string',
        enum: ['visible', 'hidden', 'attached', 'detached'],
        description: 'Element state to wait for',
        default: 'visible',
      },
    },
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    const { selector, url, timeout = 30000, state = 'visible' } = args;
    const page = await manager.getPage();
    
    if (url) {
      await page.waitForURL(url, { timeout });
      return {
        content: [
          {
            type: 'text',
            text: `Waited for URL: ${url}`,
          },
        ],
      };
    } else if (selector) {
      const element = page.locator(selector).first();
      await element.waitFor({ state: state as any, timeout });
      return {
        content: [
          {
            type: 'text',
            text: `Waited for element ${selector} to be ${state}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide either a selector or URL to wait for',
          },
        ],
        isError: true,
      };
    }
  },
};

