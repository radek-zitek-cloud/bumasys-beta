/**
 * @fileoverview Tests for useLoading composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoading, useGlobalLoading } from '../../../src/composables/useLoading'

describe('useLoading composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    it('should set loading to false when error occurs', () => {
      const { loading, setLoading, setError } = useLoading()

      setLoading(true)
      expect(loading.value).toBe(true)

      setError(new Error('Test error'))
      expect(loading.value).toBe(false)
    })
  })

  describe('withLoading', () => {
    it('should wrap async operations with loading states', async () => {
      const { loading, withLoading } = useLoading()

      const asyncOperation = vi.fn().mockResolvedValue('success')
      
      expect(loading.value).toBe(false)

      const promise = withLoading(asyncOperation)
      
      expect(loading.value).toBe(true)
      
      const result = await promise
      
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
})

describe('useGlobalLoading composable', () => {
  it('should detect when any loading state is active', () => {
    const { isAnyLoading } = useGlobalLoading()
    const defaultLoading = useLoading()
    const testLoading = useLoading('test')

    expect(isAnyLoading.value).toBe(false)

    defaultLoading.setLoading(true)
    expect(isAnyLoading.value).toBe(true)

    defaultLoading.setLoading(false)
    expect(isAnyLoading.value).toBe(false)

    testLoading.setLoading(true)
    expect(isAnyLoading.value).toBe(true)

    testLoading.setLoading(false)
    expect(isAnyLoading.value).toBe(false)
  })

  it('should detect when any error state is active', () => {
    const { hasAnyError } = useGlobalLoading()
    const defaultLoading = useLoading()
    const testLoading = useLoading('test')

    expect(hasAnyError.value).toBe(false)

    defaultLoading.setError(new Error('Default error'))
    expect(hasAnyError.value).toBe(true)

    defaultLoading.setError(null)
    expect(hasAnyError.value).toBe(false)

    testLoading.setError(new Error('Test error'))
    expect(hasAnyError.value).toBe(true)

    testLoading.setError(null)
    expect(hasAnyError.value).toBe(false)
  })
})
