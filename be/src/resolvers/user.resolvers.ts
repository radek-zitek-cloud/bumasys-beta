/**
 * @fileoverview User management resolvers
 *
 * This module contains GraphQL resolvers for user management operations
 * including user queries, user CRUD operations, and user administration.
 */

import type { GraphQLContext, RegisterInput, UpdateUserInput } from '../types';
import logger from '../utils/logger';
import { UserService } from '../services';

/**
 * User service instance - will be set during application initialization
 */
let userService: UserService;

/**
 * Set the service instances for user resolvers to use
 * @param user - UserService instance for user operations
 */
export function setServices(user: UserService): void {
  userService = user;
}

/**
 * User query resolvers
 * Contains resolvers for user data retrieval operations
 */
export const userResolvers = {
  /**
   * Get all users in the system (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all users without password information
   * @throws Error if user is not authenticated
   */
  users: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    logger.debug(
      { operation: 'users', userId: user?.id },
      'Processing users query',
    );

    if (!user) {
      logger.warn(
        { operation: 'users' },
        'Unauthenticated access attempt to users query',
      );
      throw new Error('Unauthenticated');
    }

    const users = userService.getAllUsers();
    logger.info(
      { operation: 'users', userId: user.id, userCount: users.length },
      'Users query completed successfully',
    );
    return users;
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
    logger.debug(
      { operation: 'user', targetUserId: id, requestingUserId: user?.id },
      'Processing user query',
    );

    if (!user) {
      logger.warn(
        { operation: 'user', targetUserId: id },
        'Unauthenticated access attempt to user query',
      );
      throw new Error('Unauthenticated');
    }

    const targetUser = userService.getSafeUserById(id);
    logger.info(
      {
        operation: 'user',
        targetUserId: id,
        requestingUserId: user.id,
        found: !!targetUser,
      },
      'User query completed',
    );
    return targetUser;
  },
};

/**
 * User mutation resolvers
 * Contains resolvers for user management and administration operations
 */
export const userMutationResolvers = {
  /**
   * Create a new user (admin operation)
   * @param _ - Parent object (unused)
   * @param args - User creation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to created user
   * @throws Error if user is not authenticated
   */
  createUser: async (
    _: unknown,
    args: RegisterInput,
    { user }: GraphQLContext,
  ) => {
    logger.debug(
      {
        operation: 'createUser',
        email: args.email,
        requestingUserId: user?.id,
      },
      'Processing admin user creation',
    );

    if (!user) {
      logger.warn(
        { operation: 'createUser', email: args.email },
        'Unauthenticated access attempt to createUser mutation',
      );
      throw new Error('Unauthenticated');
    }

    try {
      const newUser = await userService.createUser(args);
      logger.info(
        {
          operation: 'createUser',
          email: args.email,
          newUserId: newUser.id,
          requestingUserId: user.id,
        },
        'Admin user creation completed successfully',
      );
      return newUser;
    } catch (error) {
      logger.warn(
        {
          operation: 'createUser',
          email: args.email,
          requestingUserId: user.id,
          error: error instanceof Error ? error.message : String(error),
        },
        'Admin user creation failed',
      );
      throw error;
    }
  },

  /**
   * Update an existing user
   * @param _ - Parent object (unused)
   * @param args - User update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to updated user
   * @throws Error if user is not authenticated
   */
  updateUser: async (
    _: unknown,
    args: UpdateUserInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return userService.updateUser(args);
  },

  /**
   * Delete a user
   * @param _ - Parent object (unused)
   * @param args - Arguments containing user ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteUser: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return userService.deleteUser(id);
  },
};
