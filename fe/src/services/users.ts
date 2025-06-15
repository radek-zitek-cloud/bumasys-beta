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
import { logInfo, logError, logDebug } from '../utils/logger'

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
export async function getUsers (): Promise<{ users: User[] }> {
  try {
    const store = useAuthStore()
    logDebug('Fetching all users')
    
    const result = await graphqlClient<{ users: User[] }>(
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
    
    logInfo('Users fetched successfully', { count: result.users.length })
    return result
  } catch (error) {
    logError('Failed to fetch users', error)
    throw error
  }
}

/**
 * Fetch a specific user by ID.
 * Requires authentication.
 */
export async function getUser (id: string): Promise<{ user: User | null }> {
  try {
    const store = useAuthStore()
    logDebug('Fetching user by ID', { userId: id })
    
    const result = await graphqlClient<{ user: User | null }>(
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
    
    logInfo('User fetched successfully', { 
      userId: id, 
      found: !!result.user 
    })
    return result
  } catch (error) {
    logError('Failed to fetch user', { error, userId: id })
    throw error
  }
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
