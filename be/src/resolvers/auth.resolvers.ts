/**
 * @fileoverview Authentication resolvers
 *
 * This module contains GraphQL resolvers for authentication-related operations
 * including current user information retrieval, authentication mutations, and session management.
 */

import type {
  GraphQLContext,
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
} from '../types';
import logger from '../utils/logger';
import { AuthService, UserService } from '../services';

/**
 * User service instance - will be set during application initialization
 */
let userService: UserService;

/**
 * Auth service instance - will be set during application initialization
 */
let authService: AuthService;

/**
 * Set the service instances for authentication resolvers to use
 * @param user - UserService instance for user operations
 * @param auth - AuthService instance for authentication operations
 */
export function setServices(user: UserService, auth: AuthService): void {
  userService = user;
  authService = auth;
}

/**
 * Authentication query resolvers
 * Contains resolvers for authentication-related operations and user context queries
 */
export const authResolvers = {
  /**
   * Get the currently authenticated user's information
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Current user object or null if not authenticated
   */
  me: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    logger.debug({ operation: 'me', hasUser: !!user }, 'Processing me query');
    if (!user) {
      logger.info({ operation: 'me' }, 'Me query completed - no user');
      return null;
    }
    const result = userService.getSafeUserById(user.id);
    logger.info(
      { operation: 'me', userId: user.id, found: !!result },
      'Me query completed',
    );
    return result;
  },
};

/**
 * Authentication mutation resolvers
 * Contains resolvers for authentication write operations and session management
 */
export const authMutationResolvers = {
  /**
   * Register a new user account
   * @param _ - Parent object (unused)
   * @param args - Registration data
   * @returns Promise resolving to authentication payload
   */
  register: async (_: unknown, args: RegisterInput) => {
    logger.debug(
      { operation: 'register', email: args.email },
      'Processing user registration',
    );

    try {
      // Create the user
      const user = await userService.createUser(args);

      // Generate authentication tokens
      const accessToken = authService.signToken(user.id);
      const refreshToken = await authService.signRefreshToken(user.id);

      logger.info(
        { operation: 'register', userId: user.id, email: args.email },
        'User registration completed successfully',
      );

      return {
        token: accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      logger.warn(
        {
          operation: 'register',
          email: args.email,
          error: error instanceof Error ? error.message : String(error),
        },
        'User registration failed',
      );
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param _ - Parent object (unused)
   * @param args - Login credentials
   * @returns Promise resolving to authentication payload
   */
  login: async (_: unknown, args: LoginInput) => {
    logger.debug(
      { operation: 'login', email: args.email },
      'Processing user login',
    );

    try {
      const result = await authService.authenticateUser(args);
      logger.info(
        { operation: 'login', email: args.email, userId: result.user.id },
        'User login completed successfully',
      );
      return result;
    } catch (error) {
      logger.warn(
        {
          operation: 'login',
          email: args.email,
          error: error instanceof Error ? error.message : String(error),
        },
        'User login failed',
      );
      throw error;
    }
  },

  /**
   * Change the current user's password
   * @param _ - Parent object (unused)
   * @param args - Password change data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if successful
   * @throws Error if user is not authenticated
   */
  changePassword: async (
    _: unknown,
    args: ChangePasswordInput,
    { user }: GraphQLContext,
  ): Promise<boolean> => {
    logger.debug(
      { operation: 'changePassword', userId: user?.id },
      'Processing password change request',
    );

    if (!user) {
      logger.warn(
        { operation: 'changePassword' },
        'Unauthenticated access attempt to changePassword mutation',
      );
      throw new Error('Not authenticated');
    }

    try {
      const result = await userService.changePassword(
        user.id,
        args.oldPassword,
        args.newPassword,
      );
      logger.info(
        { operation: 'changePassword', userId: user.id },
        'Password changed successfully',
      );
      return result;
    } catch (error) {
      logger.warn(
        {
          operation: 'changePassword',
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        },
        'Password change failed',
      );
      throw error;
    }
  },

  /**
   * Logout user by invalidating refresh token
   * @param _ - Parent object (unused)
   * @param args - Arguments containing refresh token
   * @returns Promise resolving to true when logout is complete
   */
  logout: async (
    _: unknown,
    { refreshToken }: { refreshToken: string },
  ): Promise<boolean> => {
    logger.debug(
      { operation: 'logout' },
      'Processing logout request',
    );

    try {
      const result = await authService.logout(refreshToken);
      logger.info(
        { operation: 'logout' },
        'Logout completed successfully',
      );
      return result;
    } catch (error) {
      logger.warn(
        {
          operation: 'logout',
          error: error instanceof Error ? error.message : String(error),
        },
        'Logout failed',
      );
      throw error;
    }
  },

  /**
   * Refresh an access token using a valid refresh token
   * @param _ - Parent object (unused)
   * @param args - Arguments containing refresh token
   * @returns Promise resolving to new authentication payload
   */
  refreshToken: async (
    _: unknown,
    { refreshToken }: { refreshToken: string },
  ) => {
    logger.debug(
      { operation: 'refreshToken' },
      'Processing refresh token request',
    );

    try {
      const result = await authService.refreshAccessToken(refreshToken);
      logger.info(
        { operation: 'refreshToken', userId: result.user.id },
        'Refresh token processed successfully',
      );
      return result;
    } catch (error) {
      logger.warn(
        {
          operation: 'refreshToken',
          error: error instanceof Error ? error.message : String(error),
        },
        'Refresh token processing failed',
      );
      throw error;
    }
  },

  /**
   * Initiate password reset process (placeholder implementation)
   * @param _ - Parent object (unused)
   * @param args - Arguments containing email address
   * @returns Promise resolving to true (placeholder)
   * @todo Implement actual password reset logic
   */
  resetPassword: async (
    _: unknown,
    { email }: { email: string },
  ): Promise<boolean> => {
    // Placeholder for password reset logic
    // In a real implementation, this would:
    // 1. Verify the email exists
    // 2. Generate a secure reset token
    // 3. Send an email with reset instructions
    // 4. Store the token temporarily for verification
    return true;
  },
};
