/**
 * @fileoverview Complexity management service
 *
 * This module provides service functions for managing complexity reference data
 * including creation, updates, deletion, and retrieval operations.
 * It provides a service layer between Vue components and the GraphQL API.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Complexity interface matching the backend schema */
export interface Complexity {
  id: string
  name: string
}

/** Interface for creating a new complexity */
export interface CreateComplexityInput {
  name: string
}

/** Interface for updating an existing complexity */
export interface UpdateComplexityInput {
  id: string
  name: string
}

/**
 * Fetch all complexities from the system.
 * Requires authentication.
 */
export function getComplexities (): Promise<{ complexities: Complexity[] }> {
  const store = useAuthStore()
  return graphqlClient<{ complexities: Complexity[] }>(
    `
      query {
        complexities {
          id
          name
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific complexity by ID.
 * Requires authentication.
 */
export function getComplexity (id: string): Promise<{ complexity: Complexity | null }> {
  const store = useAuthStore()
  return graphqlClient<{ complexity: Complexity | null }>(
    `
      query ($id: ID!) {
        complexity(id: $id) {
          id
          name
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new complexity.
 * Requires authentication.
 */
export function createComplexity (input: CreateComplexityInput): Promise<{ createComplexity: Complexity }> {
  const store = useAuthStore()
  return graphqlClient<{ createComplexity: Complexity }>(
    `
      mutation (
        $name: String!
      ) {
        createComplexity(
          name: $name
        ) {
          id
          name
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing complexity.
 * Requires authentication.
 */
export function updateComplexity (input: UpdateComplexityInput): Promise<{ updateComplexity: Complexity }> {
  const store = useAuthStore()
  return graphqlClient<{ updateComplexity: Complexity }>(
    `
      mutation (
        $id: ID!
        $name: String!
      ) {
        updateComplexity(
          id: $id
          name: $name
        ) {
          id
          name
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete a complexity by ID.
 * Requires authentication.
 */
export function deleteComplexity (id: string): Promise<{ deleteComplexity: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteComplexity: boolean }>(
    `
      mutation ($id: ID!) {
        deleteComplexity(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
