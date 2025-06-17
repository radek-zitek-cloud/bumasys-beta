/**
 * @fileoverview GraphQL resolvers index
 *
 * This module combines all GraphQL resolvers into a single resolver object
 * and provides initialization functions for setting up services.
 */

import {
  referenceDataQueryResolvers,
  referenceDataMutationResolvers,
  setServices as setReferenceDataServices,
} from './reference.data.resolvers';
import {
  staffQueryResolvers,
  staffMutationResolvers,
  staffFieldResolvers,
  initializeStaffResolvers,
} from './staff.resolvers';
import {
  teamQueryResolvers,
  teamMutationResolvers,
  teamFieldResolvers,
  teamMemberFieldResolvers,
  initializeTeamResolvers,
} from './team.resolvers';
import {
  projectQueryResolvers,
  projectMutationResolvers,
  projectFieldResolvers,
  projectStatusReportFieldResolvers,
  initializeProjectResolvers,
} from './project.resolvers';
import {
  taskQueryResolvers,
  taskMutationResolvers,
  taskFieldResolvers,
  taskProgressFieldResolvers,
  taskEvaluationFieldResolvers,
  taskStatusReportFieldResolvers,
  initializeTaskResolvers,
} from './task.resolvers';
import {
  healthResolvers,
  setServices as setHealthServices,
} from './health.resolvers';
import {
  authResolvers,
  authMutationResolvers,
  setServices as setAuthServices,
} from './auth.resolvers';
import {
  userResolvers,
  userMutationResolvers,
  setServices as setUserServices,
} from './user.resolvers';
import {
  organizationQueryResolvers,
  organizationMutationResolvers,
  organizationFieldResolvers,
  staffOrganizationFieldResolvers,
  initializeOrganizationResolvers,
} from './organization.resolvers';
import {
  departmentQueryResolvers,
  departmentMutationResolvers,
  departmentFieldResolvers,
  staffDepartmentFieldResolvers,
  initializeDepartmentResolvers,
} from './department.resolvers';
import {
  databaseMutationResolvers,
  setDatabaseServices,
} from './database.resolvers';

import {
  AuthService,
  UserService,
  DatabaseService,
  OrganizationService,
  DepartmentService,
  StaffService,
  TeamService,
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
  Query: {
    ...referenceDataQueryResolvers,
    ...healthResolvers,
    ...authResolvers,
    ...userResolvers,
    ...organizationQueryResolvers,
    ...departmentQueryResolvers,
    ...staffQueryResolvers,
    ...teamQueryResolvers,
    ...projectQueryResolvers,
    ...taskQueryResolvers,
  },
  Mutation: {
    ...referenceDataMutationResolvers,
    ...authMutationResolvers,
    ...userMutationResolvers,
    ...organizationMutationResolvers,
    ...departmentMutationResolvers,
    ...staffMutationResolvers,
    ...teamMutationResolvers,
    ...projectMutationResolvers,
    ...taskMutationResolvers,
    ...databaseMutationResolvers,
  },
  Organization: organizationFieldResolvers,
  Department: departmentFieldResolvers,
  Staff: {
    ...staffFieldResolvers,
    ...staffOrganizationFieldResolvers,
    ...staffDepartmentFieldResolvers,
  },
  Team: teamFieldResolvers,
  TeamMember: teamMemberFieldResolvers,
  Project: projectFieldResolvers,
  Task: taskFieldResolvers,
  TaskProgress: taskProgressFieldResolvers,
  TaskEvaluation: taskEvaluationFieldResolvers,
  TaskStatusReport: taskStatusReportFieldResolvers,
  ProjectStatusReport: projectStatusReportFieldResolvers,
};

/**
 * Initialize resolvers with service instances
 * Must be called during application startup after database initialization
 * Sets up services for query, mutation, health check, and authentication resolvers
 * @param authService - AuthService instance for authentication operations
 * @param userService - UserService instance for user operations
 * @param databaseService - DatabaseService instance for database operations
 * @param organizationService - OrganizationService instance for organization operations
 * @param departmentService - DepartmentService instance for department operations
 * @param staffService - StaffService instance for staff operations
 * @param teamService - TeamService instance for team operations
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
  databaseService: DatabaseService,
  organizationService: OrganizationService,
  departmentService: DepartmentService,
  staffService: StaffService,
  teamService: TeamService,
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
  setDatabaseServices(databaseService);
  setReferenceDataServices(statusService, priorityService, complexityService);
  setHealthServices(userService, databaseService);
  setAuthServices(userService, authService);
  setUserServices(userService);
  initializeOrganizationResolvers({
    organization: organizationService,
    department: departmentService,
    staff: staffService,
  });
  initializeDepartmentResolvers({
    department: departmentService,
    organization: organizationService,
    staff: staffService,
  });
  initializeStaffResolvers({
    staff: staffService,
  });
  initializeTeamResolvers({
    staff: staffService,
    team: teamService,
  });
  initializeProjectResolvers({
    staff: staffService,
    project: projectService,
    projectStatusReport: projectStatusReportService,
  });
  initializeTaskResolvers({
    staff: staffService,
    status: statusService,
    priority: priorityService,
    complexity: complexityService,
    project: projectService,
    task: taskService,
    taskProgress: taskProgressService,
    taskEvaluation: taskEvaluationService,
    taskStatusReport: taskStatusReportService,
  });
}
