/**
 * @fileoverview Mutation resolvers
 *
 * This module contains all GraphQL mutation resolvers for write operations
 * including authentication, user management, and account operations.
 */

import type {
  GraphQLContext,
  RegisterInput,
  LoginInput,
  UpdateUserInput,
  ChangePasswordInput,
} from '../types';
import { AuthService, UserService } from '../services';

/**
 * Service instances - will be set during application initialization
 */
let authService: AuthService;
let userService: UserService;

/**
 * Set the service instances for resolvers to use
 * @param auth - AuthService instance
 * @param user - UserService instance
 */
export function setServices(auth: AuthService, user: UserService): void {
  authService = auth;
  userService = user;
}

/**
 * GraphQL Mutation resolvers
 */
export const mutationResolvers = {
  /**
   * Register a new user account
   * @param _ - Parent object (unused)
   * @param args - Registration data
   * @returns Promise resolving to authentication payload
   */
  register: async (_: unknown, args: RegisterInput) => {
    // Create the user
    const user = await userService.createUser(args);

    // Generate authentication tokens
    const accessToken = authService.signToken(user.id);
    const refreshToken = await authService.signRefreshToken(user.id);

    return {
      token: accessToken,
      refreshToken,
      user,
    };
  },

  /**
   * Login with email and password
   * @param _ - Parent object (unused)
   * @param args - Login credentials
   * @returns Promise resolving to authentication payload
   */
  login: async (_: unknown, args: LoginInput) => {
    return authService.authenticateUser(args);
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
    if (!user) {
      throw new Error('Not authenticated');
    }

    return userService.changePassword(
      user.id,
      args.oldPassword,
      args.newPassword,
    );
  },

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
    if (!user) {
      throw new Error('Unauthenticated');
    }

    return userService.createUser(args);
  },

  /**
   * Update an existing user's information
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
   * Delete a user by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing user ID to delete
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if user is not authenticated
   */
  deleteUser: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ): Promise<boolean> => {
    if (!user) {
      throw new Error('Unauthenticated');
    }

    return userService.deleteUser(id);
  },

  /**
   * Logout and invalidate all refresh tokens for the user
   * @param _ - Parent object (unused)
   * @param args - Arguments containing refresh token
   * @returns Promise resolving to true when logout is complete
   */
  logout: async (
    _: unknown,
    { refreshToken }: { refreshToken: string },
  ): Promise<boolean> => {
    return authService.logout(refreshToken);
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
    return authService.refreshAccessToken(refreshToken);
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
