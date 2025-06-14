import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

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
  return graphqlClient<{ login: AuthPayload }>(
    `
      mutation ($email: String!, $password: String!) {
        login(email: $email, password: $password) {
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
    { email, password },
  )
}

/** Register a new account and return auth payload. */
export function register (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  note?: string,
) {
  return graphqlClient<{ register: AuthPayload }>(
    `
      mutation (
        $email: String!
        $password: String!
        $firstName: String
        $lastName: String
        $note: String
      ) {
        register(
          email: $email
          password: $password
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
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
    { email, password, firstName, lastName, note },
  )
}

/** Request password reset email. */
export function resetPassword (email: string) {
  return graphqlClient<{ resetPassword: boolean }>(
    `
      mutation ($email: String!) {
        resetPassword(email: $email)
      }
    `,
    { email },
  )
}

/** Change the password for the current user. */
export function changePassword (oldPassword: string, newPassword: string) {
  const store = useAuthStore()
  return graphqlClient<{ changePassword: boolean }>(
    `
      mutation ($old: String!, $new: String!) {
        changePassword(oldPassword: $old, newPassword: $new)
      }
    `,
    { old: oldPassword, new: newPassword },
    store.token,
  )
}

/** Logout using the refresh token. */
export function logout (refreshToken: string) {
  return graphqlClient<{ logout: boolean }>(
    `
      mutation ($token: String!) {
        logout(refreshToken: $token)
      }
    `,
    { token: refreshToken },
  )
}

/** Refresh the access token using a refresh token. */
export function refresh (refreshToken: string) {
  return graphqlClient<{ refreshToken: AuthPayload }>(
    `
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
    { token: refreshToken },
  )
}

/** Update the authenticated user's profile fields. */
export function updateUser (
  id: string,
  firstName: string,
  lastName: string,
  note: string,
) {
  const store = useAuthStore()
  return graphqlClient<{ updateUser: User }>(
    `
      mutation (
        $id: ID!
        $firstName: String
        $lastName: String
        $note: String
      ) {
        updateUser(
          id: $id
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    { id, firstName, lastName, note },
    store.token,
  )
}
