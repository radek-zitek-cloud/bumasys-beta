/**
 * @fileoverview Test utilities for database cleanup
 *
 * This module provides utility functions for cleaning up test databases
 * in the new multiple database system.
 */

import fs from 'fs';
import path from 'path';

/**
 * Clean up test database files for a given base name
 * Removes both auth.json and db-default.json files
 *
 * @param testDir - Test directory path (usually __dirname)
 * @param baseName - Base name for the test database file
 */
export function cleanupTestDatabases(testDir: string, baseName: string): void {
  const dbFile = path.join(testDir, baseName);
  const authFile = path.join(testDir, 'auth.json');
  const dataFile = path.join(testDir, 'db-default.json');

  // Clean up database files
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
}

/**
 * Setup test environment with database cleanup
 * Call this in beforeAll to ensure clean test environment
 *
 * @param testDir - Test directory path (usually __dirname)
 * @param baseName - Base name for the test database file
 * @returns Database file path to pass to config
 */
export function setupTestDatabase(testDir: string, baseName: string): string {
  cleanupTestDatabases(testDir, baseName);
  return path.join(testDir, baseName);
}
