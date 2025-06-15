/**
 * @fileoverview Organization service for frontend GraphQL operations
 *
 * This service provides all organization-related API calls following the same
 * patterns as the users service. It handles organization CRUD operations
 * through GraphQL queries and mutations.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Organization interface matching the backend schema */
export interface Organization {
  id: string
  name: string
  description?: string
  rootDepartmentId?: string
  rootStaffId?: string
}

/** Interface for creating a new organization */
export interface CreateOrganizationInput {
  name: string
  description?: string
}

/** Interface for updating an existing organization */
export interface UpdateOrganizationInput {
  id: string
  name?: string
  description?: string
  rootDepartmentId?: string
  rootStaffId?: string
}

/**
 * Fetch all organizations from the system.
 * Requires authentication.
 */
export function getOrganizations (): Promise<{ organizations: Organization[] }> {
  const store = useAuthStore()
  return graphqlClient<{ organizations: Organization[] }>(
    `
      query {
        organizations {
          id
          name
          description
          rootDepartmentId
          rootStaffId
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific organization by ID.
 * Requires authentication.
 */
export function getOrganization (id: string): Promise<{ organization: Organization | null }> {
  const store = useAuthStore()
  return graphqlClient<{ organization: Organization | null }>(
    `
      query ($id: ID!) {
        organization(id: $id) {
          id
          name
          description
          rootDepartmentId
          rootStaffId
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new organization.
 * Requires authentication.
 */
export function createOrganization (input: CreateOrganizationInput): Promise<{ createOrganization: Organization }> {
  const store = useAuthStore()
  return graphqlClient<{ createOrganization: Organization }>(
    `
      mutation ($name: String!, $description: String) {
        createOrganization(name: $name, description: $description) {
          id
          name
          description
          rootDepartmentId
          rootStaffId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing organization.
 * Requires authentication.
 */
export function updateOrganization (input: UpdateOrganizationInput): Promise<{ updateOrganization: Organization }> {
  const store = useAuthStore()
  return graphqlClient<{ updateOrganization: Organization }>(
    `
      mutation (
        $id: ID!
        $name: String
        $description: String
        $rootDepartmentId: ID
        $rootStaffId: ID
      ) {
        updateOrganization(
          id: $id
          name: $name
          description: $description
          rootDepartmentId: $rootDepartmentId
          rootStaffId: $rootStaffId
        ) {
          id
          name
          description
          rootDepartmentId
          rootStaffId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete an organization by ID.
 * Requires authentication.
 */
export function deleteOrganization (id: string): Promise<{ deleteOrganization: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteOrganization: boolean }>(
    `
      mutation ($id: ID!) {
        deleteOrganization(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
