import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { validateNavigationUrl } from '../utils/url-validator.js';
import { getSafeErrorMessage } from '../utils/error-sanitizer.js';

export const navigateTool: PlaywrightTool = {
  name: 'playwright_navigate',
  description: 'Navigate to a URL in the browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to navigate to',
      },
      waitUntil: {
        type: 'string',
        enum: ['load', 'domcontentloaded', 'networkidle'],
        description: 'When to consider navigation succeeded',
        default: 'load',
      },
    },
    required: ['url'],
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    const { url, waitUntil = 'load' } = args;
    
    // Validate URL to prevent navigation to malicious or internal URLs
    const allowedDomains = process.env.ALLOWED_UI_DOMAINS?.split(',').filter(Boolean);
    let validatedUrl: URL;
    
    try {
      validatedUrl = validateNavigationUrl(url, allowedDomains);
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
    
    try {
    const page = await manager.getPage();
    await page.goto(validatedUrl.toString(), { waitUntil: waitUntil as any });
    return {
      content: [
        {
          type: 'text',
          text: `Navigated to ${validatedUrl.toString()}`,
        },
      ],
    };
    } catch (error: any) {
      const errorDetails = {
        message: getSafeErrorMessage(error),
        type: error?.name || 'Error',
        url: validatedUrl.toString(),
        waitUntil,
        timestamp: new Date().toISOString(),
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Navigation failed: ${getSafeErrorMessage(error)}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

