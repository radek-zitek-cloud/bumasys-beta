/**
 * @fileoverview Staff service for frontend GraphQL operations
 * 
 * This service provides all staff-related API calls following the same
 * patterns as the users service. It handles staff CRUD operations
 * through GraphQL queries and mutations.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Staff interface matching the backend schema */
export interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  organizationId: string
  departmentId: string
  supervisorId?: string
}

/** Interface for creating a new staff member */
export interface CreateStaffInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  organizationId: string
  departmentId: string
  supervisorId?: string
}

/** Interface for updating an existing staff member */
export interface UpdateStaffInput {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: string
  organizationId?: string
  departmentId?: string
  supervisorId?: string
}

/**
 * Fetch all staff members from the system.
 * Optionally filter by organization or department ID.
 * Requires authentication.
 */
export function getStaff(organizationId?: string, departmentId?: string): Promise<{ staff: Staff[] }> {
  const store = useAuthStore()
  return graphqlClient<{ staff: Staff[] }>(
    `
      query ($organizationId: ID, $departmentId: ID) {
        staff(organizationId: $organizationId, departmentId: $departmentId) {
          id
          firstName
          lastName
          email
          phone
          role
          organizationId
          departmentId
          supervisorId
        }
      }
    `,
    { organizationId, departmentId },
    store.token,
  )
}

/**
 * Fetch a specific staff member by ID.
 * Requires authentication.
 */
export function getStaffMember(id: string): Promise<{ staffMember: Staff | null }> {
  const store = useAuthStore()
  return graphqlClient<{ staffMember: Staff | null }>(
    `
      query ($id: ID!) {
        staffMember(id: $id) {
          id
          firstName
          lastName
          email
          phone
          role
          organizationId
          departmentId
          supervisorId
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new staff member.
 * Requires authentication.
 */
export function createStaff(input: CreateStaffInput): Promise<{ createStaff: Staff }> {
  const store = useAuthStore()
  return graphqlClient<{ createStaff: Staff }>(
    `
      mutation (
        $firstName: String!
        $lastName: String!
        $email: String!
        $phone: String
        $role: String!
        $organizationId: ID!
        $departmentId: ID!
        $supervisorId: ID
      ) {
        createStaff(
          firstName: $firstName
          lastName: $lastName
          email: $email
          phone: $phone
          role: $role
          organizationId: $organizationId
          departmentId: $departmentId
          supervisorId: $supervisorId
        ) {
          id
          firstName
          lastName
          email
          phone
          role
          organizationId
          departmentId
          supervisorId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing staff member.
 * Requires authentication.
 */
export function updateStaff(input: UpdateStaffInput): Promise<{ updateStaff: Staff }> {
  const store = useAuthStore()
  return graphqlClient<{ updateStaff: Staff }>(
    `
      mutation (
        $id: ID!
        $firstName: String
        $lastName: String
        $email: String
        $phone: String
        $role: String
        $organizationId: ID
        $departmentId: ID
        $supervisorId: ID
      ) {
        updateStaff(
          id: $id
          firstName: $firstName
          lastName: $lastName
          email: $email
          phone: $phone
          role: $role
          organizationId: $organizationId
          departmentId: $departmentId
          supervisorId: $supervisorId
        ) {
          id
          firstName
          lastName
          email
          phone
          role
          organizationId
          departmentId
          supervisorId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete a staff member by ID.
 * Requires authentication.
 */
export function deleteStaff(id: string): Promise<{ deleteStaff: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteStaff: boolean }>(
    `
      mutation ($id: ID!) {
        deleteStaff(id: $id)
      }
    `,
    { id },
    store.token,
  )
}