/**
 * @fileoverview User Management Composable
 *
 * This composable provides reusable user management functionality that can be
 * shared across components. It encapsulates common patterns for CRUD operations,
 * loading states, error handling, and user feedback.
 *
 * Features:
 * - Complete CRUD operations with consistent error handling
 * - Loading state management for operations
 * - Integrated logging and notifications
 * - Type-safe interfaces
 * - Reusable across multiple components
 *
 * Usage:
 * ```typescript
 * const {
 *   users,
 *   loading,
 *   processing,
 *   loadUsers,
 *   createUser,
 *   updateUser,
 *   deleteUser
 * } = useUserManagement()
 *
 * // Load users
 * await loadUsers()
 *
 * // Create user
 * await createUser({ email: 'user@example.com', password: 'password' })
 * ```
 *
 * TODO: Add user search and filtering functionality
 * TODO: Implement pagination support
 * TODO: Add bulk operations support
 * TODO: Implement user role management
 * TODO: Add user activity tracking
 */

import type { CreateUserInput, UpdateUserInput, User } from '../services/users'
import { readonly, ref } from 'vue'
import * as userService from '../services/users'
import { useLogger } from './useLogger'
import { useNotifications } from './useNotifications'

/**
 * User management composable
 * @returns User management utilities and state
 */
export function useUserManagement () {
  const { logInfo, logError } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()

  // State management
  const users = ref<User[]>([])
  const loading = ref(false)
  const processing = ref(false)

  /**
   * Load all users from the API
   * @returns Promise that resolves when users are loaded
   */
  const loadUsers = async (): Promise<void> => {
    try {
      loading.value = true
      logInfo('Loading users from API')
      const response = await userService.getUsers()
      users.value = response.users
      logInfo('Successfully loaded users', { count: response.users.length })
    } catch (error) {
      logError('Failed to load users', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to load users',
      )
      throw error // Re-throw to allow component to handle if needed
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Promise that resolves when user is created
   */
  const createUser = async (userData: CreateUserInput): Promise<void> => {
    try {
      processing.value = true
      logInfo('Creating new user', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      await userService.createUser(userData)
      notifySuccess('User created successfully')
      logInfo('User created successfully', { email: userData.email })
      await loadUsers() // Refresh the list
    } catch (error) {
      logError('Failed to create user', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to create user',
      )
      throw error
    } finally {
      processing.value = false
    }
  }

  /**
   * Update an existing user
   * @param userData - User update data
   * @returns Promise that resolves when user is updated
   */
  const updateUser = async (userData: UpdateUserInput): Promise<void> => {
    try {
      processing.value = true
      logInfo('Updating user', { id: userData.id, email: userData.email })
      await userService.updateUser(userData)
      notifySuccess('User updated successfully')
      logInfo('User updated successfully', { id: userData.id })
      await loadUsers() // Refresh the list
    } catch (error) {
      logError('Failed to update user', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update user',
      )
      throw error
    } finally {
      processing.value = false
    }
  }

  /**
   * Delete a user by ID
   * @param userId - ID of the user to delete
   * @param userEmail - Email of the user for logging (optional)
   * @returns Promise that resolves when user is deleted
   */
  const deleteUser = async (userId: string, userEmail?: string): Promise<void> => {
    try {
      processing.value = true
      logInfo('Deleting user', { id: userId, email: userEmail })
      await userService.deleteUser(userId)
      notifySuccess('User deleted successfully')
      logInfo('User deleted successfully', { id: userId })
      await loadUsers() // Refresh the list
    } catch (error) {
      logError('Failed to delete user', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to delete user',
      )
      throw error
    } finally {
      processing.value = false
    }
  }

  /**
   * Get user by ID
   * @param userId - ID of the user to find
   * @returns User object or undefined if not found
   */
  const getUserById = (userId: string): User | undefined => {
    return users.value.find(user => user.id === userId)
  }

  /**
   * Get full name for a user
   * @param user - User object
   * @returns Formatted full name
   */
  const getFullName = (user: User): string => {
    const firstName = user.firstName?.trim() || ''
    const lastName = user.lastName?.trim() || ''
    return [firstName, lastName].filter(Boolean).join(' ')
  }

  return {
    // State
    users: readonly(users),
    loading: readonly(loading),
    processing: readonly(processing),

    // Operations
    loadUsers,
    createUser,
    updateUser,
    deleteUser,

    // Utilities
    getUserById,
    getFullName,
  }
}
