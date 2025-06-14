/**
 * @fileoverview Priority management service
 *
 * This module provides service functions for managing priority reference data
 * including creation, updates, deletion, and retrieval operations.
 * It provides a service layer between Vue components and the GraphQL API.
 */

import { useAuthStore } from '../stores/auth'

/** GraphQL helper to perform POST requests. */
async function graphql<T> (
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data as T
}

/** Priority interface matching the backend schema */
export interface Priority {
  id: string
  name: string
}

/** Interface for creating a new priority */
export interface CreatePriorityInput {
  name: string
}

/** Interface for updating an existing priority */
export interface UpdatePriorityInput {
  id: string
  name: string
}

/**
 * Fetch all priorities from the system.
 * Requires authentication.
 */
export function getPriorities (): Promise<{ priorities: Priority[] }> {
  const store = useAuthStore()
  return graphql<{ priorities: Priority[] }>(
    `
      query {
        priorities {
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
 * Fetch a specific priority by ID.
 * Requires authentication.
 */
export function getPriority (id: string): Promise<{ priority: Priority | null }> {
  const store = useAuthStore()
  return graphql<{ priority: Priority | null }>(
    `
      query ($id: ID!) {
        priority(id: $id) {
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
 * Create a new priority.
 * Requires authentication.
 */
export function createPriority (input: CreatePriorityInput): Promise<{ createPriority: Priority }> {
  const store = useAuthStore()
  return graphql<{ createPriority: Priority }>(
    `
      mutation (
        $name: String!
      ) {
        createPriority(
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
 * Update an existing priority.
 * Requires authentication.
 */
export function updatePriority (input: UpdatePriorityInput): Promise<{ updatePriority: Priority }> {
  const store = useAuthStore()
  return graphql<{ updatePriority: Priority }>(
    `
      mutation (
        $id: ID!
        $name: String!
      ) {
        updatePriority(
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
 * Delete a priority by ID.
 * Requires authentication.
 */
export function deletePriority (id: string): Promise<{ deletePriority: boolean }> {
  const store = useAuthStore()
  return graphql<{ deletePriority: boolean }>(
    `
      mutation ($id: ID!) {
        deletePriority(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
