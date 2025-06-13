// Utilities
import { defineStore } from "pinia";

/** Authenticated user payload. */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  note?: string;
}

/** Stored authentication details. */
export interface AuthState {
  /** Indicates if a user is currently authenticated. */
  loggedIn: boolean;
  /** Access token returned by the server. */
  token: string;
  /** Refresh token returned by the server. */
  refreshToken: string;
  /** Current authenticated user information. */
  user: User | null;
}

/**
 * Store managing authentication state.
 */
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    loggedIn: false,
    token: "",
    refreshToken: "",
    user: null,
  }),
  actions: {
    /** Save authentication payload and mark as logged in. */
    setAuth(payload: { token: string; refreshToken: string; user: User }) {
      this.loggedIn = true;
      this.token = payload.token;
      this.refreshToken = payload.refreshToken;
      this.user = payload.user;
    },
    /** Clear all authentication state. */
    clearAuth() {
      this.loggedIn = false;
      this.token = "";
      this.refreshToken = "";
      this.user = null;
    },
  },
});
