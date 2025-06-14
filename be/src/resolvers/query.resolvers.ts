/**
 * @fileoverview Query resolvers
 *
 * This module contains all GraphQL query resolvers for read operations
 * including user queries and health checks.
 */

import type { GraphQLContext } from '../types';
import logger from '../utils/logger';
import config from '../utils/config';
import {
  UserService,
  OrganizationService,
  DepartmentService,
  StaffService,
  StatusService,
  PriorityService,
  ComplexityService,
  ProjectService,
  TaskService,
  TaskProgressService,
  TaskEvaluationService,
  TaskStatusReportService,
  ProjectStatusReportService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let userService: UserService;
let organizationService: OrganizationService;
let departmentService: DepartmentService;
let staffService: StaffService;
let statusService: StatusService;
let priorityService: PriorityService;
let complexityService: ComplexityService;
let projectService: ProjectService;
let taskService: TaskService;
let taskProgressService: TaskProgressService;
let taskEvaluationService: TaskEvaluationService;
let taskStatusReportService: TaskStatusReportService;
let projectStatusReportService: ProjectStatusReportService;

/**
 * Set the service instances for resolvers to use
 * @param user - UserService instance
 * @param organization - OrganizationService instance
 * @param department - DepartmentService instance
 * @param staff - StaffService instance
 * @param status - StatusService instance
 * @param priority - PriorityService instance
 * @param complexity - ComplexityService instance
 * @param project - ProjectService instance
 * @param task - TaskService instance
 * @param taskProgress - TaskProgressService instance
 * @param taskEvaluation - TaskEvaluationService instance
 * @param taskStatusReport - TaskStatusReportService instance
 * @param projectStatusReport - ProjectStatusReportService instance
 */
export function setServices(
  user: UserService,
  organization: OrganizationService,
  department: DepartmentService,
  staff: StaffService,
  status: StatusService,
  priority: PriorityService,
  complexity: ComplexityService,
  project: ProjectService,
  task: TaskService,
  taskProgress: TaskProgressService,
  taskEvaluation: TaskEvaluationService,
  taskStatusReport: TaskStatusReportService,
  projectStatusReport: ProjectStatusReportService,
): void {
  userService = user;
  organizationService = organization;
  departmentService = department;
  staffService = staff;
  statusService = status;
  priorityService = priority;
  complexityService = complexity;
  projectService = project;
  taskService = task;
  taskProgressService = taskProgress;
  taskEvaluationService = taskEvaluation;
  taskStatusReportService = taskStatusReport;
  projectStatusReportService = projectStatusReport;
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
    logger.debug({ operation: 'me', hasUser: !!user }, 'Processing me query');
    const result = user || null;
    logger.info({ operation: 'me', userId: user?.id }, 'Me query completed');
    return result;
  },

  /**
   * Health check resolver to verify server readiness
   * @returns true when database connection is available
   */
  health: (): boolean => {
    logger.debug({ operation: 'health' }, 'Processing health check');
    const isHealthy = Boolean(userService);
    logger.info({ operation: 'health', isHealthy }, 'Health check completed');
    return isHealthy;
  },

  /**
   * Get backend configuration with sensitive values excluded
   * @returns Configuration object without sensitive information
   */
  config: () => {
    return {
      port: config.port,
      accessTokenExpiresIn: config.accessTokenExpiresIn,
      refreshTokenExpiresIn: config.refreshTokenExpiresIn,
      dbFile: config.dbFile.replace(/^.*[/\\]/, ''), // Remove path, keep only filename for security
      logging: {
        betterStack: {
          enabled: config.logging.betterStack.enabled,
          // sourceToken excluded for security
        },
      },
    };
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
    logger.debug(
      { operation: 'users', userId: user?.id },
      'Processing users query',
    );

    if (!user) {
      logger.warn(
        { operation: 'users' },
        'Unauthenticated access attempt to users query',
      );
      throw new Error('Unauthenticated');
    }

    const users = userService.getAllUsers();
    logger.info(
      { operation: 'users', userId: user.id, userCount: users.length },
      'Users query completed successfully',
    );
    return users;
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
    logger.debug(
      { operation: 'user', targetUserId: id, requestingUserId: user?.id },
      'Processing user query',
    );

    if (!user) {
      logger.warn(
        { operation: 'user', targetUserId: id },
        'Unauthenticated access attempt to user query',
      );
      throw new Error('Unauthenticated');
    }

    const targetUser = userService.getSafeUserById(id);
    logger.info(
      {
        operation: 'user',
        targetUserId: id,
        requestingUserId: user.id,
        found: !!targetUser,
      },
      'User query completed',
    );
    return targetUser;
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
    logger.debug(
      { operation: 'department', departmentId: id, userId: user?.id },
      'Processing department query',
    );

    if (!user) {
      logger.warn(
        { operation: 'department', departmentId: id },
        'Unauthenticated access attempt to department query',
      );
      throw new Error('Unauthenticated');
    }

    const department = departmentService.findById(id);
    logger.info(
      {
        operation: 'department',
        departmentId: id,
        userId: user.id,
        found: !!department,
      },
      'Department query completed',
    );
    return department;
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
   * Get all tasks (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional project filter
   * @param context - GraphQL context containing user info
   * @returns Array of tasks
   * @throws Error if user is not authenticated
   */
  tasks: (
    _: unknown,
    { projectId }: { projectId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.getAllTasks(projectId);
  },

  /**
   * Get a specific task by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing task ID
   * @param context - GraphQL context containing user info
   * @returns Task object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  task: (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.findById(id);
  },

  /**
   * Get all task progress reports (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional task filter
   * @param context - GraphQL context containing user info
   * @returns Array of task progress reports
   * @throws Error if user is not authenticated
   */
  taskProgressReports: (
    _: unknown,
    { taskId }: { taskId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskProgressService.getAllTaskProgress(taskId);
  },

  /**
   * Get a specific task progress report by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing progress report ID
   * @param context - GraphQL context containing user info
   * @returns TaskProgress object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  taskProgressReport: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskProgressService.findById(id);
  },

  /**
   * Get all task evaluations (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional task filter
   * @param context - GraphQL context containing user info
   * @returns Array of task evaluations
   * @throws Error if user is not authenticated
   */
  taskEvaluations: (
    _: unknown,
    { taskId }: { taskId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskEvaluationService.getAllTaskEvaluations(taskId);
  },

  /**
   * Get a specific task evaluation by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing evaluation ID
   * @param context - GraphQL context containing user info
   * @returns TaskEvaluation object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  taskEvaluation: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskEvaluationService.findById(id);
  },

  /**
   * Get all task status reports (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing optional task filter
   * @param context - GraphQL context containing user info
   * @returns Array of task status reports
   * @throws Error if user is not authenticated
   */
  taskStatusReports: (
    _: unknown,
    { taskId }: { taskId?: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskStatusReportService.getAllTaskStatusReports(taskId);
  },

  /**
   * Get a specific task status report by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing status report ID
   * @param context - GraphQL context containing user info
   * @returns TaskStatusReport object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  taskStatusReport: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskStatusReportService.findById(id);
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

/**
 * Project field resolvers for nested data
 */
export const projectResolvers = {
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
 * Task field resolvers for nested data
 */
export const taskResolvers = {
  project: (parent: { projectId: string }) => {
    return projectService.findById(parent.projectId);
  },
  parentTask: (parent: { parentTaskId?: string }) => {
    return parent.parentTaskId
      ? taskService.findById(parent.parentTaskId)
      : null;
  },
  childTasks: (parent: { id: string }) => {
    return taskService.getChildTasks(parent.id);
  },
  evaluator: (parent: { evaluatorId?: string }) => {
    return parent.evaluatorId
      ? staffService.findById(parent.evaluatorId)
      : null;
  },
  status: (parent: { statusId?: string }) => {
    return parent.statusId ? statusService.findById(parent.statusId) : null;
  },
  priority: (parent: { priorityId?: string }) => {
    return parent.priorityId
      ? priorityService.findById(parent.priorityId)
      : null;
  },
  complexity: (parent: { complexityId?: string }) => {
    return parent.complexityId
      ? complexityService.findById(parent.complexityId)
      : null;
  },
  assignees: (parent: { id: string }) => {
    return taskService.getTaskAssignees(parent.id);
  },
  predecessors: (parent: { id: string }) => {
    return taskService.getTaskPredecessors(parent.id);
  },
  progressReports: (parent: { id: string }) => {
    return taskProgressService.getAllTaskProgress(parent.id);
  },
  evaluation: (parent: { id: string }) => {
    return taskEvaluationService.findByTaskId(parent.id);
  },
  statusReports: (parent: { id: string }) => {
    return taskStatusReportService.getAllTaskStatusReports(parent.id);
  },
};

/**
 * TaskProgress field resolvers for nested data
 */
export const taskProgressResolvers = {
  task: (parent: { taskId: string }) => {
    return taskService.findById(parent.taskId);
  },
};

/**
 * TaskEvaluation field resolvers for nested data
 */
export const taskEvaluationResolvers = {
  task: (parent: { taskId: string }) => {
    return taskService.findById(parent.taskId);
  },
  evaluator: (parent: { evaluatorId: string }) => {
    return staffService.findById(parent.evaluatorId);
  },
};

/**
 * TaskStatusReport field resolvers for nested data
 */
export const taskStatusReportResolvers = {
  task: (parent: { taskId: string }) => {
    return taskService.findById(parent.taskId);
  },
};

/**
 * ProjectStatusReport field resolvers for nested data
 */
export const projectStatusReportResolvers = {
  project: (parent: { projectId: string }) => {
    return projectService.findById(parent.projectId);
  },
};
