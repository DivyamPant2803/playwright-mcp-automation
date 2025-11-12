/**
 * Error Sanitization Utility
 * Removes sensitive information from error messages
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize error for user-facing messages
 */
export function sanitizeError(error: any): {
  message: string;
  type?: string;
  details?: Record<string, any>;
} {
  const sanitized: any = {
    message: error?.message || 'An error occurred',
  };
  
  if (error?.name) {
    sanitized.type = error.name;
  }
  
  // Only include stack trace in development
  if (!isProduction && error?.stack) {
    // Remove file paths from stack trace
    const sanitizedStack = error.stack
      .split('\n')
      .map((line: string) => {
        // Remove absolute paths, keep only file names
        return line.replace(/\([^)]*node_modules[^)]*\)/g, '(node_modules/...)')
                   .replace(/\([^)]*\/[^/]+\/[^/]+\)/g, '(...)');
      })
      .join('\n');
    sanitized.details = { stack: sanitizedStack };
  }
  
  return sanitized;
}

/**
 * Get safe error message for user
 */
export function getSafeErrorMessage(error: any): string {
  const sanitized = sanitizeError(error);
  return sanitized.message;
}

