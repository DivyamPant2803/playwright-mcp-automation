import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector, validateTimeout } from '../utils/input-validator.js';
import { validateNavigationUrl } from '../utils/url-validator.js';
import { getSafeErrorMessage } from '../utils/error-sanitizer.js';

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
      // Validate URL pattern
      const allowedDomains = process.env.ALLOWED_UI_DOMAINS?.split(',').filter(Boolean);
      
      try {
        // For URL patterns (not full URLs), we need to handle both cases
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // Full URL - validate it
          const validatedUrl = validateNavigationUrl(url, allowedDomains);
          await page.waitForURL(validatedUrl.toString(), { timeout });
        } else {
          // For URL patterns (regex-like), validate the pattern is safe
          // Only allow simple patterns, not complex regex
          if (/[<>"']/.test(url)) {
            throw new Error('Invalid URL pattern: contains unsafe characters');
          }
          // Additional validation: check for dangerous patterns
          if (/javascript:|data:|file:|ftp:/i.test(url)) {
            throw new Error('Invalid URL pattern: dangerous protocol detected');
          }
          await page.waitForURL(url, { timeout });
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `URL validation failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
      
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
        message: getSafeErrorMessage(error),
        type: error?.name || 'Error',
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
              error: `Wait operation failed: ${getSafeErrorMessage(error)}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

