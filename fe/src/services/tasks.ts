/**
 * @fileoverview Task service module
 *
 * This module provides GraphQL operations for task management,
 * including CRUD operations and fetching related data.
 * It follows the same patterns as other service modules in the application.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Task interface matching the backend schema */
export interface Task {
  id: string
  name: string
  description?: string
  projectId: string
  parentTaskId?: string
  evaluatorId?: string
  statusId?: string
  priorityId?: string
  complexityId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  project?: {
    id: string
    name: string
  }
  parentTask?: {
    id: string
    name: string
  }
  childTasks?: Task[]
  evaluator?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  status?: {
    id: string
    name: string
  }
  priority?: {
    id: string
    name: string
  }
  complexity?: {
    id: string
    name: string
  }
}

/** Interface for creating a new task */
export interface CreateTaskInput {
  name: string
  description?: string
  projectId: string
  parentTaskId?: string
  evaluatorId?: string
  statusId?: string
  priorityId?: string
  complexityId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
}

/** Interface for updating an existing task */
export interface UpdateTaskInput {
  id: string
  name?: string
  description?: string
  parentTaskId?: string
  evaluatorId?: string
  statusId?: string
  priorityId?: string
  complexityId?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
}

/**
 * Fetch all tasks from the system.
 * Optionally filter by project ID.
 * Requires authentication.
 */
export function getTasks(projectId?: string): Promise<{ tasks: Task[] }> {
  const store = useAuthStore()
  return graphqlClient<{ tasks: Task[] }>(
    `
      query GetTasks($projectId: ID) {
        tasks(projectId: $projectId) {
          id
          name
          description
          projectId
          parentTaskId
          evaluatorId
          statusId
          priorityId
          complexityId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          project {
            id
            name
          }
          parentTask {
            id
            name
          }
          evaluator {
            id
            firstName
            lastName
            email
          }
          status {
            id
            name
          }
          priority {
            id
            name
          }
          complexity {
            id
            name
          }
        }
      }
    `,
    { projectId },
    store.authHeaders
  )
}

/**
 * Fetch a specific task by ID.
 * Requires authentication.
 * @param id - Task ID to fetch
 */
export function getTask(id: string): Promise<{ task: Task | null }> {
  const store = useAuthStore()
  return graphqlClient<{ task: Task | null }>(
    `
      query GetTask($id: ID!) {
        task(id: $id) {
          id
          name
          description
          projectId
          parentTaskId
          evaluatorId
          statusId
          priorityId
          complexityId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          project {
            id
            name
          }
          parentTask {
            id
            name
          }
          childTasks {
            id
            name
            description
          }
          evaluator {
            id
            firstName
            lastName
            email
          }
          status {
            id
            name
          }
          priority {
            id
            name
          }
          complexity {
            id
            name
          }
        }
      }
    `,
    { id },
    store.authHeaders
  )
}

/**
 * Create a new task.
 * Requires authentication.
 * @param taskData - Task creation data
 */
export function createTask(taskData: CreateTaskInput): Promise<{ createTask: Task }> {
  const store = useAuthStore()
  return graphqlClient<{ createTask: Task }>(
    `
      mutation CreateTask(
        $name: String!
        $description: String
        $projectId: ID!
        $parentTaskId: ID
        $evaluatorId: ID
        $statusId: ID
        $priorityId: ID
        $complexityId: ID
        $plannedStartDate: String
        $plannedEndDate: String
        $actualStartDate: String
        $actualEndDate: String
      ) {
        createTask(
          name: $name
          description: $description
          projectId: $projectId
          parentTaskId: $parentTaskId
          evaluatorId: $evaluatorId
          statusId: $statusId
          priorityId: $priorityId
          complexityId: $complexityId
          plannedStartDate: $plannedStartDate
          plannedEndDate: $plannedEndDate
          actualStartDate: $actualStartDate
          actualEndDate: $actualEndDate
        ) {
          id
          name
          description
          projectId
          parentTaskId
          evaluatorId
          statusId
          priorityId
          complexityId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          project {
            id
            name
          }
          evaluator {
            id
            firstName
            lastName
            email
          }
          status {
            id
            name
          }
          priority {
            id
            name
          }
          complexity {
            id
            name
          }
        }
      }
    `,
    taskData,
    store.authHeaders
  )
}

/**
 * Update an existing task.
 * Requires authentication.
 * @param taskData - Task update data
 */
export function updateTask(taskData: UpdateTaskInput): Promise<{ updateTask: Task }> {
  const store = useAuthStore()
  return graphqlClient<{ updateTask: Task }>(
    `
      mutation UpdateTask(
        $id: ID!
        $name: String
        $description: String
        $parentTaskId: ID
        $evaluatorId: ID
        $statusId: ID
        $priorityId: ID
        $complexityId: ID
        $plannedStartDate: String
        $plannedEndDate: String
        $actualStartDate: String
        $actualEndDate: String
      ) {
        updateTask(
          id: $id
          name: $name
          description: $description
          parentTaskId: $parentTaskId
          evaluatorId: $evaluatorId
          statusId: $statusId
          priorityId: $priorityId
          complexityId: $complexityId
          plannedStartDate: $plannedStartDate
          plannedEndDate: $plannedEndDate
          actualStartDate: $actualStartDate
          actualEndDate: $actualEndDate
        ) {
          id
          name
          description
          projectId
          parentTaskId
          evaluatorId
          statusId
          priorityId
          complexityId
          plannedStartDate
          plannedEndDate
          actualStartDate
          actualEndDate
          project {
            id
            name
          }
          evaluator {
            id
            firstName
            lastName
            email
          }
          status {
            id
            name
          }
          priority {
            id
            name
          }
          complexity {
            id
            name
          }
        }
      }
    `,
    taskData,
    store.authHeaders
  )
}

/**
 * Delete a task by ID.
 * Requires authentication.
 * @param id - Task ID to delete
 */
export function deleteTask(id: string): Promise<{ deleteTask: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteTask: boolean }>(
    `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `,
    { id },
    store.authHeaders
  )
}