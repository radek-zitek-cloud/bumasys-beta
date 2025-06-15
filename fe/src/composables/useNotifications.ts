/**
 * @fileoverview Notification Management Composable
 * 
 * This composable provides a centralized notification system for the application.
 * It manages toast notifications, snackbars, and alert messages with consistent
 * styling and behavior across all components.
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Queue management for multiple notifications
 * - Auto-dismiss with configurable timeouts
 * - Persistent notifications that require user dismissal
 * - Action buttons in notifications
 * - Undo functionality
 * - Notification history
 * 
 * Usage:
 * ```typescript
 * const { notify, notifySuccess, notifyError, clearAll } = useNotifications()
 * 
 * // Basic notifications
 * notifySuccess('Operation completed successfully')
 * notifyError('Something went wrong')
 * 
 * // Advanced notifications
 * notify({
 *   type: 'warning',
 *   title: 'Warning',
 *   message: 'This action cannot be undone',
 *   persistent: true,
 *   actions: [
 *     { label: 'Continue', action: () => proceed() },
 *     { label: 'Cancel', action: () => cancel() }
 *   ]
 * })
 * ```
 * 
 * TODO: Add notification positioning options
 * TODO: Implement notification grouping by category
 * TODO: Add sound notifications for important alerts
 * TODO: Create notification templates for common scenarios
 * TODO: Add integration with browser notifications API
 * TODO: Implement notification rate limiting
 */

import { ref, reactive, computed, readonly } from 'vue'

/**
 * Notification type enumeration
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * Notification action interface
 */
export interface NotificationAction {
  /** Action button label */
  label: string
  /** Action button click handler */
  action: () => void | Promise<void>
  /** Button color (optional) */
  color?: string
  /** Whether button should be outlined */
  outlined?: boolean
}

/**
 * Notification configuration interface
 */
export interface NotificationConfig {
  /** Notification type */
  type: NotificationType
  /** Notification title (optional) */
  title?: string
  /** Notification message */
  message: string
  /** Whether notification persists until manually dismissed */
  persistent?: boolean
  /** Auto-dismiss timeout in milliseconds */
  timeout?: number
  /** Action buttons */
  actions?: NotificationAction[]
  /** Whether to show close button */
  closable?: boolean
  /** Custom icon */
  icon?: string
  /** Notification priority (higher numbers show first) */
  priority?: number
}

/**
 * Internal notification interface with additional properties
 */
interface Notification extends NotificationConfig {
  /** Unique notification ID */
  id: string
  /** Creation timestamp */
  timestamp: number
  /** Whether notification is currently visible */
  visible: boolean
  /** Timeout handle for auto-dismiss */
  timeoutHandle?: number
}

/**
 * Global notification state
 */
const notifications = reactive<Notification[]>([])
const notificationHistory = reactive<Notification[]>([])

/**
 * Notification counter for unique IDs
 */
let notificationCounter = 0

/**
 * Default notification configuration
 */
const defaultConfig: Partial<NotificationConfig> = {
  persistent: false,
  timeout: 4000,
  closable: true,
  priority: 0,
}

/**
 * Type-specific default configurations
 */
const typeDefaults: Record<NotificationType, Partial<NotificationConfig>> = {
  success: {
    icon: 'mdi-check-circle',
    timeout: 3000,
  },
  error: {
    icon: 'mdi-alert-circle',
    persistent: true,
  },
  warning: {
    icon: 'mdi-alert',
    timeout: 5000,
  },
  info: {
    icon: 'mdi-information',
    timeout: 4000,
  },
}

/**
 * Notification management composable
 */
export function useNotifications() {
  /**
   * Add a new notification
   * @param config - Notification configuration
   * @returns Notification ID
   */
  const notify = (config: NotificationConfig | string): string => {
    // Handle simple string messages
    const notificationConfig: NotificationConfig = 
      typeof config === 'string' 
        ? { type: 'info', message: config }
        : config

    // Merge with defaults
    const finalConfig = {
      ...defaultConfig,
      ...typeDefaults[notificationConfig.type],
      ...notificationConfig,
    }

    // Create notification
    const notification: Notification = {
      ...finalConfig,
      id: `notification-${++notificationCounter}`,
      timestamp: Date.now(),
      visible: true,
    }

    // Add to notifications list (sorted by priority)
    const insertIndex = notifications.findIndex(n => n.priority! < notification.priority!)
    if (insertIndex === -1) {
      notifications.push(notification)
    } else {
      notifications.splice(insertIndex, 0, notification)
    }

    // Add to history
    notificationHistory.push({ ...notification })

    // Set up auto-dismiss
    if (!notification.persistent && notification.timeout! > 0) {
      notification.timeoutHandle = setTimeout(() => {
        dismiss(notification.id)
      }, notification.timeout!)
    }

    return notification.id
  }

  /**
   * Dismiss a notification by ID
   * @param id - Notification ID
   */
  const dismiss = (id: string) => {
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      const notification = notifications[index]
      
      // Clear timeout if exists
      if (notification.timeoutHandle) {
        clearTimeout(notification.timeoutHandle)
      }
      
      // Remove from active notifications
      notifications.splice(index, 1)
    }
  }

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    // Clear all timeouts
    notifications.forEach(notification => {
      if (notification.timeoutHandle) {
        clearTimeout(notification.timeoutHandle)
      }
    })
    
    // Clear notifications array
    notifications.splice(0, notifications.length)
  }

  /**
   * Success notification shorthand
   * @param message - Success message
   * @param options - Additional options
   */
  const notifySuccess = (message: string, options?: Partial<NotificationConfig>) => {
    return notify({
      type: 'success',
      message,
      ...options,
    })
  }

  /**
   * Error notification shorthand
   * @param message - Error message
   * @param options - Additional options
   */
  const notifyError = (message: string, options?: Partial<NotificationConfig>) => {
    return notify({
      type: 'error',
      message,
      ...options,
    })
  }

  /**
   * Warning notification shorthand
   * @param message - Warning message
   * @param options - Additional options
   */
  const notifyWarning = (message: string, options?: Partial<NotificationConfig>) => {
    return notify({
      type: 'warning',
      message,
      ...options,
    })
  }

  /**
   * Info notification shorthand
   * @param message - Info message
   * @param options - Additional options
   */
  const notifyInfo = (message: string, options?: Partial<NotificationConfig>) => {
    return notify({
      type: 'info',
      message,
      ...options,
    })
  }

  /**
   * Create a notification with undo functionality
   * @param message - Action message
   * @param undoAction - Undo function
   * @param options - Additional options
   */
  const notifyWithUndo = (
    message: string,
    undoAction: () => void | Promise<void>,
    options?: Partial<NotificationConfig>
  ) => {
    return notify({
      type: 'success',
      message,
      timeout: 5000,
      actions: [
        {
          label: 'Undo',
          action: undoAction,
          outlined: true,
        },
      ],
      ...options,
    })
  }

  /**
   * Get visible notifications count
   */
  const visibleCount = computed(() => notifications.length)

  /**
   * Get notifications by type
   */
  const getNotificationsByType = (type: NotificationType) => {
    return notifications.filter(n => n.type === type)
  }

  /**
   * Check if there are any error notifications
   */
  const hasErrors = computed(() => notifications.some(n => n.type === 'error'))

  /**
   * Check if there are any warning notifications
   */
  const hasWarnings = computed(() => notifications.some(n => n.type === 'warning'))

  /**
   * Get recent notifications from history
   * @param limit - Maximum number of notifications to return
   */
  const getRecentNotifications = (limit = 10) => {
    return notificationHistory
      .slice(-limit)
      .reverse()
  }

  /**
   * Clear notification history
   */
  const clearHistory = () => {
    notificationHistory.splice(0, notificationHistory.length)
  }

  return {
    // Core functionality
    notify,
    dismiss,
    clearAll,
    
    // Shorthand methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyWithUndo,
    
    // State
    notifications: readonly(notifications) as readonly Notification[],
    notificationHistory: readonly(notificationHistory) as readonly Notification[],
    visibleCount,
    hasErrors,
    hasWarnings,
    
    // Utility methods
    getNotificationsByType,
    getRecentNotifications,
    clearHistory,
  }
}

export default useNotifications