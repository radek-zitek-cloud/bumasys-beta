/**
 * @fileoverview GraphQL resolvers index
 *
 * This module combines all GraphQL resolvers into a single resolver object
 * and provides initialization functions for setting up services.
 */

import { queryResolvers, setUserService } from './query.resolvers';
import { mutationResolvers, setServices } from './mutation.resolvers';
import { AuthService, UserService } from '../services';

/**
 * Combined GraphQL resolvers object
 * Contains all query and mutation resolvers organized by type
 */
export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
};

/**
 * Initialize resolvers with service instances
 * Must be called during application startup after database initialization
 * @param authService - AuthService instance for authentication operations
 * @param userService - UserService instance for user operations
 */
export function initializeResolvers(
  authService: AuthService,
  userService: UserService,
): void {
  setUserService(userService);
  setServices(authService, userService);
}
