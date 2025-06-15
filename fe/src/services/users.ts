/**
 * @fileoverview Users service for frontend GraphQL operations
 *
 * This service provides all user-related API calls for user management operations.
 * It handles user CRUD operations through GraphQL queries and mutations with
 * proper authentication and error handling.
 *
 * Features:
 * - Complete CRUD operations for users
 * - Type-safe interfaces for all operations
 * - Automatic authentication token handling
 * - Consistent error handling patterns
 *
 * TODO: Add user avatar upload functionality
 * TODO: Implement user role management
 * TODO: Add user search and filtering capabilities
 * TODO: Implement user batch operations
 * TODO: Add user activity logging
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** User interface matching the backend schema */
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  note?: string
}

/** Interface for creating a new user */
export interface CreateUserInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  note?: string
}

/** Interface for updating an existing user */
export interface UpdateUserInput {
  id: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  note?: string
}

/**
 * Fetch all users from the system.
 * Requires authentication.
 */
export function getUsers (): Promise<{ users: User[] }> {
  const store = useAuthStore()
  return graphqlClient<{ users: User[] }>(
    `
      query {
        users {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific user by ID.
 * Requires authentication.
 */
export function getUser (id: string): Promise<{ user: User | null }> {
  const store = useAuthStore()
  return graphqlClient<{ user: User | null }>(
    `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new user.
 * Requires authentication.
 */
export function createUser (input: CreateUserInput): Promise<{ createUser: User }> {
  const store = useAuthStore()
  return graphqlClient<{ createUser: User }>(
    `
      mutation (
        $email: String!
        $password: String!
        $firstName: String
        $lastName: String
        $note: String
      ) {
        createUser(
          email: $email
          password: $password
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing user.
 * Requires authentication.
 */
export function updateUser (input: UpdateUserInput): Promise<{ updateUser: User }> {
  const store = useAuthStore()
  return graphqlClient<{ updateUser: User }>(
    `
      mutation (
        $id: ID!
        $email: String
        $password: String
        $firstName: String
        $lastName: String
        $note: String
      ) {
        updateUser(
          id: $id
          email: $email
          password: $password
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete a user by ID.
 * Requires authentication.
 */
export function deleteUser (id: string): Promise<{ deleteUser: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteUser: boolean }>(
    `
      mutation ($id: ID!) {
        deleteUser(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
