/**
 * @fileoverview Staff resolvers
 *
 * This module contains all GraphQL resolvers related to staff management,
 * including queries, mutations, and field resolvers.
 */

import type { GraphQLContext } from '../types';
import logger from '../utils/logger';
import type { CreateStaffInput, UpdateStaffInput } from '../types';
import type { StaffService } from '../services';

/**
 * Service instances - will be set during application initialization
 */
let staffService: StaffService;

/**
 * Staff query resolvers
 */
export const staffQueryResolvers = {
  /**
   * Get all staff members (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional filters
   * @param context - GraphQL context containing user info
   * @returns Array of staff members
   * @throws Error if user is not authenticated
   */
  staff: (
    _: unknown,
    {
      organizationId,
      departmentId,
    }: { organizationId?: string; departmentId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }

    if (departmentId) {
      return staffService.getStaffByDepartment(departmentId);
    }
    if (organizationId) {
      return staffService.getStaffByOrganization(organizationId);
    }
    return staffService.getAllStaff();
  },

  /**
   * Get a specific staff member by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing staff ID
   * @param context - GraphQL context containing user info
   * @returns Staff object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  staffMember: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return staffService.findById(id);
  },
};

/**
 * Staff mutation resolvers
 */
export const staffMutationResolvers = {
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

/**
 * Staff field resolvers for nested data
 */
export const staffFieldResolvers = {
  supervisor: (parent: { supervisorId?: string }) => {
    return parent.supervisorId
      ? staffService.findById(parent.supervisorId)
      : null;
  },
  subordinates: (parent: { id: string }) => {
    return staffService.getSubordinates(parent.id);
  },
};

/**
 * Initialize staff resolvers with service dependencies
 * @param services - Object containing service instances
 */
export function initializeStaffResolvers(services: {
  staff: StaffService;
}): void {
  staffService = services.staff;
}
