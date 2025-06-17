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
  assignees?: Staff[]
  predecessors?: Task[]
  progressReports?: TaskProgress[]
  statusReports?: TaskStatusReport[]
}

/** Staff interface for assignees */
export interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department?: {
    id: string
    name: string
  }
}

/** Task progress report interface */
export interface TaskProgress {
  id: string
  taskId: string
  reportDate: string
  progressPercent: number
  notes?: string
  creatorId?: string
  task?: Task
  creator?: Staff
}

/** Task status report interface */
export interface TaskStatusReport {
  id: string
  taskId: string
  reportDate: string
  statusSummary?: string
  creatorId?: string
  task?: Task
  creator?: Staff
}

/** Interface for creating a new task progress report */
export interface CreateTaskProgressInput {
  taskId: string
  reportDate: string
  progressPercent: number
  notes?: string
  creatorId?: string
}

/** Interface for updating a task progress report */
export interface UpdateTaskProgressInput {
  id: string
  reportDate?: string
  progressPercent?: number
  notes?: string
  creatorId?: string
}

/** Interface for creating a new task status report */
export interface CreateTaskStatusReportInput {
  taskId: string
  reportDate: string
  statusSummary?: string
  creatorId?: string
}

/** Interface for updating a task status report */
export interface UpdateTaskStatusReportInput {
  id: string
  reportDate?: string
  statusSummary?: string
  creatorId?: string
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
export function getTasks (projectId?: string): Promise<{ tasks: Task[] }> {
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
    store.token,
  )
}

/**
 * Fetch a specific task by ID.
 * Requires authentication.
 * @param id - Task ID to fetch
 */
export function getTask (id: string): Promise<{ task: Task | null }> {
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
    store.token,
  )
}

/**
 * Create a new task.
 * Requires authentication.
 * @param taskData - Task creation data
 */
export function createTask (taskData: CreateTaskInput): Promise<{ createTask: Task }> {
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
    taskData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Update an existing task.
 * Requires authentication.
 * @param taskData - Task update data
 */
export function updateTask (taskData: UpdateTaskInput): Promise<{ updateTask: Task }> {
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
    taskData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Delete a task by ID.
 * Requires authentication.
 * @param id - Task ID to delete
 */
export function deleteTask (id: string): Promise<{ deleteTask: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteTask: boolean }>(
    `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Get a task with all its management data (assignees, predecessors, etc.)
 * Requires authentication.
 * @param id - Task ID to fetch
 */
export function getTaskWithManagementData (id: string): Promise<{ task: Task | null }> {
  const store = useAuthStore()
  return graphqlClient<{ task: Task | null }>(
    `
      query GetTaskWithManagementData($id: ID!) {
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
            status {
              id
              name
            }
            project {
              id
              name
            }
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
          assignees {
            id
            firstName
            lastName
            email
            role
            department {
              id
              name
            }
          }
          predecessors {
            id
            name
            description
            project {
              id
              name
            }
          }
          progressReports {
            id
            taskId
            reportDate
            progressPercent
            notes
            creatorId
            creator {
              id
              firstName
              lastName
              email
            }
          }
          statusReports {
            id
            taskId
            reportDate
            statusSummary
            creatorId
            creator {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Assign a staff member to a task.
 * Requires authentication.
 * @param taskId - Task ID
 * @param staffId - Staff ID to assign
 */
export function assignStaffToTask (taskId: string, staffId: string): Promise<{ assignStaffToTask: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ assignStaffToTask: boolean }>(
    `
      mutation AssignStaffToTask($taskId: ID!, $staffId: ID!) {
        assignStaffToTask(taskId: $taskId, staffId: $staffId)
      }
    `,
    { taskId, staffId },
    store.token,
  )
}

/**
 * Remove a staff member from a task.
 * Requires authentication.
 * @param taskId - Task ID
 * @param staffId - Staff ID to remove
 */
export function removeStaffFromTask (taskId: string, staffId: string): Promise<{ removeStaffFromTask: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ removeStaffFromTask: boolean }>(
    `
      mutation RemoveStaffFromTask($taskId: ID!, $staffId: ID!) {
        removeStaffFromTask(taskId: $taskId, staffId: $staffId)
      }
    `,
    { taskId, staffId },
    store.token,
  )
}

/**
 * Add a predecessor relationship to a task.
 * Requires authentication.
 * @param taskId - Task ID
 * @param predecessorTaskId - Predecessor task ID
 */
export function addTaskPredecessor (taskId: string, predecessorTaskId: string): Promise<{ addTaskPredecessor: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ addTaskPredecessor: boolean }>(
    `
      mutation AddTaskPredecessor($taskId: ID!, $predecessorTaskId: ID!) {
        addTaskPredecessor(taskId: $taskId, predecessorTaskId: $predecessorTaskId)
      }
    `,
    { taskId, predecessorTaskId },
    store.token,
  )
}

/**
 * Remove a predecessor relationship from a task.
 * Requires authentication.
 * @param taskId - Task ID
 * @param predecessorTaskId - Predecessor task ID to remove
 */
export function removeTaskPredecessor (taskId: string, predecessorTaskId: string): Promise<{ removeTaskPredecessor: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ removeTaskPredecessor: boolean }>(
    `
      mutation RemoveTaskPredecessor($taskId: ID!, $predecessorTaskId: ID!) {
        removeTaskPredecessor(taskId: $taskId, predecessorTaskId: $predecessorTaskId)
      }
    `,
    { taskId, predecessorTaskId },
    store.token,
  )
}

/**
 * Create a new task progress report.
 * Requires authentication.
 * @param progressData - Progress report creation data
 */
export function createTaskProgress (progressData: CreateTaskProgressInput): Promise<{ createTaskProgress: TaskProgress }> {
  const store = useAuthStore()
  return graphqlClient<{ createTaskProgress: TaskProgress }>(
    `
      mutation CreateTaskProgress(
        $taskId: ID!
        $reportDate: String!
        $progressPercent: Int!
        $notes: String
        $creatorId: ID
      ) {
        createTaskProgress(
          taskId: $taskId
          reportDate: $reportDate
          progressPercent: $progressPercent
          notes: $notes
          creatorId: $creatorId
        ) {
          id
          taskId
          reportDate
          progressPercent
          notes
          creatorId
        }
      }
    `,
    progressData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Update an existing task progress report.
 * Requires authentication.
 * @param progressData - Progress report update data
 */
export function updateTaskProgress (progressData: UpdateTaskProgressInput): Promise<{ updateTaskProgress: TaskProgress }> {
  const store = useAuthStore()
  return graphqlClient<{ updateTaskProgress: TaskProgress }>(
    `
      mutation UpdateTaskProgress(
        $id: ID!
        $reportDate: String
        $progressPercent: Int
        $notes: String
      ) {
        updateTaskProgress(
          id: $id
          reportDate: $reportDate
          progressPercent: $progressPercent
          notes: $notes
        ) {
          id
          taskId
          reportDate
          progressPercent
          notes
        }
      }
    `,
    progressData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Delete a task progress report by ID.
 * Requires authentication.
 * @param id - Progress report ID to delete
 */
export function deleteTaskProgress (id: string): Promise<{ deleteTaskProgress: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteTaskProgress: boolean }>(
    `
      mutation DeleteTaskProgress($id: ID!) {
        deleteTaskProgress(id: $id)
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new task status report.
 * Requires authentication.
 * @param statusData - Status report creation data
 */
export function createTaskStatusReport (statusData: CreateTaskStatusReportInput): Promise<{ createTaskStatusReport: TaskStatusReport }> {
  const store = useAuthStore()
  return graphqlClient<{ createTaskStatusReport: TaskStatusReport }>(
    `
      mutation CreateTaskStatusReport(
        $taskId: ID!
        $reportDate: String!
        $statusSummary: String
        $creatorId: ID
      ) {
        createTaskStatusReport(
          taskId: $taskId
          reportDate: $reportDate
          statusSummary: $statusSummary
          creatorId: $creatorId
        ) {
          id
          taskId
          reportDate
          statusSummary
          creatorId
        }
      }
    `,
    statusData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Update an existing task status report.
 * Requires authentication.
 * @param statusData - Status report update data
 */
export function updateTaskStatusReport (statusData: UpdateTaskStatusReportInput): Promise<{ updateTaskStatusReport: TaskStatusReport }> {
  const store = useAuthStore()
  return graphqlClient<{ updateTaskStatusReport: TaskStatusReport }>(
    `
      mutation UpdateTaskStatusReport(
        $id: ID!
        $reportDate: String
        $statusSummary: String
      ) {
        updateTaskStatusReport(
          id: $id
          reportDate: $reportDate
          statusSummary: $statusSummary
        ) {
          id
          taskId
          reportDate
          statusSummary
        }
      }
    `,
    statusData as unknown as Record<string, unknown>,
    store.token,
  )
}

/**
 * Delete a task status report by ID.
 * Requires authentication.
 * @param id - Status report ID to delete
 */
export function deleteTaskStatusReport (id: string): Promise<{ deleteTaskStatusReport: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteTaskStatusReport: boolean }>(
    `
      mutation DeleteTaskStatusReport($id: ID!) {
        deleteTaskStatusReport(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
