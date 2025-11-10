/**
 * Error Capture Utility
 * Collects comprehensive error details for test failures
 */

import type { Page, APIRequestContext } from '@playwright/test';
import type { ErrorDetails, NetworkLog, ConsoleLog, DOMState, ErrorReport } from '../types.js';

export class ErrorCapture {
  private networkLogs: NetworkLog[] = [];
  private consoleLogs: ConsoleLog[] = [];
  private testSteps: Array<{ step: number; description: string; tool?: string; timestamp: number }> = [];
  private page: Page | null = null;
  private requestContext: APIRequestContext | null = null;

  constructor(page?: Page, requestContext?: APIRequestContext) {
    this.page = page || null;
    this.requestContext = requestContext || null;
    this.setupConsoleCapture();
    this.setupNetworkCapture();
  }

  /**
   * Capture error details
   */
  captureError(error: Error | string): ErrorDetails {
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'Error',
      };
    }

    return {
      message: error.message,
      stack: error.stack,
      type: error.name,
      name: error.name,
    };
  }

  /**
   * Capture network log entry
   */
  captureNetworkLog(log: Omit<NetworkLog, 'timestamp'>): void {
    this.networkLogs.push({
      ...log,
      timestamp: Date.now(),
    });
  }

  /**
   * Capture console log entry
   */
  captureConsoleLog(log: Omit<ConsoleLog, 'timestamp'>): void {
    this.consoleLogs.push({
      ...log,
      timestamp: Date.now(),
    });
  }

  /**
   * Capture DOM state
   */
  async captureDOMState(): Promise<DOMState | null> {
    if (!this.page) {
      return null;
    }

    try {
      const url = this.page.url();
      const title = await this.page.title().catch(() => undefined);
      const html = await this.page.content().catch(() => undefined);

      // Capture visible elements (simplified - can be enhanced)
      const visibleElements: DOMState['visibleElements'] = [];
      try {
        const allElements = await this.page.locator('body *').all();
        for (const element of allElements.slice(0, 50)) { // Limit to first 50 elements
          try {
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              const selector = await element.evaluate((el) => {
                if (el.id) return `#${el.id}`;
                if (el.className) return `.${el.className.split(' ')[0]}`;
                return el.tagName.toLowerCase();
              }).catch(() => 'unknown');
              const text = await element.textContent().catch(() => undefined);
              visibleElements.push({
                selector,
                text: text?.substring(0, 100), // Limit text length
                visible: true,
              });
            }
          } catch {
            // Skip elements that can't be processed
          }
        }
      } catch {
        // If element capture fails, continue without it
      }

      return {
        url,
        title,
        html: html?.substring(0, 100000), // Limit HTML size
        visibleElements,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Add test step
   */
  addTestStep(step: number, description: string, tool?: string): void {
    this.testSteps.push({
      step,
      description,
      tool,
      timestamp: Date.now(),
    });
  }

  /**
   * Setup console log capture from browser
   */
  private setupConsoleCapture(): void {
    if (!this.page) {
      return;
    }

    this.page.on('console', (msg) => {
      const type = msg.type() as ConsoleLog['type'];
      const text = msg.text();
      const location = msg.location();

      this.captureConsoleLog({
        type,
        message: text,
        location: location ? {
          url: location.url,
          line: location.lineNumber,
          column: location.columnNumber,
        } : undefined,
      });
    });

    this.page.on('pageerror', (error) => {
      this.captureConsoleLog({
        type: 'error',
        message: error.message,
        args: [error.stack],
      });
    });
  }

  /**
   * Setup network request/response capture
   */
  private setupNetworkCapture(): void {
    if (!this.page) {
      return;
    }

    this.page.on('request', async (request) => {
      const url = request.url();
      const method = request.method();
      const headers = request.headers();
      let requestBody: any = undefined;

      try {
        const postData = request.postData();
        if (postData) {
          try {
            requestBody = JSON.parse(postData);
          } catch {
            requestBody = postData;
          }
        }
      } catch {
        // Ignore errors parsing request body
      }

      // Store request for later matching with response
      (request as any)._errorCaptureRequest = {
        url,
        method,
        requestHeaders: headers,
        requestBody,
        timestamp: Date.now(),
      };
    });

    this.page.on('response', async (response) => {
      const request = response.request();
      const requestData = (request as any)._errorCaptureRequest;
      if (!requestData) {
        return;
      }

      const status = response.status();
      const statusText = response.statusText();
      const headers = response.headers();
      let responseBody: any = undefined;

      try {
        const contentType = headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          responseBody = await response.json().catch(() => undefined);
        } else {
          const text = await response.text().catch(() => undefined);
          if (text) {
            responseBody = text.substring(0, 10000); // Limit response size
          }
        }
      } catch {
        // Ignore errors parsing response body
      }

      this.captureNetworkLog({
        url: requestData.url,
        method: requestData.method,
        status,
        statusText,
        requestHeaders: requestData.requestHeaders,
        responseHeaders: headers,
        requestBody: requestData.requestBody,
        responseBody,
        duration: Date.now() - requestData.timestamp,
      });
    });

    this.page.on('requestfailed', (request) => {
      const requestData = (request as any)._errorCaptureRequest;
      if (requestData) {
        this.captureNetworkLog({
          url: requestData.url,
          method: requestData.method,
          requestHeaders: requestData.requestHeaders,
          requestBody: requestData.requestBody,
          status: 0,
          statusText: 'Failed',
        });
      }
    });
  }

  /**
   * Build complete error report
   */
  async buildErrorReport(
    testInfo: {
      name: string;
      type: 'api' | 'ui' | 'e2e';
      description?: string;
      duration?: number;
    },
    error: Error | string,
    environment: {
      browser?: string;
      os?: string;
      testEnv?: string;
      apiUrl?: string;
      uiUrl?: string;
    },
    media?: {
      screenshots?: string[];
      videos?: string[];
    }
  ): Promise<ErrorReport> {
    const errorDetails = this.captureError(error);
    const domState = await this.captureDOMState();

    return {
      testInfo: {
        ...testInfo,
        timestamp: Date.now(),
      },
      error: errorDetails,
      networkLogs: this.networkLogs.length > 0 ? this.networkLogs : undefined,
      consoleLogs: this.consoleLogs.length > 0 ? this.consoleLogs : undefined,
      domState: domState || undefined,
      environment,
      testSteps: this.testSteps.length > 0 ? this.testSteps : undefined,
      media,
    };
  }

  /**
   * Reset capture state
   */
  reset(): void {
    this.networkLogs = [];
    this.consoleLogs = [];
    this.testSteps = [];
  }

  /**
   * Get current network logs
   */
  getNetworkLogs(): NetworkLog[] {
    return [...this.networkLogs];
  }

  /**
   * Get current console logs
   */
  getConsoleLogs(): ConsoleLog[] {
    return [...this.consoleLogs];
  }
}

