/**
 * @fileoverview Authentication Store
 * 
 * This Pinia store manages authentication state throughout the application.
 * It handles user login/logout, token management, and authentication persistence
 * across browser sessions.
 * 
 * Features:
 * - Persistent authentication state using pinia-plugin-persistedstate
 * - Automatic token and user management
 * - Type-safe interfaces for user and auth state
 * - Clear authentication lifecycle methods
 * 
 * Usage:
 * ```typescript
 * const auth = useAuthStore()
 * 
 * // Check if user is logged in
 * if (auth.loggedIn) {
 *   // Access user information
 *   console.log(auth.user?.email)
 * }
 * 
 * // Set authentication after login
 * auth.setAuth({ token, refreshToken, user })
 * 
 * // Clear authentication on logout
 * auth.clearAuth()
 * ```
 * 
 * Security Notes:
 * - Tokens are stored in localStorage via persistence plugin
 * - Clear authentication state on token expiry
 * - Always validate tokens on app initialization
 * 
 * TODO: Add token expiration handling
 * TODO: Implement automatic token refresh
 * TODO: Add user role and permissions management
 * TODO: Implement session timeout warnings
 * TODO: Add audit logging for authentication events
 */

// Utilities
import { defineStore } from 'pinia'

/** Authenticated user payload. */
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  note?: string
}

/** Stored authentication details. */
export interface AuthState {
  /** Indicates if a user is currently authenticated. */
  loggedIn: boolean
  /** Access token returned by the server. */
  token: string
  /** Refresh token returned by the server. */
  refreshToken: string
  /** Current authenticated user information. */
  user: User | null
}

/**
 * Store managing authentication state.
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    loggedIn: false,
    token: '',
    refreshToken: '',
    user: null,
  }),
  persist: true,
  actions: {
    /**
     * Save authentication payload and mark user as logged in.
     * Updates all authentication state including tokens and user information.
     * @param payload - Authentication data from login/register response
     */
    setAuth (payload: { token: string, refreshToken: string, user: User }) {
      this.loggedIn = true
      this.token = payload.token
      this.refreshToken = payload.refreshToken
      this.user = payload.user
    },
    
    /**
     * Clear all authentication state and mark user as logged out.
     * Removes tokens, user information, and resets login status.
     * Should be called on logout or when tokens become invalid.
     */
    clearAuth () {
      this.loggedIn = false
      this.token = ''
      this.refreshToken = ''
      this.user = null
    },
    
    /**
     * Refresh authentication tokens using the stored refresh token.
     * Automatically updates the store with new tokens and user data.
     * Used to maintain authentication without requiring re-login.
     * @throws Error if refresh fails or no refresh token is available
     */
    async refreshAuth () {
      if (!this.refreshToken) {
        throw new Error('No refresh token available')
      }

      // Direct fetch to avoid circular dependency with graphql-client
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation ($token: String!) {
              refreshToken(refreshToken: $token) {
                token
                refreshToken
                user {
                  id
                  email
                  firstName
                  lastName
                  note
                }
              }
            }
          `,
          variables: { token: this.refreshToken },
        }),
      })

      const json = await res.json()

      if (json.errors) {
        // Clear auth state on refresh failure
        this.clearAuth()
        throw new Error(json.errors[0].message)
      }

      this.setAuth(json.data.refreshToken)
    },
  },
})
