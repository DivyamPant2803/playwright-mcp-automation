/**
 * Lazy Loader
 * Implements lazy loading for heavy features to keep package lightweight
 */

/**
 * Lazy load MCP server (only when needed)
 */
export async function loadMCPServer(): Promise<any> {
  // Dynamic import - only loads when actually used
  return import('../../mcp-server/dist/index.js');
}

/**
 * Lazy load test utilities (only when needed)
 * Optional packages - gracefully handle if not installed
 */
export async function loadTestUtils(): Promise<any> {
  // These would be in optional packages
  // For now, return null if not available
  try {
    // Dynamic import with type assertion to avoid TS errors
    const module = await import('@playwright-mcp/automation-a11y' as string);
    return module;
  } catch {
    return null;
  }
}

/**
 * Lazy load visual testing (only when needed)
 * Optional packages - gracefully handle if not installed
 */
export async function loadVisualTesting(): Promise<any> {
  try {
    const module = await import('@playwright-mcp/automation-visual' as string);
    return module;
  } catch {
    return null;
  }
}

/**
 * Check if optional feature is available
 */
export async function isFeatureAvailable(feature: 'a11y' | 'visual'): Promise<boolean> {
  try {
    if (feature === 'a11y') {
      await import('@playwright-mcp/automation-a11y' as string);
      return true;
    }
    if (feature === 'visual') {
      await import('@playwright-mcp/automation-visual' as string);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

