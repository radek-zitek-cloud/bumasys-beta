/**
 * @fileoverview Task resolvers
 *
 * This module contains all GraphQL resolvers related to task management,
 * including queries, mutations, and field resolvers.
 */

import type { GraphQLContext } from '../types';
import logger from '../utils/logger';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskProgressInput,
  UpdateTaskProgressInput,
  CreateTaskEvaluationInput,
  UpdateTaskEvaluationInput,
  CreateTaskStatusReportInput,
  UpdateTaskStatusReportInput,
} from '../types';
import type {
  StaffService,
  StatusService,
  PriorityService,
  ComplexityService,
  ProjectService,
  TaskService,
  TaskProgressService,
  TaskEvaluationService,
  TaskStatusReportService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let staffService: StaffService;
let statusService: StatusService;
let priorityService: PriorityService;
let complexityService: ComplexityService;
let projectService: ProjectService;
let taskService: TaskService;
let taskProgressService: TaskProgressService;
let taskEvaluationService: TaskEvaluationService;
let taskStatusReportService: TaskStatusReportService;

/**
 * Task query resolvers
 */
export const taskQueryResolvers = {
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
};

/**
 * Task mutation resolvers
 */
export const taskMutationResolvers = {
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
   * Delete a task
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

  /**
   * Create a new task progress report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task progress data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created task progress report
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
   * @param args - Arguments containing task progress update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated task progress report
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
   * Delete a task progress report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task progress ID
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

  /**
   * Create a new task evaluation
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task evaluation data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created task evaluation
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
   * @param args - Arguments containing task evaluation update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated task evaluation
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
   * Delete a task evaluation
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task evaluation ID
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

  /**
   * Create a new task status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task status report data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created task status report
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
   * @param args - Arguments containing task status report update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated task status report
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
   * Delete a task status report
   * @param _ - Parent object (unused)
   * @param args - Arguments containing task status report ID
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
    { taskId, predecessorTaskId }: { taskId: string; predecessorTaskId: string },
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
    { taskId, predecessorTaskId }: { taskId: string; predecessorTaskId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return taskService.removeTaskPredecessor(taskId, predecessorTaskId);
  },
};

/**
 * Task field resolvers for nested data
 */
export const taskFieldResolvers = {
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
export const taskProgressFieldResolvers = {
  task: (parent: { taskId: string }) => {
    return taskService.findById(parent.taskId);
  },
};

/**
 * TaskEvaluation field resolvers for nested data
 */
export const taskEvaluationFieldResolvers = {
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
export const taskStatusReportFieldResolvers = {
  task: (parent: { taskId: string }) => {
    return taskService.findById(parent.taskId);
  },
};

/**
 * Initialize task resolvers with service dependencies
 * @param services - Object containing service instances
 */
export function initializeTaskResolvers(services: {
  staff: StaffService;
  status: StatusService;
  priority: PriorityService;
  complexity: ComplexityService;
  project: ProjectService;
  task: TaskService;
  taskProgress: TaskProgressService;
  taskEvaluation: TaskEvaluationService;
  taskStatusReport: TaskStatusReportService;
}): void {
  staffService = services.staff;
  statusService = services.status;
  priorityService = services.priority;
  complexityService = services.complexity;
  projectService = services.project;
  taskService = services.task;
  taskProgressService = services.taskProgress;
  taskEvaluationService = services.taskEvaluation;
  taskStatusReportService = services.taskStatusReport;
}
