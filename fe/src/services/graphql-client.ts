/**
 * @fileoverview Centralized GraphQL client with authentication handling
 *
 * This module provides a centralized GraphQL client that handles:
 * - Authentication token management
 * - Automatic token refresh on authentication failures
 * - Authentication state cleanup and routing when tokens are invalid
 * - Error handling for unauthenticated requests
 */

import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logDebug, logError, logInfo, logWarn } from '../utils/logger'

/**
 * Centralized GraphQL client with automatic authentication handling.
 *
 * Features:
 * - Automatically includes authentication tokens when available
 * - Attempts token refresh on authentication failures
 * - Clears auth state and redirects to home on refresh failure
 * - Provides consistent error handling across all GraphQL operations
 *
 * @param query - GraphQL query or mutation string
 * @param variables - Variables to pass to the GraphQL operation
 * @param token - Optional explicit token (overrides store token)
 * @returns Promise resolving to GraphQL response data
 * @throws Error if GraphQL operation fails after retry attempts
 */
export async function graphqlClient<T> (
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const authStore = useAuthStore()

  // Use provided token or get from store
  const authToken = token || authStore.token

  logDebug('GraphQL request initiated', {
    hasAuthToken: !!authToken,
    hasVariables: !!variables,
    queryType: query.trim().startsWith('mutation') ? 'mutation' : 'query',
  })

  // Perform the GraphQL request
  const performRequest = async (requestToken?: string): Promise<T> => {
    const startTime = Date.now()

    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      })

      const json = await res.json()
      const duration = Date.now() - startTime

      logDebug('GraphQL response received', {
        status: res.status,
        duration,
        hasErrors: !!json.errors,
      })

      if (json.errors) {
        logWarn('GraphQL response contains errors', {
          errors: json.errors,
          duration,
        })

        // Check if error is authentication-related
        const isAuthError = json.errors.some((error: any) =>
          error.message?.includes?.('Unauthenticated')
          || error.message?.includes?.('Invalid token')
          || error.message?.includes?.('jwt expired'),
        )

        if (isAuthError) {
          logWarn('Authentication error detected in GraphQL response')
          throw new AuthenticationError(json.errors[0].message)
        }

        throw new Error(json.errors[0].message)
      }

      logDebug('GraphQL request completed successfully', { duration })
      return json.data as T
    } catch (error) {
      const duration = Date.now() - startTime
      logError('GraphQL request failed', { error, duration })
      throw error
    }
  }

  try {
    // First attempt with current token
    return await performRequest(authToken)
  } catch (error) {
    // If authentication error and we have a refresh token, try to refresh
    if (error instanceof AuthenticationError && authStore.refreshToken && !token) {
      try {
        logInfo('Attempting token refresh after authentication error')
        await authStore.refreshAuth()

        logInfo('Token refresh successful, retrying GraphQL request')
        // Retry with new token
        return await performRequest(authStore.token)
      } catch (refreshError) {
        logError('Token refresh failed, clearing auth state', refreshError)
        // Refresh failed, clear auth state and redirect
        authStore.clearAuth()

        // Navigate to home page if router is available
        try {
          const router = useRouter()
          logInfo('Redirecting to home page after auth failure')
          router.push('/')
        } catch {
          // Router might not be available in some contexts (e.g., tests)
          // Fallback to location redirect
          if (typeof window !== 'undefined') {
            logWarn('Router not available, using window.location for redirect')
            window.location.href = '/'
          }
        }

        throw new Error('Authentication failed. Please log in again.')
      }
    }

    // Re-throw other errors
    throw error
  }
}

/**
 * Custom error class for authentication-related errors
 */
class AuthenticationError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
