/**
 * @fileoverview Authentication Composable
 *
 * This composable provides a centralized way to handle authentication operations
 * including login, registration, password management, and user profile updates.
 * It encapsulates error handling and success notifications for authentication flows.
 *
 * Usage:
 * ```typescript
 * const { login, register, logout, changePassword, resetPassword, updateProfile } = useAuth()
 *
 * // Login example
 * await login({ email: 'user@example.com', password: 'password123' })
 * ```
 *
 * Features:
 * - Consistent error handling across all auth operations
 * - Success/error notifications with customizable messages
 * - Automatic navigation on successful login/registration
 * - Loading states for UI feedback
 * - Type-safe interfaces for all operations
 *
 * TODO: Add retry logic for failed authentication attempts
 * TODO: Implement automatic token refresh handling
 * TODO: Add biometric authentication support
 * TODO: Implement remember me functionality
 * TODO: Add session timeout warnings
 */

import { readonly, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as authApi from '../services/auth'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from './useNotifications'

/**
 * Authentication composable for handling all auth-related operations
 * @returns Object containing authentication methods and loading states
 */
export function useAuth () {
  const router = useRouter()
  const auth = useAuthStore()
  const { notifySuccess, notifyError } = useNotifications()

  // Loading states for different operations
  const loginLoading = ref(false)
  const registerLoading = ref(false)
  const changePasswordLoading = ref(false)
  const resetPasswordLoading = ref(false)
  const updateProfileLoading = ref(false)
  const logoutLoading = ref(false)

  /**
   * Handle user login with email and password
   * @param credentials - Login credentials
   */
  async function login (credentials: { email: string, password: string }) {
    loginLoading.value = true
    try {
      const { login: loginResponse } = await authApi.login(credentials.email, credentials.password)
      auth.setAuth(loginResponse)
      notifySuccess('Login successful')
      await router.push('/')
      return loginResponse
    } catch (error) {
      console.error('Login error:', error)
      notifyError((error as Error).message)
      throw error
    } finally {
      loginLoading.value = false
    }
  }

  /**
   * Handle user registration
   * @param userData - Registration data
   */
  async function register (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    note?: string
  }) {
    registerLoading.value = true
    try {
      const { register: registerResponse } = await authApi.register(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.note,
      )
      auth.setAuth(registerResponse)
      notifySuccess('Registration successful')
      await router.push('/')
      return registerResponse
    } catch (error) {
      console.error('Registration error:', error)
      notifyError((error as Error).message)
      throw error
    } finally {
      registerLoading.value = false
    }
  }

  /**
   * Handle password reset request
   * @param email - Email address for password reset
   */
  async function resetPassword (email: string) {
    resetPasswordLoading.value = true
    try {
      await authApi.resetPassword(email)
      notifySuccess('Password reset email sent')
    } catch (error) {
      console.error('Password reset error:', error)
      notifyError((error as Error).message)
      throw error
    } finally {
      resetPasswordLoading.value = false
    }
  }

  /**
   * Handle password change for authenticated user
   * @param passwords - Old and new passwords
   */
  async function changePassword (passwords: { oldPassword: string, newPassword: string }) {
    changePasswordLoading.value = true
    try {
      await authApi.changePassword(passwords.oldPassword, passwords.newPassword)
      notifySuccess('Password changed successfully')
    } catch (error) {
      console.error('Change password error:', error)
      notifyError((error as Error).message)
      throw error
    } finally {
      changePasswordLoading.value = false
    }
  }

  /**
   * Handle user logout
   */
  async function logout () {
    logoutLoading.value = true
    try {
      if (auth.refreshToken) {
        await authApi.logout(auth.refreshToken)
      }
      notifySuccess('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      notifyError((error as Error).message)
    } finally {
      auth.clearAuth()
      logoutLoading.value = false
      await router.push('/')
    }
  }

  /**
   * Handle user profile updates
   * @param profileData - Updated profile information
   */
  async function updateProfile (profileData: {
    firstName: string
    lastName: string
    note: string
  }) {
    if (!auth.user) {
      throw new Error('No authenticated user found')
    }

    updateProfileLoading.value = true
    try {
      const { updateUser } = await authApi.updateUser(
        auth.user.id,
        profileData.firstName,
        profileData.lastName,
        profileData.note,
      )
      auth.user = updateUser
      notifySuccess('Profile updated successfully')
      return updateUser
    } catch (error) {
      console.error('Profile update error:', error)
      notifyError((error as Error).message)
      throw error
    } finally {
      updateProfileLoading.value = false
    }
  }

  return {
    // Methods
    login,
    register,
    resetPassword,
    changePassword,
    logout,
    updateProfile,

    // Loading states
    loginLoading: readonly(loginLoading),
    registerLoading: readonly(registerLoading),
    changePasswordLoading: readonly(changePasswordLoading),
    resetPasswordLoading: readonly(resetPasswordLoading),
    updateProfileLoading: readonly(updateProfileLoading),
    logoutLoading: readonly(logoutLoading),
  }
}
