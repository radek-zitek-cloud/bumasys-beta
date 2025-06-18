/**
 * @fileoverview Priority Management Composable
 *
 * This composable provides reusable priority management functionality that can be
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
 *   priorities,
 *   loading,
 *   filteredPriorities,
 *   loadPriorities,
 *   createPriority,
 *   updatePriority,
 *   deletePriority
 * } = usePriorityManagement()
 *
 * // Load priorities
 * await loadPriorities()
 *
 * // Create priority
 * await createPriority({ name: 'High' })
 * ```
 */

import type { CreatePriorityInput, Priority, UpdatePriorityInput } from '../../services/priority'
import { computed, readonly, ref } from 'vue'
import * as priorityService from '../../services/priority'
import { useLoading } from '../useLoading'
import { useLogger } from '../useLogger'
import { useNotifications } from '../useNotifications'

/**
 * Priority management composable
 * @returns Priority management utilities and state
 */
export function usePriorityManagement () {
  const { logInfo, logError } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()
  const { loading, withLoading } = useLoading('priority')

  // State management
  const priorities = ref<Priority[]>([])
  const selectedPriority = ref<Priority | null>(null)
  const prioritySearch = ref('')

  // Dialog states
  const showPriorityCreateDialog = ref(false)
  const showPriorityEditDialog = ref(false)
  const showPriorityDeleteDialog = ref(false)

  /**
   * Computed filtered priorities based on search term
   */
  const filteredPriorities = computed(() => {
    if (!prioritySearch.value) {
      return priorities.value
    }

    const searchTerm = prioritySearch.value.toLowerCase()
    return priorities.value.filter(priority =>
      priority.name.toLowerCase().includes(searchTerm),
    )
  })

  /**
   * Load all priorities from the API
   * @returns Promise that resolves when priorities are loaded
   */
  const loadPriorities = async (): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Loading priorities from API')
        const response = await priorityService.getPriorities()
        priorities.value = response.priorities
        logInfo('Successfully loaded priorities', { count: response.priorities.length })
      } catch (error) {
        logError('Failed to load priorities', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to load priorities',
        )
        throw error
      }
    })
  }

  /**
   * Create a new priority
   * @param priorityData - Priority creation data
   * @returns Promise that resolves when priority is created
   */
  const createPriority = async (priorityData: CreatePriorityInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Creating new priority', { name: priorityData.name })
        await priorityService.createPriority(priorityData)
        notifySuccess('Priority created successfully')
        logInfo('Priority created successfully', { name: priorityData.name })
        await loadPriorities() // Refresh the list
        closeCreateDialog()
      } catch (error) {
        logError('Failed to create priority', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to create priority',
        )
        throw error
      }
    })
  }

  /**
   * Update an existing priority
   * @param priorityData - Priority update data
   * @returns Promise that resolves when priority is updated
   */
  const updatePriority = async (priorityData: UpdatePriorityInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Updating priority', { id: priorityData.id, name: priorityData.name })
        await priorityService.updatePriority(priorityData)
        notifySuccess('Priority updated successfully')
        logInfo('Priority updated successfully', { id: priorityData.id })
        await loadPriorities() // Refresh the list
        closeEditDialog()
      } catch (error) {
        logError('Failed to update priority', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to update priority',
        )
        throw error
      }
    })
  }

  /**
   * Delete a priority
   * @param priorityId - ID of the priority to delete
   * @returns Promise that resolves when priority is deleted
   */
  const deletePriority = async (priorityId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Deleting priority', { id: priorityId })
        await priorityService.deletePriority(priorityId)
        notifySuccess('Priority deleted successfully')
        logInfo('Priority deleted successfully', { id: priorityId })
        await loadPriorities() // Refresh the list
        closeDeleteDialog()
      } catch (error) {
        logError('Failed to delete priority', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to delete priority',
        )
        throw error
      }
    })
  }

  /**
   * Dialog management functions
   */
  const openCreateDialog = (): void => {
    showPriorityCreateDialog.value = true
  }

  const closeCreateDialog = (): void => {
    showPriorityCreateDialog.value = false
  }

  const openEditDialog = (priority: Priority): void => {
    selectedPriority.value = priority
    showPriorityEditDialog.value = true
  }

  const closeEditDialog = (): void => {
    selectedPriority.value = null
    showPriorityEditDialog.value = false
  }

  const openDeleteDialog = (priority: Priority): void => {
    selectedPriority.value = priority
    showPriorityDeleteDialog.value = true
  }

  const closeDeleteDialog = (): void => {
    selectedPriority.value = null
    showPriorityDeleteDialog.value = false
  }

  return {
    // State
    priorities: readonly(priorities),
    selectedPriority: readonly(selectedPriority),
    prioritySearch,
    loading: readonly(loading),

    // Computed
    filteredPriorities,

    // Operations
    loadPriorities,
    createPriority,
    updatePriority,
    deletePriority,

    // Dialog management
    showPriorityCreateDialog: readonly(showPriorityCreateDialog),
    showPriorityEditDialog: readonly(showPriorityEditDialog),
    showPriorityDeleteDialog: readonly(showPriorityDeleteDialog),
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
