/**
 * @fileoverview Notifications composable
 *
 * Provides centralized notification management using Vuetify's snackbar component.
 * Handles success, error, warning, and info notifications with consistent styling.
 */

import { reactive } from 'vue'

export interface NotificationState {
  show: boolean
  message: string
  color: 'success' | 'error' | 'warning' | 'info'
}

/**
 * Composable for managing application notifications
 *
 * @returns Object containing snackbar state and helper functions
 *
 * @example
 * ```typescript
 * const notifications = useNotifications()
 *
 * // Show success message
 * notifications.showSuccess('Operation completed successfully')
 *
 * // Show error message
 * notifications.showError('Something went wrong')
 * ```
 */
export function useNotifications () {
  const snackbar = reactive<NotificationState>({
    show: false,
    message: '',
    color: 'success',
  })

  /**
   * Show a notification with custom message and color
   */
  function showNotification (message: string, color: NotificationState['color'] = 'success') {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  /**
   * Show a success notification
   */
  function showSuccess (message: string) {
    showNotification(message, 'success')
  }

  /**
   * Show an error notification
   */
  function showError (message: string) {
    showNotification(message, 'error')
  }

  /**
   * Show a warning notification
   */
  function showWarning (message: string) {
    showNotification(message, 'warning')
  }

  /**
   * Show an info notification
   */
  function showInfo (message: string) {
    showNotification(message, 'info')
  }

  /**
   * Hide the current notification
   */
  function hideNotification () {
    snackbar.show = false
  }

  return {
    snackbar,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  }
}
