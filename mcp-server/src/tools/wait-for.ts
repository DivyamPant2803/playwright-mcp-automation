import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector, validateTimeout } from '../utils/input-validator.js';

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
    try {
    // Validate inputs
    const timeout = validateTimeout(args.timeout ?? 30000);
    const selector = args.selector ? validateSelector(args.selector) : undefined;
    const url = args.url;
    const state = args.state ?? 'visible';
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
    } catch (error: any) {
      const page = await manager.getPage().catch(() => null);
      const errorDetails: any = {
        message: error.message,
        stack: error.stack,
        type: error.name || 'Error',
        selector: args.selector,
        url: args.url,
        state: args.state,
        timeout: args.timeout,
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
              error: `Wait operation failed: ${error.message}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

