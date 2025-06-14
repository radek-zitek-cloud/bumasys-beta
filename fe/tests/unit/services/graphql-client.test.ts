/**
 * @fileoverview Tests for the centralized GraphQL client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { graphqlClient } from '../../../src/services/graphql-client'
import { useAuthStore } from '../../../src/stores/auth'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('graphqlClient', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should make a successful GraphQL request without authentication', async () => {
    const mockResponse = {
      data: { test: 'success' }
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    })

    const query = 'query { test }'
    const result = await graphqlClient<{ test: string }>(query)

    expect(mockFetch).toHaveBeenCalledWith('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: undefined }),
    })
    expect(result).toEqual({ test: 'success' })
  })

  it('should include authorization header when token is provided', async () => {
    authStore.setAuth({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@example.com' }
    })

    const mockResponse = {
      data: { test: 'success' }
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    })

    const query = 'query { test }'
    await graphqlClient<{ test: string }>(query)

    expect(mockFetch).toHaveBeenCalledWith('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ query, variables: undefined }),
    })
  })

  it('should throw error for GraphQL errors that are not authentication related', async () => {
    const mockResponse = {
      errors: [{ message: 'Some other error' }]
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    })

    const query = 'query { test }'
    
    await expect(graphqlClient<{ test: string }>(query))
      .rejects.toThrow('Some other error')
  })

  it('should attempt token refresh on authentication error', async () => {
    authStore.setAuth({
      token: 'expired-token',
      refreshToken: 'valid-refresh-token',
      user: { id: '1', email: 'test@example.com' }
    })

    // First call fails with auth error
    const mockAuthErrorResponse = {
      errors: [{ message: 'Unauthenticated' }]
    }

    // Second call (refresh) succeeds
    const mockRefreshResponse = {
      data: {
        refreshToken: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          user: { id: '1', email: 'test@example.com' }
        }
      }
    }

    // Third call (retry with new token) succeeds
    const mockSuccessResponse = {
      data: { test: 'success' }
    }

    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockAuthErrorResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockRefreshResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSuccessResponse)
      })

    const query = 'query { test }'
    const result = await graphqlClient<{ test: string }>(query)

    expect(result).toEqual({ test: 'success' })
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(authStore.token).toBe('new-token')
    expect(authStore.refreshToken).toBe('new-refresh-token')
  })

  it('should clear auth and throw error when refresh fails', async () => {
    authStore.setAuth({
      token: 'expired-token',
      refreshToken: 'invalid-refresh-token',
      user: { id: '1', email: 'test@example.com' }
    })

    // First call fails with auth error
    const mockAuthErrorResponse = {
      errors: [{ message: 'Unauthenticated' }]
    }

    // Refresh call fails
    const mockRefreshErrorResponse = {
      errors: [{ message: 'Invalid refresh token' }]
    }

    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockAuthErrorResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockRefreshErrorResponse)
      })

    const query = 'query { test }'
    
    await expect(graphqlClient<{ test: string }>(query))
      .rejects.toThrow('Authentication failed. Please log in again.')

    expect(authStore.loggedIn).toBe(false)
    expect(authStore.token).toBe('')
    expect(authStore.refreshToken).toBe('')
  })

  it('should not attempt refresh when explicit token is provided', async () => {
    authStore.setAuth({
      token: 'store-token',
      refreshToken: 'store-refresh-token',
      user: { id: '1', email: 'test@example.com' }
    })

    const mockAuthErrorResponse = {
      errors: [{ message: 'Unauthenticated' }]
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockAuthErrorResponse)
    })

    const query = 'query { test }'
    const explicitToken = 'explicit-token'
    
    await expect(graphqlClient<{ test: string }>(query, {}, explicitToken))
      .rejects.toThrow('Unauthenticated')

    // Should only be called once, no refresh attempt
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})