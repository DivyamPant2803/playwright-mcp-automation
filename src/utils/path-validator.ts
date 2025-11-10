/**
 * Path Validation Utility
 * Prevents path traversal attacks by validating file paths
 */

import { resolve, relative, isAbsolute } from 'path';

/**
 * Validate that a file path is within the allowed base directory
 * Prevents path traversal attacks
 * 
 * @param filePath - The file path to validate (can be relative or absolute)
 * @param baseDir - The base directory that the path must be within
 * @returns The resolved absolute path if valid
 * @throws Error if path traversal is detected
 */
export function validatePath(filePath: string, baseDir: string): string {
  // Resolve to absolute paths
  const resolvedBase = resolve(baseDir);
  const resolvedPath = resolve(resolvedBase, filePath);
  
  // Get relative path
  const relativePath = relative(resolvedBase, resolvedPath);
  
  // Check for path traversal attempts
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }
  
  return resolvedPath;
}

/**
 * Validate directory path
 * 
 * @param dirPath - The directory path to validate
 * @param baseDir - The base directory that the path must be within
 * @returns The resolved absolute path if valid
 * @throws Error if path traversal is detected
 */
export function validateDirectoryPath(dirPath: string, baseDir: string): string {
  return validatePath(dirPath, baseDir);
}

