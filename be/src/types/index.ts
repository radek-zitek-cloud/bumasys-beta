/**
 * @fileoverview Core type definitions for the application
 *
 * This module contains all TypeScript interfaces and types used throughout
 * the backend application, including user models, database schemas, and
 * GraphQL context types.
 */

/**
 * Represents a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address (used for authentication) */
  email: string;
  /** Hashed password for authentication */
  password: string;
  /** Optional first name */
  firstName?: string;
  /** Optional last name */
  lastName?: string;
  /** Optional note or description */
  note?: string;
}

/**
 * User data without sensitive information (password)
 * Used for API responses and client-side data
 */
export interface SafeUser {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** Optional first name */
  firstName?: string;
  /** Optional last name */
  lastName?: string;
  /** Optional note or description */
  note?: string;
}

/**
 * Represents an active user session with refresh token
 */
export interface Session {
  /** The refresh token string */
  token: string;
  /** ID of the user this session belongs to */
  userId: string;
  /** ISO timestamp when the session was created */
  createdAt: string;
}

/**
 * Authentication database interface for user authentication data
 */
export interface AuthDatabase {
  /** The authentication data stored in the database */
  data: {
    /** Array of all users in the system */
    users: User[];
    /** Array of active user sessions */
    sessions: Session[];
  };
  /** Write current data to persistent storage */
  write(): Promise<void>;
}

/**
 * Application data database interface for business data with tag support
 */
export interface DataDatabase {
  /** The business data stored in the database */
  data: {
    /** Array of all organizations in the system */
    organizations: Organization[];
    /** Array of all departments in the system */
    departments: Department[];
    /** Array of all staff members in the system */
    staff: Staff[];
    /** Array of all status values */
    statuses: Status[];
    /** Array of all priority values */
    priorities: Priority[];
    /** Array of all complexity values */
    complexities: Complexity[];
    /** Array of all projects */
    projects: Project[];
    /** Array of all tasks */
    tasks: Task[];
    /** Array of all task assignee relationships */
    taskAssignees: TaskAssignee[];
    /** Array of all task predecessor relationships */
    taskPredecessors: TaskPredecessor[];
    /** Array of all task progress reports */
    taskProgress: TaskProgress[];
    /** Array of all task evaluations */
    taskEvaluations: TaskEvaluation[];
    /** Array of all task status reports */
    taskStatusReports: TaskStatusReport[];
    /** Array of all project status reports */
    projectStatusReports: ProjectStatusReport[];
    /** Array of all teams */
    teams: Team[];
    /** Array of all team member relationships */
    teamMembers: TeamMember[];
  };
  /** Current database tag identifier */
  tag: string;
  /** Write current data to persistent storage */
  write(): Promise<void>;
}

/**
 * Legacy database interface for backward compatibility
 * @deprecated Use AuthDatabase and DataDatabase instead
 */
export interface Database {
  /** The actual data stored in the database */
  data: {
    /** Array of all users in the system */
    users: User[];
    /** Array of active user sessions */
    sessions: Session[];
    /** Array of all organizations in the system */
    organizations: Organization[];
    /** Array of all departments in the system */
    departments: Department[];
    /** Array of all staff members in the system */
    staff: Staff[];
    /** Array of all status values */
    statuses: Status[];
    /** Array of all priority values */
    priorities: Priority[];
    /** Array of all complexity values */
    complexities: Complexity[];
    /** Array of all projects */
    projects: Project[];
    /** Array of all tasks */
    tasks: Task[];
    /** Array of all task assignee relationships */
    taskAssignees: TaskAssignee[];
    /** Array of all task predecessor relationships */
    taskPredecessors: TaskPredecessor[];
    /** Array of all task progress reports */
    taskProgress: TaskProgress[];
    /** Array of all task evaluations */
    taskEvaluations: TaskEvaluation[];
    /** Array of all task status reports */
    taskStatusReports: TaskStatusReport[];
    /** Array of all project status reports */
    projectStatusReports: ProjectStatusReport[];
    /** Array of all teams */
    teams: Team[];
    /** Array of all team member relationships */
    teamMembers: TeamMember[];
  };
  /** Write current data to persistent storage */
  write(): Promise<void>;
}

/**
 * GraphQL context object passed to all resolvers
 */
export interface GraphQLContext {
  /** Currently authenticated user (if any) */
  user?: {
    /** User's unique identifier */
    id: string;
    /** User's email address */
    email: string;
  };
}

/**
 * Authentication payload returned by login/register mutations
 */
export interface AuthPayload {
  /** JWT access token for API authentication */
  token: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken: string;
  /** User information without sensitive data */
  user: SafeUser;
}

/**
 * Input parameters for user registration
 */
export interface RegisterInput {
  /** User's email address */
  email: string;
  /** User's password (will be hashed) */
  password: string;
  /** Optional first name */
  firstName?: string;
  /** Optional last name */
  lastName?: string;
  /** Optional note or description */
  note?: string;
}

/**
 * Input parameters for user login
 */
export interface LoginInput {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Input parameters for updating user information
 */
export interface UpdateUserInput {
  /** User ID to update */
  id: string;
  /** New email address (optional) */
  email?: string;
  /** New password (optional, will be hashed) */
  password?: string;
  /** New first name (optional) */
  firstName?: string;
  /** New last name (optional) */
  lastName?: string;
  /** New note (optional) */
  note?: string;
}

/**
 * Input parameters for password change
 */
export interface ChangePasswordInput {
  /** Current password for verification */
  oldPassword: string;
  /** New password to set */
  newPassword: string;
}

/**
 * Represents an organization in the system
 */
export interface Organization {
  /** Unique identifier for the organization */
  id: string;
  /** Organization name */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional root department ID */
  rootDepartmentId?: string;
  /** Optional root staff ID */
  rootStaffId?: string;
}

/**
 * Represents a department within an organization
 */
export interface Department {
  /** Unique identifier for the department */
  id: string;
  /** Department name */
  name: string;
  /** Optional description */
  description?: string;
  /** Organization this department belongs to */
  organizationId: string;
  /** Optional parent department ID */
  parentDepartmentId?: string;
  /** Optional manager ID */
  managerId?: string;
}

/**
 * Represents a staff member in the system
 */
export interface Staff {
  /** Unique identifier for the staff member */
  id: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Email address (unique) */
  email: string;
  /** Optional phone number */
  phone?: string;
  /** Role/position */
  role: string;
  /** Organization this staff member belongs to */
  organizationId: string;
  /** Department this staff member belongs to */
  departmentId: string;
  /** Optional supervisor ID */
  supervisorId?: string;
}

/**
 * Input parameters for creating an organization
 */
export interface CreateOrganizationInput {
  /** Organization name */
  name: string;
  /** Optional description */
  description?: string;
}

/**
 * Input parameters for updating an organization
 */
export interface UpdateOrganizationInput {
  /** Organization ID to update */
  id: string;
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
  /** New root department ID (optional) */
  rootDepartmentId?: string;
  /** New root staff ID (optional) */
  rootStaffId?: string;
}

/**
 * Input parameters for creating a department
 */
export interface CreateDepartmentInput {
  /** Department name */
  name: string;
  /** Optional description */
  description?: string;
  /** Organization this department belongs to */
  organizationId: string;
  /** Optional parent department ID */
  parentDepartmentId?: string;
}

/**
 * Input parameters for updating a department
 */
export interface UpdateDepartmentInput {
  /** Department ID to update */
  id: string;
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
  /** New parent department ID (optional) */
  parentDepartmentId?: string;
  /** New manager ID (optional) */
  managerId?: string;
}

/**
 * Input parameters for creating a staff member
 */
export interface CreateStaffInput {
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Email address */
  email: string;
  /** Optional phone number */
  phone?: string;
  /** Role/position */
  role: string;
  /** Organization this staff member belongs to */
  organizationId: string;
  /** Department this staff member belongs to */
  departmentId: string;
  /** Optional supervisor ID */
  supervisorId?: string;
}

/**
 * Input parameters for updating a staff member
 */
export interface UpdateStaffInput {
  /** Staff ID to update */
  id: string;
  /** New first name (optional) */
  firstName?: string;
  /** New last name (optional) */
  lastName?: string;
  /** New email address (optional) */
  email?: string;
  /** New phone number (optional) */
  phone?: string;
  /** New role (optional) */
  role?: string;
  /** New department ID (optional) */
  departmentId?: string;
  /** New supervisor ID (optional) */
  supervisorId?: string;
}

/**
 * Represents a status reference value
 */
export interface Status {
  /** Unique identifier for the status */
  id: string;
  /** Status name */
  name: string;
}

/**
 * Represents a priority reference value
 */
export interface Priority {
  /** Unique identifier for the priority */
  id: string;
  /** Priority name */
  name: string;
}

/**
 * Represents a complexity reference value
 */
export interface Complexity {
  /** Unique identifier for the complexity */
  id: string;
  /** Complexity name */
  name: string;
}

/**
 * Represents a project in the system
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Project name */
  name: string;
  /** Optional description */
  description?: string;
  /** Lead staff member ID */
  leadStaffId?: string;
  /** Planned start date */
  plannedStartDate?: string;
  /** Planned end date */
  plannedEndDate?: string;
  /** Actual start date */
  actualStartDate?: string;
  /** Actual end date */
  actualEndDate?: string;
}

/**
 * Represents a task in the system
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  /** Task name */
  name: string;
  /** Optional description */
  description?: string;
  /** Project this task belongs to */
  projectId: string;
  /** Parent task ID for sub-tasks */
  parentTaskId?: string;
  /** Evaluator staff ID */
  evaluatorId?: string;
  /** Status ID */
  statusId?: string;
  /** Priority ID */
  priorityId?: string;
  /** Complexity ID */
  complexityId?: string;
  /** Planned start date */
  plannedStartDate?: string;
  /** Planned end date */
  plannedEndDate?: string;
  /** Actual start date */
  actualStartDate?: string;
  /** Actual end date */
  actualEndDate?: string;
}

/**
 * Represents a task assignee relationship
 */
export interface TaskAssignee {
  /** Task ID */
  taskId: string;
  /** Staff ID */
  staffId: string;
}

/**
 * Represents a task predecessor relationship
 */
export interface TaskPredecessor {
  /** Task ID */
  taskId: string;
  /** Predecessor task ID */
  predecessorTaskId: string;
}

/**
 * Represents a task progress report
 */
export interface TaskProgress {
  /** Unique identifier for the progress report */
  id: string;
  /** Task this progress report belongs to */
  taskId: string;
  /** Report date */
  reportDate: string;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Optional notes */
  notes?: string;
  /** Staff member who created this progress report */
  creatorId?: string;
}

/**
 * Represents a task evaluation
 */
export interface TaskEvaluation {
  /** Unique identifier for the evaluation */
  id: string;
  /** Task this evaluation belongs to */
  taskId: string;
  /** Evaluator staff ID */
  evaluatorId: string;
  /** Evaluation date */
  evaluationDate: string;
  /** Optional evaluation notes */
  evaluationNotes?: string;
  /** Evaluation result */
  result?: string;
}

/**
 * Represents a task status report
 */
export interface TaskStatusReport {
  /** Unique identifier for the status report */
  id: string;
  /** Task this status report belongs to */
  taskId: string;
  /** Report date */
  reportDate: string;
  /** Status summary */
  statusSummary?: string;
  /** Staff member who created this status report */
  creatorId?: string;
}

/**
 * Represents a project status report
 */
export interface ProjectStatusReport {
  /** Unique identifier for the status report */
  id: string;
  /** Project this status report belongs to */
  projectId: string;
  /** Report date */
  reportDate: string;
  /** Status summary */
  statusSummary?: string;
}

/**
 * Input parameters for creating a status
 */
export interface CreateStatusInput {
  /** Status name */
  name: string;
}

/**
 * Input parameters for updating a status
 */
export interface UpdateStatusInput {
  /** Status ID to update */
  id: string;
  /** New name */
  name: string;
}

/**
 * Input parameters for creating a priority
 */
export interface CreatePriorityInput {
  /** Priority name */
  name: string;
}

/**
 * Input parameters for updating a priority
 */
export interface UpdatePriorityInput {
  /** Priority ID to update */
  id: string;
  /** New name */
  name: string;
}

/**
 * Input parameters for creating a complexity
 */
export interface CreateComplexityInput {
  /** Complexity name */
  name: string;
}

/**
 * Input parameters for updating a complexity
 */
export interface UpdateComplexityInput {
  /** Complexity ID to update */
  id: string;
  /** New name */
  name: string;
}

/**
 * Input parameters for creating a project
 */
export interface CreateProjectInput {
  /** Project name */
  name: string;
  /** Optional description */
  description?: string;
  /** Lead staff member ID */
  leadStaffId?: string;
  /** Planned start date */
  plannedStartDate?: string;
  /** Planned end date */
  plannedEndDate?: string;
  /** Actual start date */
  actualStartDate?: string;
  /** Actual end date */
  actualEndDate?: string;
}

/**
 * Input parameters for updating a project
 */
export interface UpdateProjectInput {
  /** Project ID to update */
  id: string;
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
  /** New lead staff member ID (optional) */
  leadStaffId?: string;
  /** New planned start date (optional) */
  plannedStartDate?: string;
  /** New planned end date (optional) */
  plannedEndDate?: string;
  /** New actual start date (optional) */
  actualStartDate?: string;
  /** New actual end date (optional) */
  actualEndDate?: string;
}

/**
 * Input parameters for creating a task
 */
export interface CreateTaskInput {
  /** Task name */
  name: string;
  /** Optional description */
  description?: string;
  /** Project this task belongs to */
  projectId: string;
  /** Parent task ID for sub-tasks */
  parentTaskId?: string;
  /** Evaluator staff ID */
  evaluatorId?: string;
  /** Status ID */
  statusId?: string;
  /** Priority ID */
  priorityId?: string;
  /** Complexity ID */
  complexityId?: string;
  /** Planned start date */
  plannedStartDate?: string;
  /** Planned end date */
  plannedEndDate?: string;
  /** Actual start date */
  actualStartDate?: string;
  /** Actual end date */
  actualEndDate?: string;
}

/**
 * Input parameters for updating a task
 */
export interface UpdateTaskInput {
  /** Task ID to update */
  id: string;
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
  /** New parent task ID (optional) */
  parentTaskId?: string;
  /** New evaluator staff ID (optional) */
  evaluatorId?: string;
  /** New status ID (optional) */
  statusId?: string;
  /** New priority ID (optional) */
  priorityId?: string;
  /** New complexity ID (optional) */
  complexityId?: string;
  /** New planned start date (optional) */
  plannedStartDate?: string;
  /** New planned end date (optional) */
  plannedEndDate?: string;
  /** New actual start date (optional) */
  actualStartDate?: string;
  /** New actual end date (optional) */
  actualEndDate?: string;
}

/**
 * Input parameters for creating a task progress report
 */
export interface CreateTaskProgressInput {
  /** Task this progress report belongs to */
  taskId: string;
  /** Report date */
  reportDate: string;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Optional notes */
  notes?: string;
  /** Optional creator staff ID (auto-detected if not provided) */
  creatorId?: string;
}

/**
 * Input parameters for updating a task progress report
 */
export interface UpdateTaskProgressInput {
  /** Progress report ID to update */
  id: string;
  /** New report date (optional) */
  reportDate?: string;
  /** New progress percentage (optional) */
  progressPercent?: number;
  /** New notes (optional) */
  notes?: string;
  /** Creator staff ID (optional) */
  creatorId?: string;
}

/**
 * Input parameters for creating a task evaluation
 */
export interface CreateTaskEvaluationInput {
  /** Task this evaluation belongs to */
  taskId: string;
  /** Evaluator staff ID */
  evaluatorId: string;
  /** Evaluation date */
  evaluationDate: string;
  /** Optional evaluation notes */
  evaluationNotes?: string;
  /** Evaluation result */
  result?: string;
}

/**
 * Input parameters for updating a task evaluation
 */
export interface UpdateTaskEvaluationInput {
  /** Evaluation ID to update */
  id: string;
  /** New evaluator staff ID (optional) */
  evaluatorId?: string;
  /** New evaluation date (optional) */
  evaluationDate?: string;
  /** New evaluation notes (optional) */
  evaluationNotes?: string;
  /** New evaluation result (optional) */
  result?: string;
}

/**
 * Input parameters for creating a task status report
 */
export interface CreateTaskStatusReportInput {
  /** Task this status report belongs to */
  taskId: string;
  /** Report date */
  reportDate: string;
  /** Status summary */
  statusSummary?: string;
  /** Optional creator staff ID (auto-detected if not provided) */
  creatorId?: string;
}

/**
 * Input parameters for updating a task status report
 */
export interface UpdateTaskStatusReportInput {
  /** Status report ID to update */
  id: string;
  /** New report date (optional) */
  reportDate?: string;
  /** New status summary (optional) */
  statusSummary?: string;
  /** Creator staff ID (optional) */
  creatorId?: string;
}

/**
 * Input parameters for creating a project status report
 */
export interface CreateProjectStatusReportInput {
  /** Project this status report belongs to */
  projectId: string;
  /** Report date */
  reportDate: string;
  /** Status summary */
  statusSummary?: string;
}

/**
 * Input parameters for updating a project status report
 */
export interface UpdateProjectStatusReportInput {
  /** Status report ID to update */
  id: string;
  /** New report date (optional) */
  reportDate?: string;
  /** New status summary (optional) */
  statusSummary?: string;
}

/**
 * Represents a team in the system
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Team name */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional team lead ID (references staff) */
  leadId?: string;
}

/**
 * Represents a team member relationship
 */
export interface TeamMember {
  /** Unique identifier for the team member relationship */
  id: string;
  /** Team ID this membership belongs to */
  teamId: string;
  /** Staff ID of the team member */
  staffId: string;
  /** Role of the member in the team */
  memberRole: string;
}

/**
 * Input parameters for creating a team
 */
export interface CreateTeamInput {
  /** Team name */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional team lead ID (references staff) */
  leadId?: string;
}

/**
 * Input parameters for updating a team
 */
export interface UpdateTeamInput {
  /** Team ID to update */
  id: string;
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
  /** New team lead ID (optional) */
  leadId?: string;
}

/**
 * Input parameters for creating a team member
 */
export interface CreateTeamMemberInput {
  /** Team ID this membership belongs to */
  teamId: string;
  /** Staff ID of the team member */
  staffId: string;
  /** Role of the member in the team */
  memberRole: string;
}

/**
 * Input parameters for updating a team member
 */
export interface UpdateTeamMemberInput {
  /** Team member ID to update */
  id: string;
  /** New member role (optional) */
  memberRole?: string;
}
