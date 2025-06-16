/**
 * @fileoverview Department-related GraphQL resolvers
 *
 * This module contains GraphQL resolvers for department management operations
 * including department queries, mutations, and field resolvers for nested data.
 */

import type {
  GraphQLContext,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../types';
import { DepartmentService, OrganizationService, StaffService } from '../services';
import logger from '../utils/logger';

let departmentService: DepartmentService;
let organizationService: OrganizationService;
let staffService: StaffService;

/**
 * Initialize department resolvers with service dependencies
 * @param services - Service instances required by resolvers
 * @param services.department - DepartmentService instance
 * @param services.organization - OrganizationService instance
 * @param services.staff - StaffService instance
 */
export const initializeDepartmentResolvers = (services: {
  department: DepartmentService;
  organization: OrganizationService;
  staff: StaffService;
}): void => {
  departmentService = services.department;
  organizationService = services.organization;
  staffService = services.staff;
};

/**
 * GraphQL Query resolvers for departments
 */
export const departmentQueryResolvers = {
  /**
   * Get all departments (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional organization filter
   * @param context - GraphQL context containing user info
   * @returns Array of departments
   * @throws Error if user is not authenticated
   */
  departments: (
    _: unknown,
    { organizationId }: { organizationId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationId
      ? departmentService.getDepartmentsByOrganization(organizationId)
      : departmentService.getAllDepartments();
  },

  /**
   * Get a specific department by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing department ID
   * @param context - GraphQL context containing user info
   * @returns Department object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  department: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return departmentService.findById(id);
  },
};

/**
 * GraphQL Mutation resolvers for departments
 */
export const departmentMutationResolvers = {
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
};

/**
 * Department field resolvers for nested data
 */
export const departmentFieldResolvers = {
  organization: (parent: { organizationId: string }) => {
    return organizationService.findById(parent.organizationId);
  },
  parentDepartment: (parent: { parentDepartmentId?: string }) => {
    return parent.parentDepartmentId
      ? departmentService.findById(parent.parentDepartmentId)
      : null;
  },
  manager: (parent: { managerId?: string }) => {
    return parent.managerId ? staffService.findById(parent.managerId) : null;
  },
  childDepartments: (parent: { id: string }) => {
    return departmentService.getChildDepartments(parent.id);
  },
  staff: (parent: { id: string }) => {
    return staffService.getStaffByDepartment(parent.id);
  },
};

/**
 * Staff field resolvers for department references
 * This resolver handles the department field in Staff type
 */
export const staffDepartmentFieldResolvers = {
  department: (parent: { departmentId: string }) => {
    return departmentService.findById(parent.departmentId);
  },
};
