import { PlaywrightManager } from '../playwright-manager.js';
import { PlaywrightTool } from '../types.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { validatePath } from '../utils/path-validator.js';

export const screenshotTool: PlaywrightTool = {
  name: 'playwright_screenshot',
  description: 'Take a screenshot of the current page or a specific element',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'Optional CSS selector to screenshot a specific element. If not provided, screenshots the entire page',
      },
      path: {
        type: 'string',
        description: 'Optional file path to save the screenshot. If not provided, returns base64 encoded image',
      },
      fullPage: {
        type: 'boolean',
        description: 'Whether to take a full page screenshot',
        default: false,
      },
    },
  },
  handler: async (args: any, manager: PlaywrightManager) => {
    const { selector, path, fullPage = false } = args;
    const page = await manager.getPage();
    
    let buffer: Buffer;
    if (selector) {
      const element = page.locator(selector).first();
      buffer = await element.screenshot();
    } else {
      buffer = await page.screenshot({ fullPage });
    }
    
    if (path) {
      try {
        // Get project root or use configured output directory
        const projectRoot = process.cwd();
        const outputDir = process.env.SCREENSHOT_OUTPUT_DIR || join(projectRoot, 'test-results', 'screenshots');
        
        // Ensure output directory exists
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }
        
        // Validate path is within output directory
        const safePath = validatePath(path, outputDir);
        
        // Ensure directory exists
        const dir = dirname(safePath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        
        writeFileSync(safePath, buffer);
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot saved to ${safePath}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: `Failed to save screenshot: ${error.message}`,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Screenshot taken (${buffer.length} bytes)`,
          },
          {
            type: 'image',
            data: buffer.toString('base64'),
            mimeType: 'image/png',
          },
        ],
      };
    }
  },
};

