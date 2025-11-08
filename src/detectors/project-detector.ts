/**
 * Project Detector
 * Auto-detects project type, frameworks, ports, and URLs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export interface DetectedProject {
  projectType: 'react' | 'vue' | 'angular' | 'dotnet' | 'nodejs' | 'unknown';
  uiFramework?: 'react' | 'vue' | 'angular' | 'unknown';
  apiType?: 'dotnet' | 'express' | 'fastapi' | 'unknown';
  apiUrl?: string;
  uiUrl?: string;
  hasUI: boolean;
  hasAPI: boolean;
}

export class ProjectDetector {
  constructor(private projectRoot: string) {}

  /**
   * Detect project configuration
   */
  async detect(): Promise<DetectedProject> {
    const packageJson = this.readPackageJson();
    const hasDotNet = this.detectDotNet();
    const hasUI = this.detectUI(packageJson);
    const hasAPI = this.detectAPI(packageJson, hasDotNet);

    const projectType = this.detectProjectType(packageJson, hasDotNet);
    const uiFramework = this.detectUIFramework(packageJson);
    const apiType = this.detectAPIType(packageJson, hasDotNet);
    
    const apiUrl = this.detectAPIUrl(packageJson);
    const uiUrl = this.detectUIUrl(packageJson);

    return {
      projectType,
      uiFramework,
      apiType,
      apiUrl,
      uiUrl,
      hasUI,
      hasAPI,
    };
  }

  private readPackageJson(): any {
    const packageJsonPath = join(this.projectRoot, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return {};
    }
    try {
      return JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch {
      return {};
    }
  }

  private detectDotNet(): boolean {
    // Check for .csproj files
    try {
      const files = readdirSync(this.projectRoot);
      return files.some(f => f.endsWith('.csproj'));
    } catch {
      return false;
    }
  }

  private detectUI(packageJson: any): boolean {
    const uiDeps = ['react', 'vue', 'angular', '@angular/core'];
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return uiDeps.some(dep => deps[dep]);
  }

  private detectAPI(packageJson: any, hasDotNet: boolean): boolean {
    if (hasDotNet) return true;
    
    const apiDeps = ['express', 'fastify', 'koa', 'nestjs', 'fastapi'];
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return apiDeps.some(dep => deps[dep]) || 
           packageJson.scripts?.start?.includes('server') ||
           packageJson.scripts?.dev?.includes('server');
  }

  private detectProjectType(
    packageJson: any,
    hasDotNet: boolean
  ): 'react' | 'vue' | 'angular' | 'dotnet' | 'nodejs' | 'unknown' {
    if (hasDotNet) return 'dotnet';
    
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.react || deps['react-dom']) return 'react';
    if (deps.vue || deps['@vue/core']) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps.express || deps.fastify || deps.koa) return 'nodejs';
    
    return 'unknown';
  }

  private detectUIFramework(
    packageJson: any
  ): 'react' | 'vue' | 'angular' | 'unknown' | undefined {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.react || deps['react-dom']) return 'react';
    if (deps.vue || deps['@vue/core']) return 'vue';
    if (deps['@angular/core']) return 'angular';
    
    return undefined;
  }

  private detectAPIType(
    packageJson: any,
    hasDotNet: boolean
  ): 'dotnet' | 'express' | 'fastapi' | 'unknown' | undefined {
    if (hasDotNet) return 'dotnet';
    
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.express) return 'express';
    if (deps.fastapi || packageJson.name?.includes('fastapi')) return 'fastapi';
    
    return undefined;
  }

  private detectAPIUrl(packageJson: any): string | undefined {
    // Check environment variables
    if (process.env.API_URL) return process.env.API_URL;
    if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
    
    // Check package.json scripts
    const scripts = packageJson.scripts || {};
    const startScript = scripts.start || scripts.dev || scripts.serve;
    
    if (startScript) {
      // Try to extract port from script
      const portMatch = startScript.match(/--port\s+(\d+)/) || 
                       startScript.match(/:(\d+)/);
      if (portMatch) {
        return `http://localhost:${portMatch[1]}`;
      }
    }
    
    // Common API ports
    const commonPorts = [5000, 3000, 8000, 8080];
    for (const port of commonPorts) {
      // In a real implementation, you'd check if server is running
      // For now, return first common port
      return `http://localhost:${port}`;
    }
    
    return undefined;
  }

  private detectUIUrl(packageJson: any): string | undefined {
    // Check environment variables
    if (process.env.UI_URL) return process.env.UI_URL;
    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL;
    
    // Check package.json scripts
    const scripts = packageJson.scripts || {};
    const devScript = scripts.dev || scripts.start;
    
    if (devScript) {
      // Vite default port
      if (devScript.includes('vite')) {
        return 'http://localhost:5173';
      }
      // CRA default port
      if (devScript.includes('react-scripts')) {
        return 'http://localhost:3000';
      }
      // Vue CLI default port
      if (devScript.includes('vue-cli')) {
        return 'http://localhost:8080';
      }
      
      // Try to extract port
      const portMatch = devScript.match(/--port\s+(\d+)/) || 
                       devScript.match(/:(\d+)/);
      if (portMatch) {
        return `http://localhost:${portMatch[1]}`;
      }
    }
    
    // Common UI ports
    const commonPorts = [5173, 3000, 4200, 8080];
    for (const port of commonPorts) {
      return `http://localhost:${port}`;
    }
    
    return undefined;
  }
}

