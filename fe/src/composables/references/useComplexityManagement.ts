/**
 * @fileoverview Complexity Management Composable
 *
 * This composable provides reusable complexity management functionality that can be
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
 *   complexities,
 *   loading,
 *   filteredComplexities,
 *   loadComplexities,
 *   createComplexity,
 *   updateComplexity,
 *   deleteComplexity
 * } = useComplexityManagement()
 *
 * // Load complexities
 * await loadComplexities()
 *
 * // Create complexity
 * await createComplexity({ name: 'Complex' })
 * ```
 */

import type { Complexity, CreateComplexityInput, UpdateComplexityInput } from '../../services/complexity'
import { computed, readonly, ref } from 'vue'
import * as complexityService from '../../services/complexity'
import { useLoading } from '../useLoading'
import { useLogger } from '../useLogger'
import { useNotifications } from '../useNotifications'

/**
 * Complexity management composable
 * @returns Complexity management utilities and state
 */
export function useComplexityManagement () {
  const { logInfo, logError } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()
  const { loading, withLoading } = useLoading('complexity')

  // State management
  const complexities = ref<Complexity[]>([])
  const selectedComplexity = ref<Complexity | null>(null)
  const complexitySearch = ref('')

  // Dialog states
  const showComplexityCreateDialog = ref(false)
  const showComplexityEditDialog = ref(false)
  const showComplexityDeleteDialog = ref(false)

  /**
   * Computed filtered complexities based on search term
   */
  const filteredComplexities = computed(() => {
    if (!complexitySearch.value) {
      return complexities.value
    }

    const searchTerm = complexitySearch.value.toLowerCase()
    return complexities.value.filter(complexity =>
      complexity.name.toLowerCase().includes(searchTerm),
    )
  })

  /**
   * Load all complexities from the API
   * @returns Promise that resolves when complexities are loaded
   */
  const loadComplexities = async (): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Loading complexities from API')
        const response = await complexityService.getComplexities()
        complexities.value = response.complexities
        logInfo('Successfully loaded complexities', { count: response.complexities.length })
      } catch (error) {
        logError('Failed to load complexities', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to load complexities',
        )
        throw error
      }
    })
  }

  /**
   * Create a new complexity
   * @param complexityData - Complexity creation data
   * @returns Promise that resolves when complexity is created
   */
  const createComplexity = async (complexityData: CreateComplexityInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Creating new complexity', { name: complexityData.name })
        await complexityService.createComplexity(complexityData)
        notifySuccess('Complexity created successfully')
        logInfo('Complexity created successfully', { name: complexityData.name })
        await loadComplexities() // Refresh the list
        closeCreateDialog()
      } catch (error) {
        logError('Failed to create complexity', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to create complexity',
        )
        throw error
      }
    })
  }

  /**
   * Update an existing complexity
   * @param complexityData - Complexity update data
   * @returns Promise that resolves when complexity is updated
   */
  const updateComplexity = async (complexityData: UpdateComplexityInput): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Updating complexity', { id: complexityData.id, name: complexityData.name })
        await complexityService.updateComplexity(complexityData)
        notifySuccess('Complexity updated successfully')
        logInfo('Complexity updated successfully', { id: complexityData.id })
        await loadComplexities() // Refresh the list
        closeEditDialog()
      } catch (error) {
        logError('Failed to update complexity', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to update complexity',
        )
        throw error
      }
    })
  }

  /**
   * Delete a complexity
   * @param complexityId - ID of the complexity to delete
   * @returns Promise that resolves when complexity is deleted
   */
  const deleteComplexity = async (complexityId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        logInfo('Deleting complexity', { id: complexityId })
        await complexityService.deleteComplexity(complexityId)
        notifySuccess('Complexity deleted successfully')
        logInfo('Complexity deleted successfully', { id: complexityId })
        await loadComplexities() // Refresh the list
        closeDeleteDialog()
      } catch (error) {
        logError('Failed to delete complexity', error)
        notifyError(
          error instanceof Error ? error.message : 'Failed to delete complexity',
        )
        throw error
      }
    })
  }

  /**
   * Dialog management functions
   */
  const openCreateDialog = (): void => {
    showComplexityCreateDialog.value = true
  }

  const closeCreateDialog = (): void => {
    showComplexityCreateDialog.value = false
  }

  const openEditDialog = (complexity: Complexity): void => {
    selectedComplexity.value = complexity
    showComplexityEditDialog.value = true
  }

  const closeEditDialog = (): void => {
    selectedComplexity.value = null
    showComplexityEditDialog.value = false
  }

  const openDeleteDialog = (complexity: Complexity): void => {
    selectedComplexity.value = complexity
    showComplexityDeleteDialog.value = true
  }

  const closeDeleteDialog = (): void => {
    selectedComplexity.value = null
    showComplexityDeleteDialog.value = false
  }

  return {
    // State
    complexities: readonly(complexities),
    selectedComplexity: readonly(selectedComplexity),
    complexitySearch,
    loading: readonly(loading),

    // Computed
    filteredComplexities,

    // Operations
    loadComplexities,
    createComplexity,
    updateComplexity,
    deleteComplexity,

    // Dialog management
    showComplexityCreateDialog: readonly(showComplexityCreateDialog),
    showComplexityEditDialog: readonly(showComplexityEditDialog),
    showComplexityDeleteDialog: readonly(showComplexityDeleteDialog),
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
