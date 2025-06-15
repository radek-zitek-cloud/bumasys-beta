/**
 * @fileoverview Department service for frontend GraphQL operations
 *
 * This service provides all department-related API calls following the same
 * patterns as the users service. It handles department CRUD operations
 * through GraphQL queries and mutations.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Department interface matching the backend schema */
export interface Department {
  id: string
  name: string
  description?: string
  organizationId: string
  parentDepartmentId?: string
  managerId?: string
}

/** Interface for creating a new department */
export interface CreateDepartmentInput {
  name: string
  description?: string
  organizationId: string
  parentDepartmentId?: string
}

/** Interface for updating an existing department */
export interface UpdateDepartmentInput {
  id: string
  name?: string
  description?: string
  parentDepartmentId?: string
  managerId?: string
}

/**
 * Fetch all departments from the system.
 * Optionally filter by organization ID.
 * Requires authentication.
 */
export function getDepartments (organizationId?: string): Promise<{ departments: Department[] }> {
  const store = useAuthStore()
  return graphqlClient<{ departments: Department[] }>(
    `
      query ($organizationId: ID) {
        departments(organizationId: $organizationId) {
          id
          name
          description
          organizationId
          parentDepartmentId
          managerId
        }
      }
    `,
    { organizationId },
    store.token,
  )
}

/**
 * Fetch a specific department by ID.
 * Requires authentication.
 */
export function getDepartment (id: string): Promise<{ department: Department | null }> {
  const store = useAuthStore()
  return graphqlClient<{ department: Department | null }>(
    `
      query ($id: ID!) {
        department(id: $id) {
          id
          name
          description
          organizationId
          parentDepartmentId
          managerId
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new department.
 * Requires authentication.
 */
export function createDepartment (input: CreateDepartmentInput): Promise<{ createDepartment: Department }> {
  const store = useAuthStore()
  return graphqlClient<{ createDepartment: Department }>(
    `
      mutation (
        $name: String!
        $description: String
        $organizationId: ID!
        $parentDepartmentId: ID
      ) {
        createDepartment(
          name: $name
          description: $description
          organizationId: $organizationId
          parentDepartmentId: $parentDepartmentId
        ) {
          id
          name
          description
          organizationId
          parentDepartmentId
          managerId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing department.
 * Requires authentication.
 */
export function updateDepartment (input: UpdateDepartmentInput): Promise<{ updateDepartment: Department }> {
  const store = useAuthStore()
  return graphqlClient<{ updateDepartment: Department }>(
    `
      mutation (
        $id: ID!
        $name: String
        $description: String
        $parentDepartmentId: ID
        $managerId: ID
      ) {
        updateDepartment(
          id: $id
          name: $name
          description: $description
          parentDepartmentId: $parentDepartmentId
          managerId: $managerId
        ) {
          id
          name
          description
          organizationId
          parentDepartmentId
          managerId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete a department by ID.
 * Requires authentication.
 */
export function deleteDepartment (id: string): Promise<{ deleteDepartment: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteDepartment: boolean }>(
    `
      mutation ($id: ID!) {
        deleteDepartment(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
