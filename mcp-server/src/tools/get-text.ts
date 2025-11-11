import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateSelector } from '../utils/input-validator.js';

export const getTextTool: PlaywrightTool = {
  name: 'playwright_get_text',
  description: 'Get the text content of an element or the page title',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector to get text from. If not provided, returns page title',
      },
      all: {
        type: 'boolean',
        description: 'If true and selector matches multiple elements, returns all text',
        default: false,
      },
    },
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    try {
    // Validate selector if provided
    const selector = args.selector ? validateSelector(args.selector) : undefined;
    const all = args.all ?? false;
    const page = await manager.getPage();
    
    if (!selector) {
      const title = await page.title();
      return {
        content: [
          {
            type: 'text',
            text: `Page title: ${title}`,
          },
        ],
      };
    }
    
    const element = page.locator(selector);
    let text: string;
    
    if (all) {
      const texts = await element.allTextContents();
      text = texts.join('\n');
    } else {
      text = await element.first().textContent() || '';
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Text from ${selector}: ${text}`,
        },
      ],
    };
    } catch (error: any) {
      const page = await manager.getPage().catch(() => null);
      const errorDetails: any = {
        message: error.message,
        stack: error.stack,
        type: error.name || 'Error',
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
              error: `Failed to get text: ${error.message}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

