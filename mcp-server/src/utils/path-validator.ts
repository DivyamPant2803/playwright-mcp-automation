/**
 * Path Validation Utility
 * Prevents path traversal attacks by validating file paths
 */

import { resolve, relative, isAbsolute } from 'path';
import { realpathSync, existsSync } from 'fs';

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
  
  // Resolve symlinks to get real path
  let realBase: string;
  let realPath: string;
  
  try {
    realBase = existsSync(resolvedBase) ? realpathSync(resolvedBase) : resolvedBase;
    realPath = existsSync(resolvedPath) ? realpathSync(resolvedPath) : resolvedPath;
  } catch {
    // If realpath fails, use resolved paths
    realBase = resolvedBase;
    realPath = resolvedPath;
  }
  
  // Get relative path
  const relativePath = relative(realBase, realPath);
  
  // Check for path traversal attempts
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }
  
  // Check for Windows UNC path issues
  if (process.platform === 'win32' && realPath.startsWith('\\\\')) {
    // Validate UNC path is within allowed network share
    if (!realBase.startsWith('\\\\')) {
      throw new Error(`UNC path not allowed: ${filePath}`);
    }
  }
  
  return realPath;
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

