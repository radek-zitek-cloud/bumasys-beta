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
 * Database interface representing the JSON file structure
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
