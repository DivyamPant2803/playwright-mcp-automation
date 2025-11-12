import { ApiRequestTool } from '../types.js';
import { validateUrl } from '../utils/url-validator.js';
import { validateHeaders } from '../utils/header-validator.js';

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
    
    // Validate URL to prevent SSRF attacks
    const allowedHosts = process.env.ALLOWED_API_HOSTS?.split(',').filter(Boolean);
    const allowLocalhost = process.env.ALLOW_LOCALHOST === 'true';
    let validatedUrl: URL;
    
    try {
      validatedUrl = validateUrl(url, allowedHosts, allowLocalhost);
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
    
    // Validate headers to prevent header injection
    let validatedHeaders: Record<string, string>;
    try {
      validatedHeaders = validateHeaders(headers);
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Header validation failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    
    // Set up timeout
    const timeoutMs = parseInt(process.env.API_REQUEST_TIMEOUT || '30000', 10);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...validatedHeaders,
      },
      signal: controller.signal,
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(validatedUrl.toString(), fetchOptions);
      clearTimeout(timeoutId);
      const responseText = await response.text();
      
      // Validate Content-Type
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json') || 
                     contentType.includes('application/vnd.api+json');
      
      let responseData;
      if (isJson) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          // If Content-Type says JSON but parsing fails, return text
          responseData = responseText;
        }
      } else {
        // For non-JSON, return text (truncated if too long)
        responseData = responseText.length > 10000 
          ? responseText.substring(0, 10000) + '... (truncated)'
          : responseText;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              contentType: contentType,
              data: responseData,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: `API request timed out after ${timeoutMs}ms`,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
      
      const errorDetails = {
        message: error.message,
        // Don't expose stack trace in production
        type: error.name || 'Error',
        url: validatedUrl.toString(),
        method,
        timestamp: new Date().toISOString(),
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `API request failed: ${error.message}`,
              details: errorDetails,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
};

