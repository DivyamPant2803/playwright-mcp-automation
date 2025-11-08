import { ApiRequestTool } from '../types.js';

export const apiRequestTool: ApiRequestTool = {
  name: 'playwright_api_request',
  description: 'Make an API HTTP request and return the response',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'HTTP method',
        default: 'GET',
      },
      url: {
        type: 'string',
        description: 'The API endpoint URL',
      },
      headers: {
        type: 'object',
        description: 'HTTP headers as key-value pairs',
      },
      body: {
        type: 'object',
        description: 'Request body (will be JSON stringified)',
      },
    },
    required: ['url'],
  },
  handler: async (args: any) => {
    const { method = 'GET', url, headers = {}, body } = args;
    
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              data: responseData,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `API request failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

