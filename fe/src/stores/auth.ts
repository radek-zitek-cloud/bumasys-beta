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
    /** Save authentication payload and mark as logged in. */
    setAuth (payload: { token: string, refreshToken: string, user: User }) {
      this.loggedIn = true
      this.token = payload.token
      this.refreshToken = payload.refreshToken
      this.user = payload.user
    },
    /** Clear all authentication state. */
    clearAuth () {
      this.loggedIn = false
      this.token = ''
      this.refreshToken = ''
      this.user = null
    },
    /**
     * Refresh authentication tokens using the stored refresh token.
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
