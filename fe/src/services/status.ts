/**
 * @fileoverview Status management service
 *
 * This module provides service functions for managing status reference data
 * including creation, updates, deletion, and retrieval operations.
 * It provides a service layer between Vue components and the GraphQL API.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Status interface matching the backend schema */
export interface Status {
  id: string
  name: string
}

/** Interface for creating a new status */
export interface CreateStatusInput {
  name: string
}

/** Interface for updating an existing status */
export interface UpdateStatusInput {
  id: string
  name: string
}

/**
 * Fetch all statuses from the system.
 * Requires authentication.
 */
export function getStatuses (): Promise<{ statuses: Status[] }> {
  const store = useAuthStore()
  return graphqlClient<{ statuses: Status[] }>(
    `
      query {
        statuses {
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
 * Fetch a specific status by ID.
 * Requires authentication.
 */
export function getStatus (id: string): Promise<{ status: Status | null }> {
  const store = useAuthStore()
  return graphqlClient<{ status: Status | null }>(
    `
      query ($id: ID!) {
        status(id: $id) {
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
 * Create a new status.
 * Requires authentication.
 */
export function createStatus (input: CreateStatusInput): Promise<{ createStatus: Status }> {
  const store = useAuthStore()
  return graphqlClient<{ createStatus: Status }>(
    `
      mutation (
        $name: String!
      ) {
        createStatus(
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
 * Update an existing status.
 * Requires authentication.
 */
export function updateStatus (input: UpdateStatusInput): Promise<{ updateStatus: Status }> {
  const store = useAuthStore()
  return graphqlClient<{ updateStatus: Status }>(
    `
      mutation (
        $id: ID!
        $name: String!
      ) {
        updateStatus(
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
 * Delete a status by ID.
 * Requires authentication.
 */
export function deleteStatus (id: string): Promise<{ deleteStatus: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteStatus: boolean }>(
    `
      mutation ($id: ID!) {
        deleteStatus(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
