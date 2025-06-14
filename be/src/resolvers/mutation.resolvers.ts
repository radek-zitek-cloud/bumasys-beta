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
  CreateOrganizationInput,
  UpdateOrganizationInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateStaffInput,
  UpdateStaffInput,
} from '../types';
import {
  AuthService,
  UserService,
  OrganizationService,
  DepartmentService,
  StaffService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let authService: AuthService;
let userService: UserService;
let organizationService: OrganizationService;
let departmentService: DepartmentService;
let staffService: StaffService;

/**
 * Set the service instances for resolvers to use
 * @param auth - AuthService instance
 * @param user - UserService instance
 * @param organization - OrganizationService instance
 * @param department - DepartmentService instance
 * @param staff - StaffService instance
 */
export function setServices(
  auth: AuthService,
  user: UserService,
  organization: OrganizationService,
  department: DepartmentService,
  staff: StaffService,
): void {
  authService = auth;
  userService = user;
  organizationService = organization;
  departmentService = department;
  staffService = staff;
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

  /**
   * Create a new organization
   * @param _ - Parent object (unused)
   * @param args - Organization creation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created organization
   * @throws Error if user is not authenticated
   */
  createOrganization: async (
    _: unknown,
    args: CreateOrganizationInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationService.createOrganization(args);
  },

  /**
   * Update an existing organization
   * @param _ - Parent object (unused)
   * @param args - Organization update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated organization
   * @throws Error if user is not authenticated
   */
  updateOrganization: async (
    _: unknown,
    args: UpdateOrganizationInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationService.updateOrganization(args);
  },

  /**
   * Delete an organization
   * @param _ - Parent object (unused)
   * @param args - Arguments containing organization ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteOrganization: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationService.deleteOrganization(id);
  },

  /**
   * Create a new department
   * @param _ - Parent object (unused)
   * @param args - Department creation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created department
   * @throws Error if user is not authenticated
   */
  createDepartment: async (
    _: unknown,
    args: CreateDepartmentInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return departmentService.createDepartment(args);
  },

  /**
   * Update an existing department
   * @param _ - Parent object (unused)
   * @param args - Department update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated department
   * @throws Error if user is not authenticated
   */
  updateDepartment: async (
    _: unknown,
    args: UpdateDepartmentInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return departmentService.updateDepartment(args);
  },

  /**
   * Delete a department
   * @param _ - Parent object (unused)
   * @param args - Arguments containing department ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteDepartment: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return departmentService.deleteDepartment(id);
  },

  /**
   * Create a new staff member
   * @param _ - Parent object (unused)
   * @param args - Staff creation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created staff member
   * @throws Error if user is not authenticated
   */
  createStaff: async (
    _: unknown,
    args: CreateStaffInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return staffService.createStaff(args);
  },

  /**
   * Update an existing staff member
   * @param _ - Parent object (unused)
   * @param args - Staff update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated staff member
   * @throws Error if user is not authenticated
   */
  updateStaff: async (
    _: unknown,
    args: UpdateStaffInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return staffService.updateStaff(args);
  },

  /**
   * Delete a staff member
   * @param _ - Parent object (unused)
   * @param args - Arguments containing staff ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteStaff: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return staffService.deleteStaff(id);
  },
};
