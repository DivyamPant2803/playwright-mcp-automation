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
}






