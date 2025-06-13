// Utilities
import { defineStore } from 'pinia'

/**
 * Store managing authentication state.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    /** Indicates if a user is currently authenticated. */
    loggedIn: false,
  }),
})
