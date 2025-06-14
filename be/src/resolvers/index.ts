/**
 * @fileoverview GraphQL resolvers index
 *
 * This module combines all GraphQL resolvers into a single resolver object
 * and provides initialization functions for setting up services.
 */

import {
  queryResolvers,
  organizationResolvers,
  departmentResolvers,
  staffResolvers,
  setServices as setQueryServices,
} from './query.resolvers';
import {
  mutationResolvers,
  setServices as setMutationServices,
} from './mutation.resolvers';
import {
  AuthService,
  UserService,
  OrganizationService,
  DepartmentService,
  StaffService,
} from '../services';

/**
 * Combined GraphQL resolvers object
 * Contains all query and mutation resolvers organized by type
 */
export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Organization: organizationResolvers,
  Department: departmentResolvers,
  Staff: staffResolvers,
};

/**
 * Initialize resolvers with service instances
 * Must be called during application startup after database initialization
 * @param authService - AuthService instance for authentication operations
 * @param userService - UserService instance for user operations
 * @param organizationService - OrganizationService instance for organization operations
 * @param departmentService - DepartmentService instance for department operations
 * @param staffService - StaffService instance for staff operations
 */
export function initializeResolvers(
  authService: AuthService,
  userService: UserService,
  organizationService: OrganizationService,
  departmentService: DepartmentService,
  staffService: StaffService,
): void {
  setQueryServices(
    userService,
    organizationService,
    departmentService,
    staffService,
  );
  setMutationServices(
    authService,
    userService,
    organizationService,
    departmentService,
    staffService,
  );
}
