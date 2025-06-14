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
    Get all users in the system (requires authentication)
    """
    users: [User!]!

    """
    Get a specific user by ID (requires authentication)
    Returns null if user not found
    """
    user(id: ID!): User
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
  }
`;
