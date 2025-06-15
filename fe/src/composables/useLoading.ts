/**
 * @fileoverview Loading State Management Composable
 * 
 * This composable provides consistent loading state management across components.
 * It helps standardize loading indicators, error handling, and async operation states.
 * 
 * Features:
 * - Multiple named loading states
 * - Automatic error state management
 * - Loading operation wrappers
 * - Async operation helpers
 * - Global loading state
 * 
 * Usage:
 * ```typescript
 * const { loading, error, withLoading, setLoading } = useLoading()
 * 
 * // Basic loading state
 * setLoading(true)
 * // ... perform operation
 * setLoading(false)
 * 
 * // Wrap async operation
 * const result = await withLoading(async () => {
 *   return await api.fetchData()
 * })
 * 
 * // Named loading states
 * const { loading: saveLoading } = useLoading('save')
 * const { loading: deleteLoading } = useLoading('delete')
 * ```
 * 
 * TODO: Add loading state persistence for complex workflows
 * TODO: Implement loading timeout handling
 * TODO: Add loading progress tracking
 * TODO: Create loading state composition for multiple operations
 * TODO: Add loading analytics and performance monitoring
 */

import { ref, computed, readonly } from 'vue'

/**
 * Global loading states registry
 */
const globalLoadingStates = new Map<string, ReturnType<typeof ref<boolean>>>()
const globalErrorStates = new Map<string, ReturnType<typeof ref<Error | null>>>()

/**
 * Loading state management composable
 * @param namespace - Optional namespace for named loading states
 * @returns Loading state management utilities
 */
export function useLoading(namespace = 'default') {
  // Get or create loading state for this namespace
  if (!globalLoadingStates.has(namespace)) {
    globalLoadingStates.set(namespace, ref(false))
    globalErrorStates.set(namespace, ref<Error | null>(null))
  }

  const loading = globalLoadingStates.get(namespace)!
  const error = globalErrorStates.get(namespace)!

  /**
   * Set loading state
   * @param value - Loading state value
   */
  const setLoading = (value: boolean) => {
    loading.value = value
    if (value) {
      // Clear error when starting new operation
      error.value = null
    }
  }

  /**
   * Set error state
   * @param err - Error object or null to clear
   */
  const setError = (err: Error | null) => {
    error.value = err
    if (err) {
      // Stop loading when error occurs
      loading.value = false
    }
  }

  /**
   * Clear both loading and error states
   */
  const reset = () => {
    loading.value = false
    error.value = null
  }

  /**
   * Wrap an async operation with loading state management
   * @param operation - Async operation to wrap
   * @returns Promise resolving to operation result
   */
  const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true)
    try {
      const result = await operation()
      setError(null)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Execute an operation with loading state but don't throw on error
   * @param operation - Async operation to execute
   * @returns Promise resolving to result or null on error
   */
  const safeWithLoading = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      return await withLoading(operation)
    } catch (err) {
      console.error(`Operation failed in namespace '${namespace}':`, err)
      return null
    }
  }

  /**
   * Execute multiple operations in sequence with shared loading state
   * @param operations - Array of async operations
   * @returns Promise resolving to array of results
   */
  const withLoadingSequence = async <T>(operations: (() => Promise<T>)[]): Promise<T[]> => {
    setLoading(true)
    const results: T[] = []
    
    try {
      for (const operation of operations) {
        const result = await operation()
        results.push(result)
      }
      setError(null)
      return results
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Execute multiple operations in parallel with shared loading state
   * @param operations - Array of async operations
   * @returns Promise resolving to array of results
   */
  const withLoadingParallel = async <T>(operations: (() => Promise<T>)[]): Promise<T[]> => {
    setLoading(true)
    try {
      const results = await Promise.all(operations.map(op => op()))
      setError(null)
      return results
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    setLoading,
    setError,
    reset,
    withLoading,
    safeWithLoading,
    withLoadingSequence,
    withLoadingParallel,
  }
}

/**
 * Global loading state utilities
 */
export function useGlobalLoading() {
  /**
   * Check if any loading state is active
   */
  const isAnyLoading = computed(() => {
    return Array.from(globalLoadingStates.values()).some(state => state.value)
  })

  /**
   * Check if any error state is active
   */
  const hasAnyError = computed(() => {
    return Array.from(globalErrorStates.values()).some(state => state.value !== null)
  })

  /**
   * Get all active loading namespaces
   */
  const activeLoadingStates = computed(() => {
    const active: string[] = []
    for (const [namespace, state] of globalLoadingStates.entries()) {
      if (state.value) {
        active.push(namespace)
      }
    }
    return active
  })

  /**
   * Get all error states
   */
  const allErrors = computed(() => {
    const errors: { namespace: string; error: Error }[] = []
    for (const [namespace, state] of globalErrorStates.entries()) {
      if (state.value) {
        errors.push({ namespace, error: state.value })
      }
    }
    return errors
  })

  /**
   * Clear all loading states
   */
  const clearAllLoading = () => {
    for (const state of globalLoadingStates.values()) {
      state.value = false
    }
  }

  /**
   * Clear all error states
   */
  const clearAllErrors = () => {
    for (const state of globalErrorStates.values()) {
      state.value = null
    }
  }

  /**
   * Reset all loading and error states
   */
  const resetAll = () => {
    clearAllLoading()
    clearAllErrors()
  }

  return {
    isAnyLoading: readonly(isAnyLoading),
    hasAnyError: readonly(hasAnyError),
    activeLoadingStates: readonly(activeLoadingStates),
    allErrors: readonly(allErrors),
    clearAllLoading,
    clearAllErrors,
    resetAll,
  }
}

export default useLoading