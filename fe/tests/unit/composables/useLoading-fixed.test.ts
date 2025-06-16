/**
 * @fileoverview Tests for useLoading composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGlobalLoading, useLoading } from '../../../src/composables/useLoading'

describe('useLoading composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset global loading states between tests
    const { resetAll } = useGlobalLoading()
    resetAll()
  })

  describe('basic functionality', () => {
    it('should initialize with default state', () => {
      const { loading, error } = useLoading()

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should manage loading state', () => {
      const { loading, setLoading } = useLoading()

      expect(loading.value).toBe(false)

      setLoading(true)
      expect(loading.value).toBe(true)

      setLoading(false)
      expect(loading.value).toBe(false)
    })

    it('should manage error state', () => {
      const { error, setError } = useLoading()

      expect(error.value).toBeNull()

      const testError = new Error('Test error')
      setError(testError)
      expect(error.value).toBe(testError)

      setError(null)
      expect(error.value).toBeNull()
    })

    it('should clear error when setting loading to true', () => {
      const { error, setError, setLoading } = useLoading()

      setError(new Error('Previous error'))
      expect(error.value).not.toBeNull()

      setLoading(true)
      expect(error.value).toBeNull()
    })

    it('should stop loading when error occurs', () => {
      const { loading, setLoading, setError } = useLoading()

      setLoading(true)
      expect(loading.value).toBe(true)

      setError(new Error('Test error'))
      expect(loading.value).toBe(false)
    })

    it('should reset both loading and error states', () => {
      const { loading, error, setLoading, setError, reset } = useLoading()

      setLoading(true)
      expect(loading.value).toBe(true)

      setError(new Error('Test error'))
      expect(loading.value).toBe(false) // setError sets loading to false
      expect(error.value).not.toBeNull()

      // Now test reset functionality
      setLoading(true) // Set loading again
      expect(loading.value).toBe(true)
      expect(error.value).toBeNull() // error should be cleared

      setError(new Error('Another error'))
      expect(error.value).not.toBeNull()

      reset()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('withLoading', () => {
    it('should wrap async operations with loading states', async () => {
      const { loading, withLoading } = useLoading()

      const asyncOperation = vi.fn().mockResolvedValue('success')

      expect(loading.value).toBe(false)

      const result = await withLoading(asyncOperation)

      expect(loading.value).toBe(false)
      expect(result).toBe('success')
      expect(asyncOperation).toHaveBeenCalled()
    })

    it('should handle errors in async operations', async () => {
      const { loading, error, withLoading } = useLoading()

      const testError = new Error('Operation failed')
      const asyncOperation = vi.fn().mockRejectedValue(testError)

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()

      await expect(withLoading(asyncOperation)).rejects.toThrow('Operation failed')

      expect(loading.value).toBe(false)
      expect(error.value).toBe(testError)
    })
  })

  describe('safeWithLoading', () => {
    it('should not throw on errors', async () => {
      const { safeWithLoading } = useLoading()

      const testError = new Error('Operation failed')
      const asyncOperation = vi.fn().mockRejectedValue(testError)

      const result = await safeWithLoading(asyncOperation)

      expect(result).toBeNull()
      expect(asyncOperation).toHaveBeenCalled()
    })
  })

  describe('namespace support', () => {
    it('should handle different namespaces independently', () => {
      const save = useLoading('save')
      const delete_ = useLoading('delete')

      expect(save.loading.value).toBe(false)
      expect(delete_.loading.value).toBe(false)

      save.setLoading(true)
      expect(save.loading.value).toBe(true)
      expect(delete_.loading.value).toBe(false)

      delete_.setLoading(true)
      expect(save.loading.value).toBe(true)
      expect(delete_.loading.value).toBe(true)
    })
  })
})

describe('useGlobalLoading composable', () => {
  beforeEach(() => {
    const { resetAll } = useGlobalLoading()
    resetAll()
  })

  it('should detect any loading state', () => {
    const { isAnyLoading } = useGlobalLoading()
    const { setLoading } = useLoading('test')

    expect(isAnyLoading.value).toBe(false)

    setLoading(true)
    expect(isAnyLoading.value).toBe(true)

    setLoading(false)
    expect(isAnyLoading.value).toBe(false)
  })

  it('should detect any error state', () => {
    const { hasAnyError } = useGlobalLoading()
    const { setError } = useLoading('test')

    expect(hasAnyError.value).toBe(false)

    setError(new Error('Test error'))
    expect(hasAnyError.value).toBe(true)

    setError(null)
    expect(hasAnyError.value).toBe(false)
  })

  it('should track active loading states', () => {
    const { activeLoadingStates } = useGlobalLoading()
    const save = useLoading('save')
    const delete_ = useLoading('delete')

    expect(activeLoadingStates.value).toEqual([])

    save.setLoading(true)
    expect(activeLoadingStates.value).toContain('save')

    delete_.setLoading(true)
    expect(activeLoadingStates.value).toContain('save')
    expect(activeLoadingStates.value).toContain('delete')
  })

  it('should clear all loading states', () => {
    const { clearAllLoading } = useGlobalLoading()
    const save = useLoading('save')
    const delete_ = useLoading('delete')

    save.setLoading(true)
    delete_.setLoading(true)

    expect(save.loading.value).toBe(true)
    expect(delete_.loading.value).toBe(true)

    clearAllLoading()

    expect(save.loading.value).toBe(false)
    expect(delete_.loading.value).toBe(false)
  })

  it('should clear all error states', () => {
    const { clearAllErrors } = useGlobalLoading()
    const save = useLoading('save')
    const delete_ = useLoading('delete')

    save.setError(new Error('Save error'))
    delete_.setError(new Error('Delete error'))

    expect(save.error.value).not.toBeNull()
    expect(delete_.error.value).not.toBeNull()

    clearAllErrors()

    expect(save.error.value).toBeNull()
    expect(delete_.error.value).toBeNull()
  })
})
