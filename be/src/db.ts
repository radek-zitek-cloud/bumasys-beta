/**
 * @fileoverview Database module
 *
 * This module provides database functionality using a JSON file as storage.
 * It exports types and functions for creating and managing the database.
 *
 * @deprecated This module is kept for backward compatibility.
 * New code should use the utilities in utils/database.utils.ts
 */

// Re-export types from the centralized types module
export type { Database, User, Session } from './types';

// Re-export the createDatabase function with backward-compatible name
export { createDatabase as createDb } from './utils';
