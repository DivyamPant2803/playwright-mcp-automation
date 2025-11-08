#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { PlaywrightManager } from './playwright-manager.js';
import { navigateTool } from './tools/navigate.js';
import { clickTool } from './tools/click.js';
import { fillTool } from './tools/fill.js';
import { screenshotTool } from './tools/screenshot.js';
import { apiRequestTool } from './tools/api-request.js';
import { waitForTool } from './tools/wait-for.js';
import { getTextTool } from './tools/get-text.js';
import { assertTool } from './tools/assert.js';

class PlaywrightMCPServer {
  private server: Server;
  private playwrightManager: PlaywrightManager;

  constructor() {
    this.server = new Server(
      {
        name: 'playwright-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.playwrightManager = new PlaywrightManager();

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        navigateTool,
        clickTool,
        fillTool,
        screenshotTool,
        apiRequestTool,
        waitForTool,
        getTextTool,
        assertTool,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: CallToolResult;
        switch (name) {
          case 'playwright_navigate':
            result = await navigateTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_click':
            result = await clickTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_fill':
            result = await fillTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_screenshot':
            result = await screenshotTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_api_request':
            result = await apiRequestTool.handler(args);
            break;
          case 'playwright_wait_for':
            result = await waitForTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_get_text':
            result = await getTextTool.handler(args, this.playwrightManager);
            break;
          case 'playwright_assert':
            result = await assertTool.handler(args, this.playwrightManager);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        return result;
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright MCP server running on stdio');
  }
}

const server = new PlaywrightMCPServer();
server.run().catch(console.error);

