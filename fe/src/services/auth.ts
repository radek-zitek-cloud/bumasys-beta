import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'
import { logInfo, logError, logDebug, logWarn } from '../utils/logger'

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
export async function login (email: string, password: string) {
  try {
    logInfo('Attempting user login', { email })
    
    const result = await graphqlClient<{ login: AuthPayload }>(
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
    
    logInfo('User login successful', { 
      userId: result.login.user.id, 
      email: result.login.user.email 
    })
    
    return result
  } catch (error) {
    logError('User login failed', error)
    throw error
  }
}

/** Register a new account and return auth payload. */
export async function register (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  note?: string,
) {
  try {
    logInfo('Attempting user registration', { email, firstName, lastName })
    
    const result = await graphqlClient<{ register: AuthPayload }>(
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
    
    logInfo('User registration successful', { 
      userId: result.register.user.id, 
      email: result.register.user.email 
    })
    
    return result
  } catch (error) {
    logError('User registration failed', error)
    throw error
  }
}

/** Request password reset email. */
export async function resetPassword (email: string) {
  try {
    logInfo('Requesting password reset', { email })
    
    const result = await graphqlClient<{ resetPassword: boolean }>(
      `
        mutation ($email: String!) {
          resetPassword(email: $email)
        }
      `,
      { email },
    )
    
    logInfo('Password reset request completed', { email, success: result.resetPassword })
    
    return result
  } catch (error) {
    logError('Password reset request failed', error)
    throw error
  }
}

/** Change the password for the current user. */
export async function changePassword (oldPassword: string, newPassword: string) {
  try {
    const store = useAuthStore()
    logInfo('Attempting password change for authenticated user')
    
    const result = await graphqlClient<{ changePassword: boolean }>(
      `
        mutation ($old: String!, $new: String!) {
          changePassword(oldPassword: $old, newPassword: $new)
        }
      `,
      { old: oldPassword, new: newPassword },
      store.token,
    )
    
    logInfo('Password change completed', { success: result.changePassword })
    
    return result
  } catch (error) {
    logError('Password change failed', error)
    throw error
  }
}

/** Logout using the refresh token. */
export async function logout (refreshToken: string) {
  try {
    logInfo('Attempting user logout')
    
    const result = await graphqlClient<{ logout: boolean }>(
      `
        mutation ($token: String!) {
          logout(refreshToken: $token)
        }
      `,
      { token: refreshToken },
    )
    
    logInfo('User logout completed', { success: result.logout })
    
    return result
  } catch (error) {
    logWarn('User logout failed, but continuing with local logout', error)
    // Don't throw on logout failure as we still want to clear local state
    return { logout: false }
  }
}

/** Refresh the access token using a refresh token. */
export async function refresh (refreshToken: string) {
  try {
    logDebug('Attempting token refresh')
    
    const result = await graphqlClient<{ refreshToken: AuthPayload }>(
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
    
    logDebug('Token refresh successful', { 
      userId: result.refreshToken.user.id 
    })
    
    return result
  } catch (error) {
    logError('Token refresh failed', error)
    throw error
  }
}

/** Update the authenticated user's profile fields. */
export async function updateUser (
  id: string,
  firstName: string,
  lastName: string,
  note: string,
) {
  try {
    const store = useAuthStore()
    logInfo('Attempting user profile update', { userId: id, firstName, lastName })
    
    const result = await graphqlClient<{ updateUser: User }>(
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
    
    logInfo('User profile update successful', { 
      userId: result.updateUser.id,
      email: result.updateUser.email 
    })
    
    return result
  } catch (error) {
    logError('User profile update failed', error)
    throw error
  }
}
