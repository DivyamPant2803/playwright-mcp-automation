/**
 * HTTP Header Validation Utility
 * Prevents header injection attacks
 */

// Dangerous headers that should never be set by users
const BLOCKED_HEADERS = new Set([
  'host',
  'connection',
  'upgrade',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'content-length', // Let fetch set this automatically
  'expect',
  'te',
  'trailer',
]);

// Header name validation regex (RFC 7230)
const HEADER_NAME_REGEX = /^[a-zA-Z0-9!#$%&'*+.^_`|~-]+$/;

// Maximum header value length
const MAX_HEADER_VALUE_LENGTH = 8192;

/**
 * Validate HTTP header name
 */
export function validateHeaderName(name: string): string {
  if (typeof name !== 'string') {
    throw new Error('Header name must be a string');
  }
  
  const normalized = name.trim().toLowerCase();
  
  if (normalized.length === 0) {
    throw new Error('Header name cannot be empty');
  }
  
  if (normalized.length > 100) {
    throw new Error('Header name is too long (max 100 characters)');
  }
  
  if (BLOCKED_HEADERS.has(normalized)) {
    throw new Error(`Header "${name}" is not allowed for security reasons`);
  }
  
  if (!HEADER_NAME_REGEX.test(name)) {
    throw new Error(`Invalid header name: ${name}`);
  }
  
  return name;
}

/**
 * Validate HTTP header value
 */
export function validateHeaderValue(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('Header value must be a string');
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Header value cannot be empty');
  }
  
  if (trimmed.length > MAX_HEADER_VALUE_LENGTH) {
    throw new Error(`Header value is too long (max ${MAX_HEADER_VALUE_LENGTH} characters)`);
  }
  
  // Check for CRLF injection attempts
  if (/[\r\n]/.test(trimmed)) {
    throw new Error('Header value contains invalid characters (CRLF injection attempt)');
  }
  
  return trimmed;
}

/**
 * Validate and sanitize headers object
 */
export function validateHeaders(headers: Record<string, string>): Record<string, string> {
  if (!headers || typeof headers !== 'object') {
    return {};
  }
  
  const validated: Record<string, string> = {};
  
  for (const [name, value] of Object.entries(headers)) {
    try {
      const validName = validateHeaderName(name);
      const validValue = validateHeaderValue(String(value));
      validated[validName] = validValue;
    } catch (error: any) {
      throw new Error(`Invalid header "${name}": ${error.message}`);
    }
  }
  
  return validated;
}

