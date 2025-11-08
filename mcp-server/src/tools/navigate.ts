import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';

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
    const page = await manager.getPage();
    await page.goto(url, { waitUntil: waitUntil as any });
    return {
      content: [
        {
          type: 'text',
          text: `Navigated to ${url}`,
        },
      ],
    };
  },
};

