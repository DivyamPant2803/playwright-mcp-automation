/**
 * URL Validation Utility
 * Prevents SSRF (Server-Side Request Forgery) attacks by validating URLs
 */

import { URL } from 'url';

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();
  
  // Localhost variants
  if (lowerHostname === 'localhost' || lowerHostname === '127.0.0.1' || lowerHostname === '::1') {
    return true;
  }
  
  // Private IP ranges
  if (lowerHostname.startsWith('192.168.')) return true;
  if (lowerHostname.startsWith('10.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lowerHostname)) return true;
  
  // Link-local and special addresses
  if (lowerHostname === '169.254.169.254') return true; // AWS metadata
  if (lowerHostname === 'metadata.google.internal') return true; // GCP metadata
  if (lowerHostname.endsWith('.internal')) return true;
  if (lowerHostname.endsWith('.local')) return true;
  
  return false;
}

/**
 * Validate and sanitize URLs to prevent SSRF attacks
 * 
 * @param urlString - The URL string to validate
 * @param allowedHosts - Optional whitelist of allowed hosts
 * @param allowLocalhost - Whether to allow localhost (default: false)
 * @returns The validated URL object
 * @throws Error if URL is invalid or blocked
 */
export function validateUrl(
  urlString: string,
  allowedHosts?: string[],
  allowLocalhost: boolean = false
): URL {
  let url: URL;
  
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  // Only allow HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  const hostname = url.hostname.toLowerCase();
  const isPrivate = isPrivateIP(hostname);

  // Block private/internal IP addresses unless explicitly allowed
  if (isPrivate) {
    if (hostname === 'localhost' && allowLocalhost) {
      // Allow localhost if explicitly enabled
    } else {
      throw new Error('Access to internal/private IP addresses is not allowed for security reasons');
    }
  }

  // If allowedHosts is provided, validate against whitelist
  if (allowedHosts && allowedHosts.length > 0) {
    const isAllowed = allowedHosts.some(allowed => {
      const allowedLower = allowed.toLowerCase();
      return hostname === allowedLower || hostname.endsWith('.' + allowedLower);
    });
    
    if (!isAllowed) {
      throw new Error(`Host ${hostname} is not in the allowed hosts list`);
    }
  }

  return url;
}

/**
 * Validate navigation URLs (for browser navigation)
 * 
 * @param urlString - The URL string to validate
 * @param allowedDomains - Optional whitelist of allowed domains
 * @returns The validated URL object
 * @throws Error if URL is invalid or blocked
 */
export function validateNavigationUrl(
  urlString: string,
  allowedDomains?: string[]
): URL {
  let url: URL;
  
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  // Only allow HTTP and HTTPS
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  // If allowedDomains provided, validate
  if (allowedDomains && allowedDomains.length > 0) {
    const hostname = url.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(domain => {
      const domainLower = domain.toLowerCase();
      return hostname === domainLower || hostname.endsWith('.' + domainLower);
    });
    
    if (!isAllowed) {
      throw new Error(`Domain ${url.hostname} is not in the allowed domains list`);
    }
  }

  return url;
}


