/**
 * Type definitions for @playwright-mcp/automation
 */

export interface TestGenerationRequest {
  type: 'api' | 'ui' | 'e2e';
  endpoint?: string;
  url?: string;
  method?: string;
  description: string;
  scenarios?: string[];
}

export interface TestStep {
  tool: string;
  parameters: Record<string, any>;
  expectedResult?: string;
  description: string;
}

export interface TestCase {
  name: string;
  description: string;
  steps: TestStep[];
  type: 'api' | 'ui' | 'e2e';
}

export interface TestResult {
  step: number;
  tool: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export interface ProjectConfig {
  projectType?: 'react' | 'vue' | 'angular' | 'dotnet' | 'nodejs' | 'unknown';
  api?: {
    url?: string;
    type?: 'dotnet' | 'express' | 'fastapi' | 'unknown';
  };
  ui?: {
    url?: string;
    framework?: 'react' | 'vue' | 'angular' | 'unknown';
  };
  mcp?: {
    enabled: boolean;
    serverPath?: string;
  };
  tests?: {
    api?: string;
    ui?: string;
    e2e?: string;
  };
  errorCapture?: ErrorCaptureConfig;
}

export interface ErrorCaptureConfig {
  enabled?: boolean;
  outputDir?: string;
  formats?: ('markdown' | 'html' | 'json')[];
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  type?: string;
  name?: string;
}

export interface NetworkLog {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  timestamp: number;
  duration?: number;
}

export interface ConsoleLog {
  type: 'log' | 'error' | 'warning' | 'info' | 'debug';
  message: string;
  args?: any[];
  timestamp: number;
  location?: {
    url?: string;
    line?: number;
    column?: number;
  };
}

export interface DOMState {
  url: string;
  title?: string;
  html?: string;
  visibleElements?: Array<{
    selector: string;
    text?: string;
    visible: boolean;
  }>;
  screenshot?: string;
}

export interface ErrorReport {
  testInfo: {
    name: string;
    type: 'api' | 'ui' | 'e2e';
    description?: string;
    timestamp: number;
    duration?: number;
  };
  error: ErrorDetails;
  networkLogs?: NetworkLog[];
  consoleLogs?: ConsoleLog[];
  domState?: DOMState;
  environment: {
    browser?: string;
    os?: string;
    testEnv?: string;
    apiUrl?: string;
    uiUrl?: string;
  };
  testSteps?: Array<{
    step: number;
    description: string;
    tool?: string;
    timestamp: number;
  }>;
  media?: {
    screenshots?: string[];
    videos?: string[];
  };
}






