/**
 * Input Validation Utility
 * Validates user inputs to prevent injection attacks and ensure data integrity
 */

/**
 * Validate timeout values
 * 
 * @param timeout - The timeout value in milliseconds
 * @returns The validated timeout value
 * @throws Error if timeout is invalid
 */
export function validateTimeout(timeout: number): number {
  if (typeof timeout !== 'number' || isNaN(timeout)) {
    throw new Error('Timeout must be a number');
  }
  if (timeout < 0 || timeout > 300000) {
    throw new Error('Timeout must be between 0 and 300000ms (5 minutes)');
  }
  return timeout;
}

/**
 * Validate selector strings
 * 
 * @param selector - The CSS selector string
 * @returns The validated selector
 * @throws Error if selector is invalid or potentially dangerous
 */
export function validateSelector(selector: string): string {
  if (typeof selector !== 'string') {
    throw new Error('Selector must be a string');
  }
  if (selector.length === 0) {
    throw new Error('Selector cannot be empty');
  }
  if (selector.length > 1000) {
    throw new Error('Selector is too long (max 1000 characters)');
  }
  
  // Block potentially dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /<script/i,
    /eval\(/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(selector)) {
      throw new Error('Potentially dangerous selector pattern detected');
    }
  }
  
  return selector;
}

/**
 * Validate fill values
 * 
 * @param value - The value to fill into an input
 * @returns The validated value
 * @throws Error if value is invalid
 */
export function validateFillValue(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  if (value.length > 10000) {
    throw new Error('Value is too long (max 10000 characters)');
  }
  return value;
}


