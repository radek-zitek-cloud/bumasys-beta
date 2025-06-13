import { useAuthStore } from '../stores/auth'

/** GraphQL helper to perform POST requests. */
async function graphql<T> (query: string, variables?: Record<string, unknown>, token?: string): Promise<T> {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data as T
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  note?: string
}

export interface AuthPayload {
  token: string
  refreshToken: string
  user: User
}

/** Login and obtain auth payload. */
export function login (email: string, password: string) {
  return graphql<{ login: AuthPayload }>(
    `mutation($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        refreshToken
        user { id email firstName lastName note }
      }
    }`,
    { email, password },
  )
}

/** Register a new account and return auth payload. */
export function register (email: string, password: string) {
  return graphql<{ register: AuthPayload }>(
    `mutation($email: String!, $password: String!) {
      register(email: $email, password: $password) {
        token
        refreshToken
        user { id email firstName lastName note }
      }
    }`,
    { email, password },
  )
}

/** Request password reset email. */
export function resetPassword (email: string) {
  return graphql<{ resetPassword: boolean }>(
    `mutation($email: String!) {
      resetPassword(email: $email)
    }`,
    { email },
  )
}

/** Change the password for the current user. */
export function changePassword (oldPassword: string, newPassword: string) {
  const store = useAuthStore()
  return graphql<{ changePassword: boolean }>(
    `mutation($old: String!, $new: String!) {
      changePassword(oldPassword: $old, newPassword: $new)
    }`,
    { old: oldPassword, new: newPassword },
    store.token,
  )
}

/** Logout using the refresh token. */
export function logout (refreshToken: string) {
  return graphql<{ logout: boolean }>(
    `mutation($token: String!) { logout(refreshToken: $token) }`,
    { token: refreshToken },
  )
}

/** Refresh the access token using a refresh token. */
export function refresh (refreshToken: string) {
  return graphql<{ refreshToken: AuthPayload }>(
    `mutation($token: String!) {
      refreshToken(refreshToken: $token) {
        token
        refreshToken
        user { id email firstName lastName note }
      }
    }`,
    { token: refreshToken },
  )
}
