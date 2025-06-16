/**
 * @fileoverview Organization-related GraphQL resolvers
 *
 * This module contains GraphQL resolvers for organization management operations
 * including organization queries, mutations, and field resolvers for nested data.
 */

import type {
  GraphQLContext,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '../types';
import { OrganizationService, DepartmentService, StaffService } from '../services';
import logger from '../utils/logger';

let organizationService: OrganizationService;
let departmentService: DepartmentService;
let staffService: StaffService;

/**
 * Initialize organization resolvers with service dependencies
 * @param services - Service instances required by resolvers
 * @param services.organization - OrganizationService instance
 * @param services.department - DepartmentService instance
 * @param services.staff - StaffService instance
 */
export const initializeOrganizationResolvers = (services: {
  organization: OrganizationService;
  department: DepartmentService;
  staff: StaffService;
}): void => {
  organizationService = services.organization;
  departmentService = services.department;
  staffService = services.staff;
};

/**
 * GraphQL Query resolvers for organizations
 */
export const organizationQueryResolvers = {
  /**
   * Get all organizations (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all organizations
   * @throws Error if user is not authenticated
   */
  organizations: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    logger.debug(
      { operation: 'organizations', userId: user?.id },
      'Processing organizations query',
    );

    if (!user) {
      logger.warn(
        { operation: 'organizations' },
        'Unauthenticated access attempt to organizations query',
      );
      throw new Error('Unauthenticated');
    }

    const organizations = organizationService.getAllOrganizations();
    logger.info(
      {
        operation: 'organizations',
        userId: user.id,
        organizationCount: organizations.length,
      },
      'Organizations query completed successfully',
    );
    return organizations;
  },

  /**
   * Get a specific organization by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing organization ID
   * @param context - GraphQL context containing user info
   * @returns Organization object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  organization: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    logger.debug(
      { operation: 'organization', organizationId: id, userId: user?.id },
      'Processing organization query',
    );

    if (!user) {
      logger.warn(
        { operation: 'organization', organizationId: id },
        'Unauthenticated access attempt to organization query',
      );
      throw new Error('Unauthenticated');
    }

    const organization = organizationService.findById(id);
    logger.info(
      {
        operation: 'organization',
        organizationId: id,
        userId: user.id,
        found: !!organization,
      },
      'Organization query completed',
    );
    return organization;
  },
};

/**
 * GraphQL Mutation resolvers for organizations
 */
export const organizationMutationResolvers = {
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
};

/**
 * Organization field resolvers for nested data
 */
export const organizationFieldResolvers = {
  rootDepartment: (parent: { rootDepartmentId?: string }) => {
    return parent.rootDepartmentId
      ? departmentService.findById(parent.rootDepartmentId)
      : null;
  },
  rootStaff: (parent: { rootStaffId?: string }) => {
    return parent.rootStaffId
      ? staffService.findById(parent.rootStaffId)
      : null;
  },
  departments: (parent: { id: string }) => {
    return departmentService.getDepartmentsByOrganization(parent.id);
  },
  staff: (parent: { id: string }) => {
    return staffService.getStaffByOrganization(parent.id);
  },
};

/**
 * Staff field resolvers for organization references
 * This resolver handles the organization field in Staff type
 */
export const staffOrganizationFieldResolvers = {
  organization: (parent: { organizationId: string }) => {
    return organizationService.findById(parent.organizationId);
  },
};
