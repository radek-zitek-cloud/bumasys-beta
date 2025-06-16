/**
 * @fileoverview Reference Data resolvers
 *
 * This module contains all GraphQL resolvers for reference data management
 * including statuses, priorities, and complexities. These are the foundational
 * data types used throughout the application for categorizing and organizing
 * business entities.
 */

import type {
  GraphQLContext,
  CreateStatusInput,
  UpdateStatusInput,
  CreatePriorityInput,
  UpdatePriorityInput,
  CreateComplexityInput,
  UpdateComplexityInput,
} from '../types';
import logger from '../utils/logger';
import {
  StatusService,
  PriorityService,
  ComplexityService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let statusService: StatusService;
let priorityService: PriorityService;
let complexityService: ComplexityService;

/**
 * Set the service instances for resolvers to use
 * @param status - StatusService instance
 * @param priority - PriorityService instance
 * @param complexity - ComplexityService instance
 */
export function setServices(
  status: StatusService,
  priority: PriorityService,
  complexity: ComplexityService,
): void {
  statusService = status;
  priorityService = priority;
  complexityService = complexity;
}

/**
 * GraphQL Query resolvers for reference data
 */
export const referenceDataQueryResolvers = {

  /**
   * Get all statuses (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all statuses
   * @throws Error if user is not authenticated
   */
  statuses: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return statusService.getAllStatuses();
  },

  /**
   * Get a specific status by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing status ID
   * @param context - GraphQL context containing user info
   * @returns Status object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  status: (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return statusService.findById(id);
  },

  /**
   * Get all priorities (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all priorities
   * @throws Error if user is not authenticated
   */
  priorities: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return priorityService.getAllPriorities();
  },

  /**
   * Get a specific priority by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing priority ID
   * @param context - GraphQL context containing user info
   * @returns Priority object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  priority: (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return priorityService.findById(id);
  },

  /**
   * Get all complexities (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all complexities
   * @throws Error if user is not authenticated
   */
  complexities: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return complexityService.getAllComplexities();
  },

  /**
   * Get a specific complexity by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing complexity ID
   * @param context - GraphQL context containing user info
   * @returns Complexity object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  complexity: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return complexityService.findById(id);
  },
};

/**
 * GraphQL Mutation resolvers for reference data
 */
export const referenceDataMutationResolvers = {

  // Status mutations
  /**
   * Create a new status
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created status
   * @throws Error if user is not authenticated
   */
  createStatus: async (
    _: unknown,
    args: CreateStatusInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return statusService.createStatus(args);
  },

  /**
   * Update an existing status
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated status
   * @throws Error if user is not authenticated
   */
  updateStatus: async (
    _: unknown,
    args: UpdateStatusInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return statusService.updateStatus(args);
  },

  /**
   * Delete a status by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteStatus: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return statusService.deleteStatus(id);
  },

  // Priority mutations
  /**
   * Create a new priority
   * @param _ - Parent object (unused)
   * @param args - Arguments containing priority data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created priority
   * @throws Error if user is not authenticated
   */
  createPriority: async (
    _: unknown,
    args: CreatePriorityInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return priorityService.createPriority(args);
  },

  /**
   * Update an existing priority
   * @param _ - Parent object (unused)
   * @param args - Arguments containing priority update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated priority
   * @throws Error if user is not authenticated
   */
  updatePriority: async (
    _: unknown,
    args: UpdatePriorityInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return priorityService.updatePriority(args);
  },

  /**
   * Delete a priority by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing priority ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deletePriority: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return priorityService.deletePriority(id);
  },

  // Complexity mutations
  /**
   * Create a new complexity
   * @param _ - Parent object (unused)
   * @param args - Arguments containing complexity data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created complexity
   * @throws Error if user is not authenticated
   */
  createComplexity: async (
    _: unknown,
    args: CreateComplexityInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return complexityService.createComplexity(args);
  },

  /**
   * Update an existing complexity
   * @param _ - Parent object (unused)
   * @param args - Arguments containing complexity update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated complexity
   * @throws Error if user is not authenticated
   */
  updateComplexity: async (
    _: unknown,
    args: UpdateComplexityInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return complexityService.updateComplexity(args);
  },

  /**
   * Delete a complexity by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing complexity ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteComplexity: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return complexityService.deleteComplexity(id);
  },
};
