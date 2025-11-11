/**
 * Custom Playwright Reporter for Error Capture
 * Hooks into test failures and captures comprehensive error details
 */

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { ErrorCapture } from '../utils/error-capture.js';
import { ErrorConfig } from '../config/error-config.js';
import { ReportGenerator } from '../utils/report-generator.js';
import { platform, release } from 'os';
import { existsSync } from 'fs';
import { resolve, relative } from 'path';

class ErrorReporter implements Reporter {
  private errorConfig: ErrorConfig;

  constructor() {
    // Initialize error config from consuming app's directory
    this.errorConfig = ErrorConfig.getInstance(process.cwd());
  }

  onBegin(config: FullConfig, suite: Suite) {
    // Check if error capture is enabled
    if (!this.errorConfig.isEnabled()) {
      return;
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (!this.errorConfig.isEnabled()) {
      return;
    }

    // Only capture errors for failed tests
    if (result.status !== 'failed' && result.status !== 'timedOut') {
      return;
    }

    try {
      // Get project root (where playwright.config.ts is located)
      const projectRoot = process.cwd();
      
      // Create error capture instance
      const capture = new ErrorCapture();

      // Build error report
      // Convert TestError to Error if needed
      let error: Error | string = new Error('Test failed');
      if (result.error) {
        if (result.error instanceof Error) {
          error = result.error;
        } else {
          // TestError type - convert to Error
          error = new Error(result.error.message || 'Test failed');
          if (result.error.stack) {
            (error as Error).stack = result.error.stack;
          }
        }
      }
      
      const errorReport = await capture.buildErrorReport(
        {
          name: test.title,
          type: this.detectTestType(test),
          description: test.titlePath().join(' > '),
          duration: result.duration,
        },
        error,
        {
          browser: (test as any).project?.use?.browserName || 'unknown',
          os: `${platform()} ${release()}`,
          testEnv: process.env.TEST_ENV || process.env.NODE_ENV || 'development',
          apiUrl: process.env.API_URL || undefined,
          uiUrl: process.env.UI_URL || undefined,
        },
        {
          screenshots: this.getAttachmentPaths(result.attachments, 'screenshot', projectRoot),
          videos: this.getAttachmentPaths(result.attachments, 'video', projectRoot),
        }
      );

      // Generate reports in configured formats
      const outputDir = this.errorConfig.getOutputDir();
      const formats = this.errorConfig.getFormats();
      
      if (formats.length > 0) {
        await ReportGenerator.generateReports(errorReport, outputDir, formats, projectRoot);
      }
    } catch (reportError) {
      // Don't fail tests if report generation fails
      console.error('Failed to generate error report:', reportError);
    }
  }

  onEnd(result: FullResult) {
    // Cleanup if needed
  }

  /**
   * Detect test type from test path
   */
  private detectTestType(test: TestCase): 'api' | 'ui' | 'e2e' {
    const location = test.location.file;
    if (location.includes('/api/')) {
      return 'api';
    } else if (location.includes('/e2e/')) {
      return 'e2e';
    } else if (location.includes('/ui/')) {
      return 'ui';
    }
    return 'e2e'; // Default
  }

  /**
   * Get attachment paths, resolving them relative to project root
   */
  private getAttachmentPaths(
    attachments: Array<{ name: string; path?: string; body?: Buffer }>,
    attachmentName: string,
    projectRoot: string
  ): string[] {
    return attachments
      .filter(a => a.name === attachmentName)
      .map(a => {
        if (!a.path) return '';
        
        // Resolve path relative to project root
        const resolvedPath = resolve(projectRoot, a.path);
        
        // Check if file exists
        if (existsSync(resolvedPath)) {
          // Return relative path from project root for cleaner reports
          return relative(projectRoot, resolvedPath);
        }
        
        // If absolute path doesn't exist, try the original path
        if (existsSync(a.path)) {
          return a.path;
        }
        
        // Return empty string if file doesn't exist
        return '';
      })
      .filter(Boolean);
  }
}

export default ErrorReporter;

