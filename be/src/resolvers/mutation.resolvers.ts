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
  CreateStatusInput,
  UpdateStatusInput,
  CreatePriorityInput,
  UpdatePriorityInput,
  CreateComplexityInput,
  UpdateComplexityInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskProgressInput,
  UpdateTaskProgressInput,
  CreateTaskEvaluationInput,
  UpdateTaskEvaluationInput,
  CreateTaskStatusReportInput,
  UpdateTaskStatusReportInput,
  CreateProjectStatusReportInput,
  UpdateProjectStatusReportInput,
} from '../types';
import logger from '../utils/logger';
import {
  AuthService,
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
let authService: AuthService;
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
 * @param auth - AuthService instance
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
  auth: AuthService,
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
  authService = auth;
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
    logger.debug({ operation: 'register', email: args.email }, 'Processing user registration');
    
    try {
      // Create the user
      const user = await userService.createUser(args);

      // Generate authentication tokens
      const accessToken = authService.signToken(user.id);
      const refreshToken = await authService.signRefreshToken(user.id);

      logger.info({ operation: 'register', userId: user.id, email: args.email }, 'User registration completed successfully');
      
      return {
        token: accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      logger.warn({ operation: 'register', email: args.email, error: error instanceof Error ? error.message : String(error) }, 'User registration failed');
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param _ - Parent object (unused)
   * @param args - Login credentials
   * @returns Promise resolving to authentication payload
   */
  login: async (_: unknown, args: LoginInput) => {
    logger.debug({ operation: 'login', email: args.email }, 'Processing user login');
    
    try {
      const result = await authService.authenticateUser(args);
      logger.info({ operation: 'login', email: args.email, userId: result.user.id }, 'User login completed successfully');
      return result;
    } catch (error) {
      logger.warn({ operation: 'login', email: args.email, error: error instanceof Error ? error.message : String(error) }, 'User login failed');
      throw error;
    }
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
    logger.debug({ operation: 'changePassword', userId: user?.id }, 'Processing password change request');
    
    if (!user) {
      logger.warn({ operation: 'changePassword' }, 'Unauthenticated access attempt to changePassword mutation');
      throw new Error('Not authenticated');
    }

    try {
      const result = await userService.changePassword(
        user.id,
        args.oldPassword,
        args.newPassword,
      );
      logger.info({ operation: 'changePassword', userId: user.id }, 'Password changed successfully');
      return result;
    } catch (error) {
      logger.warn({ operation: 'changePassword', userId: user.id, error: error instanceof Error ? error.message : String(error) }, 'Password change failed');
      throw error;
    }
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
    logger.debug({ operation: 'createUser', email: args.email, requestingUserId: user?.id }, 'Processing admin user creation');
    
    if (!user) {
      logger.warn({ operation: 'createUser', email: args.email }, 'Unauthenticated access attempt to createUser mutation');
      throw new Error('Unauthenticated');
    }

    try {
      const newUser = await userService.createUser(args);
      logger.info({ operation: 'createUser', email: args.email, newUserId: newUser.id, requestingUserId: user.id }, 'Admin user creation completed successfully');
      return newUser;
    } catch (error) {
      logger.warn({ operation: 'createUser', email: args.email, requestingUserId: user.id, error: error instanceof Error ? error.message : String(error) }, 'Admin user creation failed');
      throw error;
    }
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

  // Project mutations
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
   * Delete a project by ID
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

  // Task mutations
  /**
   * Create a new task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created task
   * @throws Error if user is not authenticated
   */
  createTask: async (
    _: unknown,
    args: CreateTaskInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.createTask(args);
  },

  /**
   * Update an existing task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated task
   * @throws Error if user is not authenticated
   */
  updateTask: async (
    _: unknown,
    args: UpdateTaskInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.updateTask(args);
  },

  /**
   * Delete a task by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteTask: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.deleteTask(id);
  },

  // Task assignment mutations
  /**
   * Assign a staff member to a task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task and staff IDs
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if assigned successfully
   * @throws Error if user is not authenticated
   */
  assignStaffToTask: async (
    _: unknown,
    { taskId, staffId }: { taskId: string; staffId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.assignStaffToTask(taskId, staffId);
  },

  /**
   * Remove a staff member from a task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task and staff IDs
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if removed successfully
   * @throws Error if user is not authenticated
   */
  removeStaffFromTask: async (
    _: unknown,
    { taskId, staffId }: { taskId: string; staffId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.removeStaffFromTask(taskId, staffId);
  },

  // Task predecessor mutations
  /**
   * Add a predecessor relationship to a task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task and predecessor task IDs
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if added successfully
   * @throws Error if user is not authenticated
   */
  addTaskPredecessor: async (
    _: unknown,
    {
      taskId,
      predecessorTaskId,
    }: { taskId: string; predecessorTaskId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.addTaskPredecessor(taskId, predecessorTaskId);
  },

  /**
   * Remove a predecessor relationship from a task
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task and predecessor task IDs
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if removed successfully
   * @throws Error if user is not authenticated
   */
  removeTaskPredecessor: async (
    _: unknown,
    {
      taskId,
      predecessorTaskId,
    }: { taskId: string; predecessorTaskId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.removeTaskPredecessor(taskId, predecessorTaskId);
  },

  // Task progress mutations
  /**
   * Create a new task progress report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing progress data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created progress report
   * @throws Error if user is not authenticated
   */
  createTaskProgress: async (
    _: unknown,
    args: CreateTaskProgressInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskProgressService.createTaskProgress(args);
  },

  /**
   * Update an existing task progress report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing progress update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated progress report
   * @throws Error if user is not authenticated
   */
  updateTaskProgress: async (
    _: unknown,
    args: UpdateTaskProgressInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskProgressService.updateTaskProgress(args);
  },

  /**
   * Delete a task progress report by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing progress report ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteTaskProgress: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskProgressService.deleteTaskProgress(id);
  },

  // Task evaluation mutations
  /**
   * Create a new task evaluation
   * @param _ - Parent object (unused)
   * @param args - Arguments containing evaluation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created evaluation
   * @throws Error if user is not authenticated
   */
  createTaskEvaluation: async (
    _: unknown,
    args: CreateTaskEvaluationInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskEvaluationService.createTaskEvaluation(args);
  },

  /**
   * Update an existing task evaluation
   * @param _ - Parent object (unused)
   * @param args - Arguments containing evaluation update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated evaluation
   * @throws Error if user is not authenticated
   */
  updateTaskEvaluation: async (
    _: unknown,
    args: UpdateTaskEvaluationInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskEvaluationService.updateTaskEvaluation(args);
  },

  /**
   * Delete a task evaluation by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing evaluation ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteTaskEvaluation: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskEvaluationService.deleteTaskEvaluation(id);
  },

  // Task status report mutations
  /**
   * Create a new task status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status report data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created status report
   * @throws Error if user is not authenticated
   */
  createTaskStatusReport: async (
    _: unknown,
    args: CreateTaskStatusReportInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskStatusReportService.createTaskStatusReport(args);
  },

  /**
   * Update an existing task status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status report update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated status report
   * @throws Error if user is not authenticated
   */
  updateTaskStatusReport: async (
    _: unknown,
    args: UpdateTaskStatusReportInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskStatusReportService.updateTaskStatusReport(args);
  },

  /**
   * Delete a task status report by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status report ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteTaskStatusReport: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskStatusReportService.deleteTaskStatusReport(id);
  },

  // Project status report mutations
  /**
   * Create a new project status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status report data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created status report
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
   * @param args - Arguments containing status report update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated status report
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
   * Delete a project status report by ID
   * @param _ - Parent object (unused)
   * @param args - Arguments containing status report ID
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
