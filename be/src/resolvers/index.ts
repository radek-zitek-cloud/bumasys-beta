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
  projectResolvers,
  taskResolvers,
  taskProgressResolvers,
  taskEvaluationResolvers,
  taskStatusReportResolvers,
  projectStatusReportResolvers,
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
import GraphQLJSON from 'graphql-type-json';

/**
 * Combined GraphQL resolvers object
 * Contains all query and mutation resolvers organized by type
 */
export const resolvers = {
  JSON: GraphQLJSON,
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Organization: organizationResolvers,
  Department: departmentResolvers,
  Staff: staffResolvers,
  Project: projectResolvers,
  Task: taskResolvers,
  TaskProgress: taskProgressResolvers,
  TaskEvaluation: taskEvaluationResolvers,
  TaskStatusReport: taskStatusReportResolvers,
  ProjectStatusReport: projectStatusReportResolvers,
};

/**
 * Initialize resolvers with service instances
 * Must be called during application startup after database initialization
 * @param authService - AuthService instance for authentication operations
 * @param userService - UserService instance for user operations
 * @param organizationService - OrganizationService instance for organization operations
 * @param departmentService - DepartmentService instance for department operations
 * @param staffService - StaffService instance for staff operations
 * @param statusService - StatusService instance for status operations
 * @param priorityService - PriorityService instance for priority operations
 * @param complexityService - ComplexityService instance for complexity operations
 * @param projectService - ProjectService instance for project operations
 * @param taskService - TaskService instance for task operations
 * @param taskProgressService - TaskProgressService instance for task progress operations
 * @param taskEvaluationService - TaskEvaluationService instance for task evaluation operations
 * @param taskStatusReportService - TaskStatusReportService instance for task status report operations
 * @param projectStatusReportService - ProjectStatusReportService instance for project status report operations
 */
export function initializeResolvers(
  authService: AuthService,
  userService: UserService,
  organizationService: OrganizationService,
  departmentService: DepartmentService,
  staffService: StaffService,
  statusService: StatusService,
  priorityService: PriorityService,
  complexityService: ComplexityService,
  projectService: ProjectService,
  taskService: TaskService,
  taskProgressService: TaskProgressService,
  taskEvaluationService: TaskEvaluationService,
  taskStatusReportService: TaskStatusReportService,
  projectStatusReportService: ProjectStatusReportService,
): void {
  setQueryServices(
    userService,
    organizationService,
    departmentService,
    staffService,
    statusService,
    priorityService,
    complexityService,
    projectService,
    taskService,
    taskProgressService,
    taskEvaluationService,
    taskStatusReportService,
    projectStatusReportService,
  );
  setMutationServices(
    authService,
    userService,
    organizationService,
    departmentService,
    staffService,
    statusService,
    priorityService,
    complexityService,
    projectService,
    taskService,
    taskProgressService,
    taskEvaluationService,
    taskStatusReportService,
    projectStatusReportService,
  );
}
