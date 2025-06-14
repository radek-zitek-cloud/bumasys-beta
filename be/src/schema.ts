/**
 * @fileoverview GraphQL schema module
 *
 * This module provides GraphQL schema and resolvers and is kept for
 * backward compatibility with existing code. New code should use
 * the modular schema and resolvers from their respective directories.
 *
 * @deprecated This module is kept for backward compatibility.
 * New code should import from schema/ and resolvers/ directories
 */

import type { Database } from './types';
import { AuthService, UserService } from './services';

// Re-export schema and resolvers from the new modular structure
export { typeDefs } from './schema/index';
export { resolvers } from './resolvers/index';

/**
 * Service instances for the application
 */
let authService: AuthService;
let userService: UserService;

/**
 * Assign the active database instance used by resolvers.
 * The health query relies on this value to determine readiness.
 *
 * @deprecated Use initializeResolvers with service instances instead
 * @param database - Database instance to use
 */
export function setDb(database: Database): void {
  // Initialize services
  authService = new AuthService(database);
  userService = new UserService(database);

  // Initialize resolvers with services
  const { initializeResolvers } = require('./resolvers/index');
  initializeResolvers(authService, userService);

  // Also set up the legacy auth module for backward compatibility
  const { setDb: setAuthDb } = require('./auth');
  setAuthDb(database);
}
