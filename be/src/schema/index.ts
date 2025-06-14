/**
 * @fileoverview GraphQL type definitions
 *
 * This module contains all GraphQL schema definitions including types,
 * queries, and mutations for the application's API.
 */

import { gql } from 'graphql-tag';

/**
 * GraphQL type definitions for the complete API schema
 *
 * Defines:
 * - User: Core user object with profile information
 * - AuthPayload: Authentication response with tokens and user data
 * - Query: Read operations for users and health checks
 * - Mutation: Write operations for authentication and user management
 */
export const typeDefs = gql`
  """
  User object representing a registered user in the system
  """
  type User {
    """
    Unique identifier for the user
    """
    id: ID!

    """
    User's email address used for authentication
    """
    email: String!

    """
    Optional first name
    """
    firstName: String

    """
    Optional last name
    """
    lastName: String

    """
    Optional note or description
    """
    note: String
  }

  """
  Organization object representing a company or organization
  """
  type Organization {
    """
    Unique identifier for the organization
    """
    id: ID!

    """
    Organization name
    """
    name: String!

    """
    Optional description
    """
    description: String

    """
    Optional root department reference
    """
    rootDepartmentId: ID

    """
    Optional root staff member reference
    """
    rootStaffId: ID

    """
    Root department object (if set)
    """
    rootDepartment: Department

    """
    Root staff member object (if set)
    """
    rootStaff: Staff

    """
    All departments in this organization
    """
    departments: [Department!]!

    """
    All staff members in this organization
    """
    staff: [Staff!]!
  }

  """
  Department object representing a department within an organization
  """
  type Department {
    """
    Unique identifier for the department
    """
    id: ID!

    """
    Department name
    """
    name: String!

    """
    Optional description
    """
    description: String

    """
    Organization this department belongs to
    """
    organizationId: ID!

    """
    Optional parent department ID
    """
    parentDepartmentId: ID

    """
    Optional manager ID
    """
    managerId: ID

    """
    Organization object this department belongs to
    """
    organization: Organization!

    """
    Parent department (if set)
    """
    parentDepartment: Department

    """
    Manager of this department (if set)
    """
    manager: Staff

    """
    Child departments
    """
    childDepartments: [Department!]!

    """
    Staff members in this department
    """
    staff: [Staff!]!
  }

  """
  Staff object representing a staff member in the organization
  """
  type Staff {
    """
    Unique identifier for the staff member
    """
    id: ID!

    """
    First name
    """
    firstName: String!

    """
    Last name
    """
    lastName: String!

    """
    Email address (unique)
    """
    email: String!

    """
    Optional phone number
    """
    phone: String

    """
    Role/position
    """
    role: String!

    """
    Organization this staff member belongs to
    """
    organizationId: ID!

    """
    Department this staff member belongs to
    """
    departmentId: ID!

    """
    Optional supervisor ID
    """
    supervisorId: ID

    """
    Organization object this staff member belongs to
    """
    organization: Organization!

    """
    Department object this staff member belongs to
    """
    department: Department!

    """
    Supervisor (if set)
    """
    supervisor: Staff

    """
    Subordinates reporting to this staff member
    """
    subordinates: [Staff!]!
  }

  """
  Status reference object
  """
  type Status {
    """
    Unique identifier for the status
    """
    id: ID!

    """
    Status name
    """
    name: String!
  }

  """
  Priority reference object
  """
  type Priority {
    """
    Unique identifier for the priority
    """
    id: ID!

    """
    Priority name
    """
    name: String!
  }

  """
  Complexity reference object
  """
  type Complexity {
    """
    Unique identifier for the complexity
    """
    id: ID!

    """
    Complexity name
    """
    name: String!
  }

  """
  Project object representing a project in the system
  """
  type Project {
    """
    Unique identifier for the project
    """
    id: ID!

    """
    Project name
    """
    name: String!

    """
    Optional description
    """
    description: String

    """
    Lead staff member ID
    """
    leadStaffId: ID

    """
    Planned start date
    """
    plannedStartDate: String

    """
    Planned end date
    """
    plannedEndDate: String

    """
    Actual start date
    """
    actualStartDate: String

    """
    Actual end date
    """
    actualEndDate: String

    """
    Lead staff member object (if set)
    """
    leadStaff: Staff

    """
    All tasks in this project
    """
    tasks: [Task!]!

    """
    All status reports for this project
    """
    statusReports: [ProjectStatusReport!]!
  }

  """
  Task object representing a task in the system
  """
  type Task {
    """
    Unique identifier for the task
    """
    id: ID!

    """
    Task name
    """
    name: String!

    """
    Optional description
    """
    description: String

    """
    Project this task belongs to
    """
    projectId: ID!

    """
    Parent task ID for sub-tasks
    """
    parentTaskId: ID

    """
    Evaluator staff ID
    """
    evaluatorId: ID

    """
    Status ID
    """
    statusId: ID

    """
    Priority ID
    """
    priorityId: ID

    """
    Complexity ID
    """
    complexityId: ID

    """
    Planned start date
    """
    plannedStartDate: String

    """
    Planned end date
    """
    plannedEndDate: String

    """
    Actual start date
    """
    actualStartDate: String

    """
    Actual end date
    """
    actualEndDate: String

    """
    Project object this task belongs to
    """
    project: Project!

    """
    Parent task (if set)
    """
    parentTask: Task

    """
    Child tasks
    """
    childTasks: [Task!]!

    """
    Evaluator staff member (if set)
    """
    evaluator: Staff

    """
    Status object (if set)
    """
    status: Status

    """
    Priority object (if set)
    """
    priority: Priority

    """
    Complexity object (if set)
    """
    complexity: Complexity

    """
    Staff members assigned to this task
    """
    assignees: [Staff!]!

    """
    Predecessor tasks
    """
    predecessors: [Task!]!

    """
    Progress reports for this task
    """
    progressReports: [TaskProgress!]!

    """
    Evaluation for this task (if exists)
    """
    evaluation: TaskEvaluation

    """
    Status reports for this task
    """
    statusReports: [TaskStatusReport!]!
  }

  """
  Task progress report object
  """
  type TaskProgress {
    """
    Unique identifier for the progress report
    """
    id: ID!

    """
    Task this progress report belongs to
    """
    taskId: ID!

    """
    Report date
    """
    reportDate: String!

    """
    Progress percentage (0-100)
    """
    progressPercent: Int!

    """
    Optional notes
    """
    notes: String

    """
    Task object this progress report belongs to
    """
    task: Task!
  }

  """
  Task evaluation object
  """
  type TaskEvaluation {
    """
    Unique identifier for the evaluation
    """
    id: ID!

    """
    Task this evaluation belongs to
    """
    taskId: ID!

    """
    Evaluator staff ID
    """
    evaluatorId: ID!

    """
    Evaluation date
    """
    evaluationDate: String!

    """
    Optional evaluation notes
    """
    evaluationNotes: String

    """
    Evaluation result
    """
    result: String

    """
    Task object this evaluation belongs to
    """
    task: Task!

    """
    Evaluator staff member
    """
    evaluator: Staff!
  }

  """
  Task status report object
  """
  type TaskStatusReport {
    """
    Unique identifier for the status report
    """
    id: ID!

    """
    Task this status report belongs to
    """
    taskId: ID!

    """
    Report date
    """
    reportDate: String!

    """
    Status summary
    """
    statusSummary: String

    """
    Task object this status report belongs to
    """
    task: Task!
  }

  """
  Project status report object
  """
  type ProjectStatusReport {
    """
    Unique identifier for the status report
    """
    id: ID!

    """
    Project this status report belongs to
    """
    projectId: ID!

    """
    Report date
    """
    reportDate: String!

    """
    Status summary
    """
    statusSummary: String

    """
    Project object this status report belongs to
    """
    project: Project!
  }

  """
  Authentication payload returned by login and registration operations
  """
  type AuthPayload {
    """
    JWT access token for API authentication
    """
    token: String!

    """
    Refresh token for obtaining new access tokens
    """
    refreshToken: String!

    """
    User information without sensitive data
    """
    user: User!
  }

  """
  Backend configuration object (sensitive values excluded)
  """
  type Config {
    """
    Server port number
    """
    port: Int!

    """
    Access token expiration duration
    """
    accessTokenExpiresIn: String!

    """
    Refresh token expiration duration
    """
    refreshTokenExpiresIn: String!

    """
    Database file path (sanitized)
    """
    dbFile: String!

    """
    Logging configuration
    """
    logging: LoggingConfig!
  }

  """
  Logging configuration object
  """
  type LoggingConfig {
    """
    BetterStack logging configuration
    """
    betterStack: BetterStackConfig!
  }

  """
  BetterStack logging configuration (source token excluded)
  """
  type BetterStackConfig {
    """
    Whether BetterStack logging is enabled
    """
    enabled: Boolean!
  }

  """
  Query operations for reading data
  """
  type Query {
    """
    Get the currently authenticated user's information
    Returns null if not authenticated
    """
    me: User

    """
    Health check endpoint to verify server readiness
    Returns true when the server and database are ready
    """
    health: Boolean!

    """
    Get backend configuration (sensitive values excluded)
    """
    config: Config!

    """
    Get all users in the system (requires authentication)
    """
    users: [User!]!

    """
    Get a specific user by ID (requires authentication)
    Returns null if user not found
    """
    user(id: ID!): User

    """
    Get all organizations (requires authentication)
    """
    organizations: [Organization!]!

    """
    Get a specific organization by ID (requires authentication)
    Returns null if organization not found
    """
    organization(id: ID!): Organization

    """
    Get all departments (requires authentication)
    Optionally filter by organization
    """
    departments(organizationId: ID): [Department!]!

    """
    Get a specific department by ID (requires authentication)
    Returns null if department not found
    """
    department(id: ID!): Department

    """
    Get all staff members (requires authentication)
    Optionally filter by organization or department
    """
    staff(organizationId: ID, departmentId: ID): [Staff!]!

    """
    Get a specific staff member by ID (requires authentication)
    Returns null if staff member not found
    """
    staffMember(id: ID!): Staff

    """
    Get all statuses (requires authentication)
    """
    statuses: [Status!]!

    """
    Get a specific status by ID (requires authentication)
    Returns null if status not found
    """
    status(id: ID!): Status

    """
    Get all priorities (requires authentication)
    """
    priorities: [Priority!]!

    """
    Get a specific priority by ID (requires authentication)
    Returns null if priority not found
    """
    priority(id: ID!): Priority

    """
    Get all complexities (requires authentication)
    """
    complexities: [Complexity!]!

    """
    Get a specific complexity by ID (requires authentication)
    Returns null if complexity not found
    """
    complexity(id: ID!): Complexity

    """
    Get all projects (requires authentication)
    """
    projects: [Project!]!

    """
    Get a specific project by ID (requires authentication)
    Returns null if project not found
    """
    project(id: ID!): Project

    """
    Get all tasks (requires authentication)
    Optionally filter by project
    """
    tasks(projectId: ID): [Task!]!

    """
    Get a specific task by ID (requires authentication)
    Returns null if task not found
    """
    task(id: ID!): Task

    """
    Get all task progress reports (requires authentication)
    Optionally filter by task
    """
    taskProgressReports(taskId: ID): [TaskProgress!]!

    """
    Get a specific task progress report by ID (requires authentication)
    Returns null if progress report not found
    """
    taskProgressReport(id: ID!): TaskProgress

    """
    Get all task evaluations (requires authentication)
    Optionally filter by task
    """
    taskEvaluations(taskId: ID): [TaskEvaluation!]!

    """
    Get a specific task evaluation by ID (requires authentication)
    Returns null if evaluation not found
    """
    taskEvaluation(id: ID!): TaskEvaluation

    """
    Get all task status reports (requires authentication)
    Optionally filter by task
    """
    taskStatusReports(taskId: ID): [TaskStatusReport!]!

    """
    Get a specific task status report by ID (requires authentication)
    Returns null if status report not found
    """
    taskStatusReport(id: ID!): TaskStatusReport

    """
    Get all project status reports (requires authentication)
    Optionally filter by project
    """
    projectStatusReports(projectId: ID): [ProjectStatusReport!]!

    """
    Get a specific project status report by ID (requires authentication)
    Returns null if status report not found
    """
    projectStatusReport(id: ID!): ProjectStatusReport
  }

  """
  Mutation operations for modifying data
  """
  type Mutation {
    """
    Register a new user account
    """
    register(
      email: String!
      password: String!
      firstName: String
      lastName: String
      note: String
    ): AuthPayload!

    """
    Login with email and password
    """
    login(email: String!, password: String!): AuthPayload!

    """
    Change the current user's password (requires authentication)
    """
    changePassword(oldPassword: String!, newPassword: String!): Boolean!

    """
    Create a new user (admin operation, requires authentication)
    """
    createUser(
      email: String!
      password: String!
      firstName: String
      lastName: String
      note: String
    ): User!

    """
    Update an existing user's information (requires authentication)
    """
    updateUser(
      id: ID!
      email: String
      password: String
      firstName: String
      lastName: String
      note: String
    ): User!

    """
    Delete a user by ID (requires authentication)
    """
    deleteUser(id: ID!): Boolean!

    """
    Logout and invalidate all refresh tokens for the user
    """
    logout(refreshToken: String!): Boolean!

    """
    Refresh an access token using a valid refresh token
    """
    refreshToken(refreshToken: String!): AuthPayload!

    """
    Initiate password reset process (placeholder implementation)
    """
    resetPassword(email: String!): Boolean!

    """
    Create a new organization (requires authentication)
    """
    createOrganization(name: String!, description: String): Organization!

    """
    Update an existing organization (requires authentication)
    """
    updateOrganization(
      id: ID!
      name: String
      description: String
      rootDepartmentId: ID
      rootStaffId: ID
    ): Organization!

    """
    Delete an organization by ID (requires authentication)
    """
    deleteOrganization(id: ID!): Boolean!

    """
    Create a new department (requires authentication)
    """
    createDepartment(
      name: String!
      description: String
      organizationId: ID!
      parentDepartmentId: ID
    ): Department!

    """
    Update an existing department (requires authentication)
    """
    updateDepartment(
      id: ID!
      name: String
      description: String
      parentDepartmentId: ID
      managerId: ID
    ): Department!

    """
    Delete a department by ID (requires authentication)
    """
    deleteDepartment(id: ID!): Boolean!

    """
    Create a new staff member (requires authentication)
    """
    createStaff(
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      role: String!
      organizationId: ID!
      departmentId: ID!
      supervisorId: ID
    ): Staff!

    """
    Update an existing staff member (requires authentication)
    """
    updateStaff(
      id: ID!
      firstName: String
      lastName: String
      email: String
      phone: String
      role: String
      departmentId: ID
      supervisorId: ID
    ): Staff!

    """
    Delete a staff member by ID (requires authentication)
    """
    deleteStaff(id: ID!): Boolean!

    """
    Create a new status (requires authentication)
    """
    createStatus(name: String!): Status!

    """
    Update an existing status (requires authentication)
    """
    updateStatus(id: ID!, name: String!): Status!

    """
    Delete a status by ID (requires authentication)
    """
    deleteStatus(id: ID!): Boolean!

    """
    Create a new priority (requires authentication)
    """
    createPriority(name: String!): Priority!

    """
    Update an existing priority (requires authentication)
    """
    updatePriority(id: ID!, name: String!): Priority!

    """
    Delete a priority by ID (requires authentication)
    """
    deletePriority(id: ID!): Boolean!

    """
    Create a new complexity (requires authentication)
    """
    createComplexity(name: String!): Complexity!

    """
    Update an existing complexity (requires authentication)
    """
    updateComplexity(id: ID!, name: String!): Complexity!

    """
    Delete a complexity by ID (requires authentication)
    """
    deleteComplexity(id: ID!): Boolean!

    """
    Create a new project (requires authentication)
    """
    createProject(
      name: String!
      description: String
      leadStaffId: ID
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
    ): Project!

    """
    Update an existing project (requires authentication)
    """
    updateProject(
      id: ID!
      name: String
      description: String
      leadStaffId: ID
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
    ): Project!

    """
    Delete a project by ID (requires authentication)
    """
    deleteProject(id: ID!): Boolean!

    """
    Create a new task (requires authentication)
    """
    createTask(
      name: String!
      description: String
      projectId: ID!
      parentTaskId: ID
      evaluatorId: ID
      statusId: ID
      priorityId: ID
      complexityId: ID
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
    ): Task!

    """
    Update an existing task (requires authentication)
    """
    updateTask(
      id: ID!
      name: String
      description: String
      parentTaskId: ID
      evaluatorId: ID
      statusId: ID
      priorityId: ID
      complexityId: ID
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
    ): Task!

    """
    Delete a task by ID (requires authentication)
    """
    deleteTask(id: ID!): Boolean!

    """
    Assign a staff member to a task (requires authentication)
    """
    assignStaffToTask(taskId: ID!, staffId: ID!): Boolean!

    """
    Remove a staff member from a task (requires authentication)
    """
    removeStaffFromTask(taskId: ID!, staffId: ID!): Boolean!

    """
    Add a predecessor relationship to a task (requires authentication)
    """
    addTaskPredecessor(taskId: ID!, predecessorTaskId: ID!): Boolean!

    """
    Remove a predecessor relationship from a task (requires authentication)
    """
    removeTaskPredecessor(taskId: ID!, predecessorTaskId: ID!): Boolean!

    """
    Create a new task progress report (requires authentication)
    """
    createTaskProgress(
      taskId: ID!
      reportDate: String!
      progressPercent: Int!
      notes: String
    ): TaskProgress!

    """
    Update an existing task progress report (requires authentication)
    """
    updateTaskProgress(
      id: ID!
      reportDate: String
      progressPercent: Int
      notes: String
    ): TaskProgress!

    """
    Delete a task progress report by ID (requires authentication)
    """
    deleteTaskProgress(id: ID!): Boolean!

    """
    Create a new task evaluation (requires authentication)
    """
    createTaskEvaluation(
      taskId: ID!
      evaluatorId: ID!
      evaluationDate: String!
      evaluationNotes: String
      result: String
    ): TaskEvaluation!

    """
    Update an existing task evaluation (requires authentication)
    """
    updateTaskEvaluation(
      id: ID!
      evaluatorId: ID
      evaluationDate: String
      evaluationNotes: String
      result: String
    ): TaskEvaluation!

    """
    Delete a task evaluation by ID (requires authentication)
    """
    deleteTaskEvaluation(id: ID!): Boolean!

    """
    Create a new task status report (requires authentication)
    """
    createTaskStatusReport(
      taskId: ID!
      reportDate: String!
      statusSummary: String
    ): TaskStatusReport!

    """
    Update an existing task status report (requires authentication)
    """
    updateTaskStatusReport(
      id: ID!
      reportDate: String
      statusSummary: String
    ): TaskStatusReport!

    """
    Delete a task status report by ID (requires authentication)
    """
    deleteTaskStatusReport(id: ID!): Boolean!

    """
    Create a new project status report (requires authentication)
    """
    createProjectStatusReport(
      projectId: ID!
      reportDate: String!
      statusSummary: String
    ): ProjectStatusReport!

    """
    Update an existing project status report (requires authentication)
    """
    updateProjectStatusReport(
      id: ID!
      reportDate: String
      statusSummary: String
    ): ProjectStatusReport!

    """
    Delete a project status report by ID (requires authentication)
    """
    deleteProjectStatusReport(id: ID!): Boolean!
  }
`;
