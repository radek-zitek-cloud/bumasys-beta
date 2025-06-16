/**
 * @fileoverview Project resolvers
 *
 * This module contains all GraphQL resolvers related to project management,
 * including queries, mutations, and field resolvers.
 */

import type { GraphQLContext } from '../types';
import logger from '../utils/logger';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectStatusReportInput,
  UpdateProjectStatusReportInput,
} from '../types';
import type {
  StaffService,
  ProjectService,
  ProjectStatusReportService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let staffService: StaffService;
let projectService: ProjectService;
let projectStatusReportService: ProjectStatusReportService;

/**
 * Project query resolvers
 */
export const projectQueryResolvers = {
  /**
   * Get all projects (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all projects
   * @throws Error if user is not authenticated
   */
  projects: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectService.getAllProjects();
  },

  /**
   * Get a specific project by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing project ID
   * @param context - GraphQL context containing user info
   * @returns Project object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  project: (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectService.findById(id);
  },

  /**
   * Get all project status reports (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional project filter
   * @param context - GraphQL context containing user info
   * @returns Array of project status reports
   * @throws Error if user is not authenticated
   */
  projectStatusReports: (
    _: unknown,
    { projectId }: { projectId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectStatusReportService.getAllProjectStatusReports(projectId);
  },

  /**
   * Get a specific project status report by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing status report ID
   * @param context - GraphQL context containing user info
   * @returns ProjectStatusReport object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  projectStatusReport: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectStatusReportService.findById(id);
  },
};

/**
 * Project mutation resolvers
 */
export const projectMutationResolvers = {
  /**
   * Create a new project
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created project
   * @throws Error if user is not authenticated
   */
  createProject: async (
    _: unknown,
    args: CreateProjectInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectService.createProject(args);
  },

  /**
   * Update an existing project
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated project
   * @throws Error if user is not authenticated
   */
  updateProject: async (
    _: unknown,
    args: UpdateProjectInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectService.updateProject(args);
  },

  /**
   * Delete a project
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteProject: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectService.deleteProject(id);
  },

  /**
   * Create a new project status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project status report data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created project status report
   * @throws Error if user is not authenticated
   */
  createProjectStatusReport: async (
    _: unknown,
    args: CreateProjectStatusReportInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectStatusReportService.createProjectStatusReport(args);
  },

  /**
   * Update an existing project status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project status report update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated project status report
   * @throws Error if user is not authenticated
   */
  updateProjectStatusReport: async (
    _: unknown,
    args: UpdateProjectStatusReportInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectStatusReportService.updateProjectStatusReport(args);
  },

  /**
   * Delete a project status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing project status report ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteProjectStatusReport: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return projectStatusReportService.deleteProjectStatusReport(id);
  },
};

/**
 * Project field resolvers for nested data
 */
export const projectFieldResolvers = {
  leadStaff: (parent: { leadStaffId?: string }) => {
    return parent.leadStaffId
      ? staffService.findById(parent.leadStaffId)
      : null;
  },
  tasks: (parent: { id: string }) => {
    return projectService.getProjectTasks(parent.id);
  },
  statusReports: (parent: { id: string }) => {
    return projectService.getProjectStatusReports(parent.id);
  },
};

/**
 * ProjectStatusReport field resolvers for nested data
 */
export const projectStatusReportFieldResolvers = {
  project: (parent: { projectId: string }) => {
    return projectService.findById(parent.projectId);
  },
};

/**
 * Initialize project resolvers with service dependencies
 * @param services - Object containing service instances
 */
export function initializeProjectResolvers(services: {
  staff: StaffService;
  project: ProjectService;
  projectStatusReport: ProjectStatusReportService;
}): void {
  staffService = services.staff;
  projectService = services.project;
  projectStatusReportService = services.projectStatusReport;
}
