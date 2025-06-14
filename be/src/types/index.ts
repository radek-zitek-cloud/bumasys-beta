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
