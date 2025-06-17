/**
 * @fileoverview User Management Dialog Manager
 *
 * This composable provides centralized dialog state management specifically for
 * user management operations. It follows the same patterns as the main dialog
 * manager but is tailored for CRUD operations on users.
 *
 * Features:
 * - Type-safe user dialog management
 * - Selected user state management
 * - Consistent dialog behavior
 * - Integration with user operations
 * - Loading state management during dialog operations
 * - Notification feedback for user actions
 * - Comprehensive logging for debugging and analytics
 * - Error handling with proper user feedback
 * - Operation success/failure handling
 *
 * Usage:
 * ```typescript
 * const {
 *   dialogs,
 *   selectedUser,
 *   dialogLoading,
 *   openCreateDialog,
 *   openEditDialog,
 *   openViewDialog,
 *   openDeleteDialog,
 *   closeDialog,
 *   hasOpenDialog,
 *   handleDialogSuccess,
 *   handleDialogError
 * } = useUserDialogManager({
 *   enableNotifications: true,
 *   enableLogging: true,
 *   loadingNamespace: 'userDialogs'
 * })
 *
 * // Open dialogs
 * openCreateDialog()
 * openEditDialog(user)
 *
 * // Handle operation results
 * try {
 *   await createUser(userData)
 *   handleDialogSuccess('create', 'create')
 * } catch (error) {
 *   handleDialogError('create', 'create', error)
 * }
 * ```
 */

import type { User } from '../services/users'
import { computed, reactive, readonly, ref } from 'vue'
import { useLoading } from './useLoading'
import { useLogger } from './useLogger'
import { useNotifications } from './useNotifications'

/**
 * Available user dialog types
 */
export type UserDialogType = 'create' | 'edit' | 'view' | 'delete'

/**
 * User dialog configuration interface
 */
export interface UserDialogConfig {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Maximum width for the dialog */
  maxWidth: string | number
  /** Whether the dialog is persistent */
  persistent: boolean
}

/**
 * User dialog manager options
 */
export interface UserDialogManagerOptions {
  /** Whether only one dialog can be open at a time */
  singleDialogMode?: boolean
  /** Whether to log dialog operations */
  enableLogging?: boolean
  /** Whether to show notifications for dialog operations */
  enableNotifications?: boolean
  /** Namespace for loading states (for useLoading) */
  loadingNamespace?: string
}

/**
 * Default dialog configurations for user management
 */
const defaultUserDialogConfigs: Record<UserDialogType, Omit<UserDialogConfig, 'isOpen'>> = {
  create: { maxWidth: 600, persistent: true },
  edit: { maxWidth: 600, persistent: true },
  view: { maxWidth: 500, persistent: true },
  delete: { maxWidth: 400, persistent: true },
}

/**
 * Default options for user dialog manager
 */
const defaultOptions: Required<UserDialogManagerOptions> = {
  singleDialogMode: true,
  enableLogging: true,
  enableNotifications: true,
  loadingNamespace: 'userDialogs',
}

/**
 * User dialog management composable
 * Provides centralized dialog state management for user CRUD operations
 */
export function useUserDialogManager (options: UserDialogManagerOptions = {}) {
  const opts = { ...defaultOptions, ...options }

  // Integrate other composables for consistent behavior
  const { logDebug, logInfo, logWarn } = useLogger()
  const { loading: dialogLoading, setLoading } = useLoading(opts.loadingNamespace)
  const { notifySuccess, notifyInfo } = useNotifications()

  /**
   * Initialize user dialog states
   */
  function initializeDialogs (): Record<UserDialogType, UserDialogConfig> {
    const dialogStates: Record<UserDialogType, UserDialogConfig> = {} as Record<UserDialogType, UserDialogConfig>

    for (const [type, config] of Object.entries(defaultUserDialogConfigs)) {
      dialogStates[type as UserDialogType] = {
        isOpen: false,
        ...config,
      }
    }

    return dialogStates
  }

  // State management
  const dialogs = reactive<Record<UserDialogType, UserDialogConfig>>(initializeDialogs())
  const selectedUser = ref<User | null>(null)

  /**
   * Computed property to check if any dialog is open
   */
  const hasOpenDialog = computed(() =>
    Object.values(dialogs).some(dialog => dialog.isOpen),
  )

  /**
   * Computed property to get the currently active dialog
   */
  const activeDialog = computed((): UserDialogType | null => {
    const openDialog = Object.entries(dialogs).find(([, config]) => config.isOpen)
    return openDialog ? (openDialog[0] as UserDialogType) : null
  })

  /**
   * Open a specific dialog with loading state and notifications
   * @param dialogType - The type of dialog to open
   * @param user - Optional user to select (for edit, view, delete operations)
   */
  function openDialog (dialogType: UserDialogType, user?: User): void {
    try {
      // Show loading state briefly for visual feedback
      setLoading(true)

      // Close other dialogs if in single dialog mode
      if (opts.singleDialogMode && hasOpenDialog.value) {
        closeAllDialogs()
      }

      // Set selected user if provided
      if (user) {
        selectedUser.value = user
      } else if (dialogType === 'create') {
        selectedUser.value = null // Clear for create operation
      }

      dialogs[dialogType].isOpen = true

      if (opts.enableLogging) {
        logDebug('User dialog opened', {
          dialogType,
          userId: user?.id,
          userEmail: user?.email,
        })
      }

      // Optional notification for dialog opening (can be disabled via options)
      if (opts.enableNotifications && dialogType !== 'view') {
        const actionMessages = {
          create: 'Ready to create new user',
          edit: `Editing user: ${user?.email || 'Unknown'}`,
          delete: `Preparing to delete user: ${user?.email || 'Unknown'}`,
        }

        if (actionMessages[dialogType]) {
          notifyInfo(actionMessages[dialogType], { timeout: 2000 })
        }
      }
    } catch (error) {
      if (opts.enableLogging) {
        logWarn('Failed to open user dialog', { dialogType, error })
      }
    } finally {
      // Clear loading state after dialog setup
      setTimeout(() => setLoading(false), 200)
    }
  }

  /**
   * Close a specific dialog with proper cleanup and feedback
   * @param dialogType - The type of dialog to close
   * @param reason - Optional reason for closing (for logging)
   */
  function closeDialog (dialogType: UserDialogType, reason = 'user_action'): void {
    if (dialogs[dialogType].isOpen) {
      dialogs[dialogType].isOpen = false

      // Clear selected user when closing dialogs that require it
      if (['edit', 'view', 'delete'].includes(dialogType)) {
        selectedUser.value = null
      }

      if (opts.enableLogging) {
        logDebug('User dialog closed', { dialogType, reason })
      }

      // Optional success notification for completed operations
      if (opts.enableNotifications && reason === 'operation_completed') {
        const successMessages = {
          create: 'User creation dialog closed',
          edit: 'User edit dialog closed',
          delete: 'User deletion dialog closed',
          view: 'User view dialog closed',
        }

        if (successMessages[dialogType]) {
          notifySuccess(successMessages[dialogType], { timeout: 1500 })
        }
      }
    }
  }

  /**
   * Close all open dialogs with batch cleanup
   * @param reason - Optional reason for closing all dialogs
   */
  function closeAllDialogs (reason = 'user_action'): void {
    const openDialogs: UserDialogType[] = []

    for (const [type, config] of Object.entries(dialogs)) {
      if (config.isOpen) {
        config.isOpen = false
        openDialogs.push(type as UserDialogType)
      }
    }

    // Clear selected user when closing all dialogs
    selectedUser.value = null

    if (opts.enableLogging && openDialogs.length > 0) {
      logDebug('All user dialogs closed', { closedDialogs: openDialogs, reason })
    }

    // Notify about batch closure if multiple dialogs were open
    if (opts.enableNotifications && openDialogs.length > 1) {
      notifyInfo(`Closed ${openDialogs.length} open dialogs`, { timeout: 2000 })
    }
  }

  /**
   * Specific dialog opening methods for better type safety and convenience
   */
  function openCreateDialog (): void {
    openDialog('create')
    if (opts.enableLogging) {
      logInfo('Opening user creation dialog')
    }
  }

  function openEditDialog (user: User): void {
    if (!user?.id) {
      if (opts.enableLogging) {
        logWarn('Attempted to open edit dialog without valid user', { user })
      }
      return
    }

    openDialog('edit', user)
    if (opts.enableLogging) {
      logInfo('Opening user edit dialog', { userId: user.id, email: user.email })
    }
  }

  function openViewDialog (user: User): void {
    if (!user?.id) {
      if (opts.enableLogging) {
        logWarn('Attempted to open view dialog without valid user', { user })
      }
      return
    }

    openDialog('view', user)
    if (opts.enableLogging) {
      logInfo('Opening user view dialog', { userId: user.id, email: user.email })
    }
  }

  function openDeleteDialog (user: User): void {
    if (!user?.id) {
      if (opts.enableLogging) {
        logWarn('Attempted to open delete dialog without valid user', { user })
      }
      return
    }

    openDialog('delete', user)
    if (opts.enableLogging) {
      logInfo('Opening user delete dialog', { userId: user.id, email: user.email })
    }
  }

  /**
   * Check if a specific dialog is open
   * @param dialogType - The type of dialog to check
   */
  function isDialogOpen (dialogType: UserDialogType): boolean {
    return dialogs[dialogType]?.isOpen ?? false
  }

  /**
   * Handle successful dialog operations (e.g., after create/edit/delete)
   * This method provides consistent feedback and cleanup
   * @param dialogType - The type of dialog that completed an operation
   * @param operationType - The type of operation that was completed
   */
  function handleDialogSuccess (dialogType: UserDialogType, operationType: 'create' | 'update' | 'delete'): void {
    closeDialog(dialogType, 'operation_completed')

    if (opts.enableNotifications) {
      const successMessages = {
        create: 'User created successfully',
        update: 'User updated successfully',
        delete: 'User deleted successfully',
      }

      notifySuccess(successMessages[operationType], { timeout: 3000 })
    }

    if (opts.enableLogging) {
      logInfo(`User ${operationType} operation completed successfully`, {
        dialogType,
        operationType,
        userId: selectedUser.value?.id,
      })
    }
  }

  /**
   * Handle dialog operation errors
   * @param dialogType - The type of dialog where the error occurred
   * @param operationType - The type of operation that failed
   * @param error - The error that occurred
   */
  function handleDialogError (
    dialogType: UserDialogType,
    operationType: 'create' | 'update' | 'delete',
    error: Error,
  ): void {
    if (opts.enableLogging) {
      logWarn(`User ${operationType} operation failed`, {
        dialogType,
        operationType,
        userId: selectedUser.value?.id,
        error: error.message,
      })
    }

    // Note: We don't close the dialog on error to allow user to retry
    // The specific dialog component should handle error display
  }

  return {
    // State
    dialogs: readonly(dialogs),
    selectedUser: readonly(selectedUser),
    hasOpenDialog,
    activeDialog,
    dialogLoading: readonly(dialogLoading),

    // Generic methods
    openDialog,
    closeDialog,
    closeAllDialogs,
    isDialogOpen,

    // Specific dialog methods
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,

    // Operation handlers
    handleDialogSuccess,
    handleDialogError,

    // Utilities
    options: readonly(opts),
  }
}

export default useUserDialogManager
