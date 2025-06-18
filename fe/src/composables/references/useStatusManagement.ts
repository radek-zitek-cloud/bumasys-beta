/**
 * @fileoverview Status Management Composable
 *
 * This composable provides reusable status management functionality that can be
 * shared across components. It encapsulates common patterns for CRUD operations,
 * loading states, error handling, and user feedback.
 *
 * Features:
 * - Complete CRUD operations with consistent error handling
 * - Loading state management using useLoading composable
 * - Integrated logging and notifications
 * - Type-safe interfaces
 * - Reusable across multiple components
 * - Search and filtering functionality
 * - Dialog state management
 *
 * Usage:
 * ```typescript
 * const {
 *   statuses,
 *   loading,
 *   filteredStatuses,
 *   loadStatuses,
 *   createStatus,
 *   updateStatus,
 *   deleteStatus
 * } = useStatusManagement()
 *
 * // Load statuses
 * await loadStatuses()
 *
 * // Create status
 * await createStatus({ name: 'In Progress' })
 * ```
 */

import type { CreateStatusInput, Status, UpdateStatusInput } from '../../services/status'
import { computed, readonly, ref } from 'vue'
import * as statusService from '../../services/status'
import { useLoading } from '../useLoading'
import { useLogger } from '../useLogger'
import { useNotifications } from '../useNotifications'

/**
 * Status management composable
 * @returns Status management utilities and state
 */
export function useStatusManagement () {
  const { logInfo, logError } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()
  const { loading, withLoading } = useLoading('status')

  // State management
  const statuses = ref<Status[]>([])
  const selectedStatus = ref<Status | null>(null)
  const statusSearch = ref('')

  // Dialog states
  const showStatusCreateDialog = ref(false)
  const showStatusEditDialog = ref(false)
  const showStatusDeleteDialog = ref(false)

  /**
   * Computed filtered statuses based on search term
   */
  const filteredStatuses = computed(() => {
    if (!statusSearch.value) {
      return statuses.value
    }

    const searchTerm = statusSearch.value.toLowerCase()
    return statuses.value.filter(status =>
      status.name.toLowerCase().includes(searchTerm),
    )
  })

  /**
   * Load all statuses from the API
   * @returns Promise that resolves when statuses are loaded
   */
  const loadStatuses = async (): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Loading statuses from API')
        const response = await statusService.getStatuses()
        statuses.value = response.statuses
        logInfo('Successfully loaded statuses', { count: response.statuses.length })
      } catch (error) {
        logError('Failed to load statuses', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to load statuses',
        )
        throw error
      }
    })
  }

  /**
   * Create a new status
   * @param statusData - Status creation data
   * @returns Promise that resolves when status is created
   */
  const createStatus = async (statusData: CreateStatusInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Creating new status', { name: statusData.name })
        await statusService.createStatus(statusData)
        notifySuccess('Status created successfully')
        logInfo('Status created successfully', { name: statusData.name })
        await loadStatuses() // Refresh the list
        closeCreateDialog()
      } catch (error) {
        logError('Failed to create status', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to create status',
        )
        throw error
      }
    })
  }

  /**
   * Update an existing status
   * @param statusData - Status update data
   * @returns Promise that resolves when status is updated
   */
  const updateStatus = async (statusData: UpdateStatusInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Updating status', { id: statusData.id, name: statusData.name })
        await statusService.updateStatus(statusData)
        notifySuccess('Status updated successfully')
        logInfo('Status updated successfully', { id: statusData.id })
        await loadStatuses() // Refresh the list
        closeEditDialog()
      } catch (error) {
        logError('Failed to update status', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to update status',
        )
        throw error
      }
    })
  }

  /**
   * Delete a status
   * @param statusId - ID of the status to delete
   * @returns Promise that resolves when status is deleted
   */
  const deleteStatus = async (statusId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Deleting status', { id: statusId })
        await statusService.deleteStatus(statusId)
        notifySuccess('Status deleted successfully')
        logInfo('Status deleted successfully', { id: statusId })
        await loadStatuses() // Refresh the list
        closeDeleteDialog()
      } catch (error) {
        logError('Failed to delete status', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to delete status',
        )
        throw error
      }
    })
  }

  /**
   * Dialog management functions
   */
  const openCreateDialog = (): void => {
    showStatusCreateDialog.value = true
  }

  const closeCreateDialog = (): void => {
    showStatusCreateDialog.value = false
  }

  const openEditDialog = (status: Status): void => {
    selectedStatus.value = status
    showStatusEditDialog.value = true
  }

  const closeEditDialog = (): void => {
    selectedStatus.value = null
    showStatusEditDialog.value = false
  }

  const openDeleteDialog = (status: Status): void => {
    selectedStatus.value = status
    showStatusDeleteDialog.value = true
  }

  const closeDeleteDialog = (): void => {
    selectedStatus.value = null
    showStatusDeleteDialog.value = false
  }

  return {
    // State
    statuses: readonly(statuses),
    selectedStatus: readonly(selectedStatus),
    statusSearch,
    loading: readonly(loading),

    // Computed
    filteredStatuses,

    // Operations
    loadStatuses,
    createStatus,
    updateStatus,
    deleteStatus,

    // Dialog management
    showStatusCreateDialog: readonly(showStatusCreateDialog),
    showStatusEditDialog: readonly(showStatusEditDialog),
    showStatusDeleteDialog: readonly(showStatusDeleteDialog),
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
