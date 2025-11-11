/**
 * Report Generator
 * Generates error reports in multiple formats (Markdown, HTML, JSON)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import type { ErrorReport } from '../types.js';

export class ReportGenerator {
  /**
   * Generate error reports in specified formats
   */
  static async generateReports(
    report: ErrorReport,
    outputDir: string,
    formats: ('markdown' | 'html' | 'json')[],
    projectRoot?: string
  ): Promise<string[]> {
    const generatedFiles: string[] = [];

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate sanitized filename
    const sanitizedName = report.testInfo.name
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .substring(0, 50);
    const timestamp = new Date(report.testInfo.timestamp).toISOString().replace(/[:.]/g, '-');
    const baseFilename = `${sanitizedName}-${timestamp}`;

    // Generate each requested format
    for (const format of formats) {
      try {
        let content: string;
        let extension: string;

        switch (format) {
          case 'markdown':
            content = ReportGenerator.generateMarkdown(report);
            extension = 'md';
            break;
          case 'html':
            content = ReportGenerator.generateHTML(report, outputDir, projectRoot);
            extension = 'html';
            break;
          case 'json':
            content = ReportGenerator.generateJSON(report);
            extension = 'json';
            break;
          default:
            continue;
        }

        const filepath = join(outputDir, `${baseFilename}.${extension}`);
        writeFileSync(filepath, content, 'utf-8');
        generatedFiles.push(filepath);
      } catch (error) {
        console.error(`Failed to generate ${format} report:`, error);
      }
    }

    return generatedFiles;
  }

  /**
   * Generate Markdown report
   */
  private static generateMarkdown(report: ErrorReport): string {
    const lines: string[] = [];

    // Header
    lines.push('# Error Report');
    lines.push('');
    lines.push(`**Test:** ${report.testInfo.name}`);
    lines.push(`**Type:** ${report.testInfo.type}`);
    if (report.testInfo.description) {
      lines.push(`**Description:** ${report.testInfo.description}`);
    }
    lines.push(`**Timestamp:** ${new Date(report.testInfo.timestamp).toISOString()}`);
    if (report.testInfo.duration) {
      lines.push(`**Duration:** ${report.testInfo.duration}ms`);
    }
    lines.push('');

    // Error Details
    lines.push('## Error Details');
    lines.push('');
    lines.push(`**Message:** ${report.error.message}`);
    if (report.error.type) {
      lines.push(`**Type:** ${report.error.type}`);
    }
    if (report.error.name) {
      lines.push(`**Name:** ${report.error.name}`);
    }
    if (report.error.stack) {
      lines.push('');
      lines.push('**Stack Trace:**');
      lines.push('```');
      lines.push(report.error.stack);
      lines.push('```');
    }
    lines.push('');

    // Environment
    lines.push('## Environment');
    lines.push('');
    if (report.environment.browser) {
      lines.push(`- **Browser:** ${report.environment.browser}`);
    }
    if (report.environment.os) {
      lines.push(`- **OS:** ${report.environment.os}`);
    }
    if (report.environment.testEnv) {
      lines.push(`- **Test Environment:** ${report.environment.testEnv}`);
    }
    if (report.environment.apiUrl) {
      lines.push(`- **API URL:** ${report.environment.apiUrl}`);
    }
    if (report.environment.uiUrl) {
      lines.push(`- **UI URL:** ${report.environment.uiUrl}`);
    }
    lines.push('');

    // Test Steps
    if (report.testSteps && report.testSteps.length > 0) {
      lines.push('## Test Steps');
      lines.push('');
      for (const step of report.testSteps) {
        lines.push(`### Step ${step.step}: ${step.description}`);
        if (step.tool) {
          lines.push(`- **Tool:** ${step.tool}`);
        }
        lines.push(`- **Timestamp:** ${new Date(step.timestamp).toISOString()}`);
        lines.push('');
      }
    }

    // Network Logs
    if (report.networkLogs && report.networkLogs.length > 0) {
      lines.push('## Network Logs');
      lines.push('');
      for (const log of report.networkLogs) {
        lines.push(`### ${log.method} ${log.url}`);
        lines.push(`- **Status:** ${log.status || 'N/A'} ${log.statusText || ''}`);
        if (log.duration) {
          lines.push(`- **Duration:** ${log.duration}ms`);
        }
        if (log.requestBody) {
          lines.push('');
          lines.push('**Request Body:**');
          lines.push('```json');
          lines.push(JSON.stringify(log.requestBody, null, 2));
          lines.push('```');
        }
        if (log.responseBody) {
          lines.push('');
          lines.push('**Response Body:**');
          lines.push('```json');
          lines.push(JSON.stringify(log.responseBody, null, 2).substring(0, 5000));
          lines.push('```');
        }
        lines.push('');
      }
    }

    // Console Logs
    if (report.consoleLogs && report.consoleLogs.length > 0) {
      lines.push('## Console Logs');
      lines.push('');
      for (const log of report.consoleLogs) {
        lines.push(`- **[${log.type.toUpperCase()}]** ${log.message}`);
        if (log.location) {
          lines.push(`  - Location: ${log.location.url}:${log.location.line}:${log.location.column}`);
        }
      }
      lines.push('');
    }

    // DOM State
    if (report.domState) {
      lines.push('## DOM State');
      lines.push('');
      lines.push(`- **URL:** ${report.domState.url}`);
      if (report.domState.title) {
        lines.push(`- **Title:** ${report.domState.title}`);
      }
      if (report.domState.visibleElements && report.domState.visibleElements.length > 0) {
        lines.push('');
        lines.push('**Visible Elements:**');
        for (const element of report.domState.visibleElements.slice(0, 20)) {
          lines.push(`- \`${element.selector}\`: ${element.text || '(no text)'}`);
        }
      }
      lines.push('');
    }

    // Media
    if (report.media) {
      lines.push('## Media');
      lines.push('');
      if (report.media.screenshots && report.media.screenshots.length > 0) {
        lines.push('**Screenshots:**');
        for (const screenshot of report.media.screenshots) {
          lines.push(`- ${screenshot}`);
        }
        lines.push('');
      }
      if (report.media.videos && report.media.videos.length > 0) {
        lines.push('**Videos:**');
        for (const video of report.media.videos) {
          lines.push(`- ${video}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate HTML report
   */
  private static generateHTML(report: ErrorReport, outputDir: string, projectRoot?: string): string {
    // Helper to resolve media paths relative to the HTML report location
    const resolveMediaPath = (mediaPath: string): string => {
      if (mediaPath.startsWith('/') || mediaPath.match(/^[A-Z]:/)) {
        // Absolute path - try to make it relative
        if (projectRoot) {
          try {
            const resolvedMediaPath = resolve(projectRoot, mediaPath);
            return relative(outputDir, resolvedMediaPath);
          } catch {
            return mediaPath;
          }
        }
        return mediaPath;
      }
      // Relative path - assume it's relative to test-results, so go up one level from error-reports
      return `../${mediaPath}`;
    };
    
    const escapeHtml = ReportGenerator.escapeHtml;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error Report: ${escapeHtml(report.testInfo.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      color: #d32f2f;
      border-bottom: 3px solid #d32f2f;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #1976d2;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0e0e0;
    }
    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      background: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #1976d2;
    }
    .info-item strong {
      display: block;
      color: #666;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .error-box {
      background: #ffebee;
      border-left: 4px solid #d32f2f;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .error-box pre {
      background: #fff;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin-top: 10px;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 10px 0;
    }
    pre code {
      background: none;
      padding: 0;
    }
    .collapsible {
      cursor: pointer;
      user-select: none;
    }
    .collapsible::before {
      content: '▶ ';
      display: inline-block;
      transition: transform 0.2s;
    }
    .collapsible.active::before {
      transform: rotate(90deg);
    }
    .collapsible-content {
      display: none;
      margin-top: 10px;
    }
    .collapsible.active + .collapsible-content {
      display: block;
    }
    .network-log {
      background: #f9f9f9;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
      border-left: 3px solid #1976d2;
    }
    .status-success { color: #2e7d32; }
    .status-error { color: #d32f2f; }
    .console-log {
      padding: 5px 10px;
      margin: 5px 0;
      border-radius: 3px;
    }
    .console-error { background: #ffebee; }
    .console-warning { background: #fff3e0; }
    .console-log-msg { background: #e3f2fd; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error Report</h1>
    
    <div class="info-grid">
      <div class="info-item">
        <strong>Test Name</strong>
        ${escapeHtml(report.testInfo.name)}
      </div>
      <div class="info-item">
        <strong>Type</strong>
        ${escapeHtml(report.testInfo.type)}
      </div>
      <div class="info-item">
        <strong>Timestamp</strong>
        ${new Date(report.testInfo.timestamp).toISOString()}
      </div>
      ${report.testInfo.duration ? `
      <div class="info-item">
        <strong>Duration</strong>
        ${report.testInfo.duration}ms
      </div>
      ` : ''}
    </div>

    <h2>Error Details</h2>
    <div class="error-box">
      <strong>${escapeHtml(report.error.message)}</strong>
      ${report.error.type ? `<p><strong>Type:</strong> ${escapeHtml(report.error.type)}</p>` : ''}
      ${report.error.stack ? `
      <details>
        <summary style="cursor: pointer; margin-top: 10px;">Stack Trace</summary>
        <pre><code>${escapeHtml(report.error.stack)}</code></pre>
      </details>
      ` : ''}
    </div>

    <h2>Environment</h2>
    <div class="info-grid">
      ${report.environment.browser ? `<div class="info-item"><strong>Browser</strong>${escapeHtml(report.environment.browser)}</div>` : ''}
      ${report.environment.os ? `<div class="info-item"><strong>OS</strong>${escapeHtml(report.environment.os)}</div>` : ''}
      ${report.environment.testEnv ? `<div class="info-item"><strong>Test Environment</strong>${escapeHtml(report.environment.testEnv)}</div>` : ''}
      ${report.environment.apiUrl ? `<div class="info-item"><strong>API URL</strong>${escapeHtml(report.environment.apiUrl)}</div>` : ''}
      ${report.environment.uiUrl ? `<div class="info-item"><strong>UI URL</strong>${escapeHtml(report.environment.uiUrl)}</div>` : ''}
    </div>

    ${report.testSteps && report.testSteps.length > 0 ? `
    <h2>Test Steps</h2>
    ${report.testSteps.map((step, idx) => `
    <div style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">
      <h3>Step ${step.step}: ${escapeHtml(step.description)}</h3>
      ${step.tool ? `<p><strong>Tool:</strong> ${escapeHtml(step.tool)}</p>` : ''}
      <p><strong>Timestamp:</strong> ${new Date(step.timestamp).toISOString()}</p>
    </div>
    `).join('')}
    ` : ''}

    ${report.networkLogs && report.networkLogs.length > 0 ? `
    <h2>Network Logs</h2>
    ${report.networkLogs.map(log => `
    <div class="network-log">
      <h3>${escapeHtml(log.method)} ${escapeHtml(log.url)}</h3>
      <p><strong>Status:</strong> <span class="${log.status && log.status >= 200 && log.status < 300 ? 'status-success' : 'status-error'}">${log.status || 'N/A'} ${log.statusText || ''}</span></p>
      ${log.duration ? `<p><strong>Duration:</strong> ${log.duration}ms</p>` : ''}
      ${log.requestBody ? `
      <details>
        <summary style="cursor: pointer; margin-top: 10px;">Request Body</summary>
        <pre><code>${escapeHtml(JSON.stringify(log.requestBody, null, 2))}</code></pre>
      </details>
      ` : ''}
      ${log.responseBody ? `
      <details>
        <summary style="cursor: pointer; margin-top: 10px;">Response Body</summary>
        <pre><code>${escapeHtml(JSON.stringify(log.responseBody, null, 2).substring(0, 5000))}</code></pre>
      </details>
      ` : ''}
    </div>
    `).join('')}
    ` : ''}

    ${report.consoleLogs && report.consoleLogs.length > 0 ? `
    <h2>Console Logs</h2>
    ${report.consoleLogs.map(log => `
    <div class="console-log console-${log.type}">
      <strong>[${log.type.toUpperCase()}]</strong> ${escapeHtml(log.message)}
      ${log.location ? `<br><small>${escapeHtml(log.location.url || '')}:${log.location.line}:${log.location.column}</small>` : ''}
    </div>
    `).join('')}
    ` : ''}

    ${report.domState ? `
    <h2>DOM State</h2>
    <div class="info-item">
      <strong>URL</strong>
      ${escapeHtml(report.domState.url)}
    </div>
    ${report.domState.title ? `<div class="info-item"><strong>Title</strong>${escapeHtml(report.domState.title)}</div>` : ''}
    ${report.domState.visibleElements && report.domState.visibleElements.length > 0 ? `
    <h3>Visible Elements</h3>
    <ul>
      ${report.domState.visibleElements.slice(0, 20).map(el => `
      <li><code>${escapeHtml(el.selector)}</code>: ${escapeHtml(el.text || '(no text)')}</li>
      `).join('')}
    </ul>
    ` : ''}
    ` : ''}

    ${report.media ? `
    <h2>Media</h2>
    ${report.media.screenshots && report.media.screenshots.length > 0 ? `
    <h3>Screenshots</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0;">
      ${report.media.screenshots.map(ss => {
        const screenshotPath = resolveMediaPath(ss);
        return `
        <div style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px;">
          <img src="${escapeHtml(screenshotPath)}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 4px;" onerror="this.parentElement.innerHTML='<p style=\\'color: #d32f2f;\\'>Screenshot not found: ${escapeHtml(ss)}<br>Path: ${escapeHtml(screenshotPath)}</p>'">
          <p style="margin-top: 10px; font-size: 0.9em; color: #666; word-break: break-all;">${escapeHtml(ss)}</p>
        </div>
        `;
      }).join('')}
    </div>
    ` : ''}
    ${report.media.videos && report.media.videos.length > 0 ? `
    <h3>Videos</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 15px; margin: 20px 0;">
      ${report.media.videos.map(v => {
        const videoPath = resolveMediaPath(v);
        return `
        <div style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px;">
          <video controls style="max-width: 100%; height: auto; border-radius: 4px;" onerror="this.parentElement.innerHTML='<p style=\\'color: #d32f2f;\\'>Video not found: ${escapeHtml(v)}<br>Path: ${escapeHtml(videoPath)}<br><a href=\\'${escapeHtml(videoPath)}\\' target=\\'_blank\\'>Try opening directly</a></p>'">
            <source src="${escapeHtml(videoPath)}" type="video/webm">
            <source src="${escapeHtml(videoPath)}" type="video/mp4">
            Your browser does not support the video tag.
            <a href="${escapeHtml(videoPath)}" target="_blank">Download video</a>
          </video>
          <p style="margin-top: 10px; font-size: 0.9em; color: #666; word-break: break-all;">${escapeHtml(v)}</p>
        </div>
        `;
      }).join('')}
    </div>
    ` : ''}
    ` : ''}
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate JSON report
   */
  private static generateJSON(report: ErrorReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}


