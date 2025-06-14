/**
 * @fileoverview Query resolvers
 *
 * This module contains all GraphQL query resolvers for read operations
 * including user queries and health checks.
 */

import type { GraphQLContext } from '../types';
import { UserService } from '../services';

/**
 * Database instance - will be set during application initialization
 */
let userService: UserService;

/**
 * Set the user service instance for resolvers to use
 * @param service - UserService instance
 */
export function setUserService(service: UserService): void {
  userService = service;
}

/**
 * GraphQL Query resolvers
 */
export const queryResolvers = {
  /**
   * Get the currently authenticated user's information
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Current user object or null if not authenticated
   */
  me: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    return user || null;
  },

  /**
   * Health check resolver to verify server readiness
   * @returns true when database connection is available
   */
  health: (): boolean => {
    return Boolean(userService);
  },

  /**
   * Get all users in the system (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all users without password information
   * @throws Error if user is not authenticated
   */
  users: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return userService.getAllUsers();
  },

  /**
   * Get a specific user by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing user ID
   * @param context - GraphQL context containing user info
   * @returns User object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  user: (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return userService.getSafeUserById(id);
  },
};
