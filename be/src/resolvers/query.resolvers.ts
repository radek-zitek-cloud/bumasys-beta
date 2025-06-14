/**
 * @fileoverview Query resolvers
 *
 * This module contains all GraphQL query resolvers for read operations
 * including user queries and health checks.
 */

import type { GraphQLContext } from '../types';
import {
  UserService,
  OrganizationService,
  DepartmentService,
  StaffService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let userService: UserService;
let organizationService: OrganizationService;
let departmentService: DepartmentService;
let staffService: StaffService;

/**
 * Set the service instances for resolvers to use
 * @param user - UserService instance
 * @param organization - OrganizationService instance
 * @param department - DepartmentService instance
 * @param staff - StaffService instance
 */
export function setServices(
  user: UserService,
  organization: OrganizationService,
  department: DepartmentService,
  staff: StaffService,
): void {
  userService = user;
  organizationService = organization;
  departmentService = department;
  staffService = staff;
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

  /**
   * Get all organizations (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all organizations
   * @throws Error if user is not authenticated
   */
  organizations: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationService.getAllOrganizations();
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
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return organizationService.findById(id);
  },

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
 * Organization field resolvers for nested data
 */
export const organizationResolvers = {
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
 * Department field resolvers for nested data
 */
export const departmentResolvers = {
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
 * Staff field resolvers for nested data
 */
export const staffResolvers = {
  organization: (parent: { organizationId: string }) => {
    return organizationService.findById(parent.organizationId);
  },
  department: (parent: { departmentId: string }) => {
    return departmentService.findById(parent.departmentId);
  },
  supervisor: (parent: { supervisorId?: string }) => {
    return parent.supervisorId
      ? staffService.findById(parent.supervisorId)
      : null;
  },
  subordinates: (parent: { id: string }) => {
    return staffService.getSubordinates(parent.id);
  },
};
