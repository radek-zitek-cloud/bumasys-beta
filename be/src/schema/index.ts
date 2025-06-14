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
  }
`;
