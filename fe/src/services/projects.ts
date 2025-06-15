/**
 * @fileoverview Project service module
 *
 * This module provides GraphQL operations for project management,
 * including CRUD operations and fetching related data.
 * It follows the same patterns as other service modules in the application.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Project interface matching the backend schema */
export interface Project {
  id: string
  name: string
  description?: string
  leadStaffId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  leadStaff?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  tasks?: Task[]
}

/** Task interface for project relationships */
interface Task {
  id: string
  name: string
  description?: string
  projectId: string
}

/** Interface for creating a new project */
export interface CreateProjectInput {
  name: string
  description?: string
  leadStaffId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
}

/** Interface for updating an existing project */
export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string
  leadStaffId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
}

/**
 * Fetch all projects from the system.
 * Requires authentication.
 */
export function getProjects (): Promise<{ projects: Project[] }> {
  const store = useAuthStore()
  return graphqlClient<{ projects: Project[] }>(
    `
      query {
        projects {
          id
          name
          description
          leadStaffId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          leadStaff {
            id
            firstName
            lastName
            email
          }
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific project by ID.
 * Requires authentication.
 * @param id - Project ID to fetch
 */
export function getProject (id: string): Promise<{ project: Project | null }> {
  const store = useAuthStore()
  return graphqlClient<{ project: Project | null }>(
    `
      query GetProject($id: ID!) {
        project(id: $id) {
          id
          name
          description
          leadStaffId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          leadStaff {
            id
            firstName
            lastName
            email
          }
          tasks {
            id
            name
            description
          }
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new project.
 * Requires authentication.
 * @param projectData - Project creation data
 */
export function createProject (projectData: CreateProjectInput): Promise<{ createProject: Project }> {
  const store = useAuthStore()
  return graphqlClient<{ createProject: Project }>(
    `
      mutation CreateProject(
        $name: String!
        $description: String
        $leadStaffId: ID
        $plannedStartDate: String
        $plannedEndDate: String
        $actualStartDate: String
        $actualEndDate: String
      ) {
        createProject(
          name: $name
          description: $description
          leadStaffId: $leadStaffId
          plannedStartDate: $plannedStartDate
          plannedEndDate: $plannedEndDate
          actualStartDate: $actualStartDate
          actualEndDate: $actualEndDate
        ) {
          id
          name
          description
          leadStaffId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          leadStaff {
            id
            firstName
            lastName
            email
          }
        }
      }
    `,
    projectData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Update an existing project.
 * Requires authentication.
 * @param projectData - Project update data
 */
export function updateProject (projectData: UpdateProjectInput): Promise<{ updateProject: Project }> {
  const store = useAuthStore()
  return graphqlClient<{ updateProject: Project }>(
    `
      mutation UpdateProject(
        $id: ID!
        $name: String
        $description: String
        $leadStaffId: ID
        $plannedStartDate: String
        $plannedEndDate: String
        $actualStartDate: String
        $actualEndDate: String
      ) {
        updateProject(
          id: $id
          name: $name
          description: $description
          leadStaffId: $leadStaffId
          plannedStartDate: $plannedStartDate
          plannedEndDate: $plannedEndDate
          actualStartDate: $actualStartDate
          actualEndDate: $actualEndDate
        ) {
          id
          name
          description
          leadStaffId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          leadStaff {
            id
            firstName
            lastName
            email
          }
        }
      }
    `,
    projectData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Delete a project by ID.
 * Requires authentication.
 * @param id - Project ID to delete
 */
export function deleteProject (id: string): Promise<{ deleteProject: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteProject: boolean }>(
    `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
