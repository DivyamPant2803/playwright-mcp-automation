import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { PlaywrightManager } from './playwright-manager.js';

export interface PlaywrightTool extends Tool {
  handler: (args: any, manager: PlaywrightManager) => Promise<CallToolResult>;
}

export interface ApiRequestTool extends Tool {
  handler: (args: any) => Promise<CallToolResult>;
}

