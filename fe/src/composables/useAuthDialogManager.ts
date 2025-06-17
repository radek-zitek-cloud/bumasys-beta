/**
 * @fileoverview Authentication Dialog Management Composable
 *
 * This composable provides centralized dialog state management for authentication and application-level dialogs.
 * It consolidates authentication flow dialogs and app-level system dialogs into a single, well-organized state manager
 * that ensures consistent behavior and provides a clean API for auth dialog operations.
 *
 * Features:
 * - Centralized authentication dialog state management
 * - Type-safe auth dialog names and operations
 * - Single dialog open policy (optional)
 * - Bulk dialog operations
 * - Dialog state persistence (optional)
 * - Event-driven dialog management
 * - Loading state integration
 *
 * Usage:
 * ```typescript
 * const {
 *   dialogs,
 *   openDialog,
 *   closeDialog,
 *   closeAllDialogs,
 *   hasOpenDialog,
 *   activeDialog
 * } = useAuthDialogManager()
 *
 * // Open a specific authentication dialog
 * openDialog('login')
 *
 * // Close a specific dialog
 * closeDialog('login')
 *
 * // Check if any auth dialog is open
 * if (hasOpenDialog.value) {
 *   // Handle open dialog state
 * }
 * ```
 *
 * TODO: Add dialog state persistence for user preferences
 * TODO: Implement dialog stacking/queue management for complex workflows
 * TODO: Add dialog transition animations configuration
 * TODO: Implement dialog analytics tracking
 * TODO: Add dialog accessibility enhancements (focus management, keyboard navigation)
 */

import { computed, reactive, readonly, watch } from 'vue'
import { useLogger } from './useLogger'

/**
 * Available authentication dialog types in the application
 */
export type AuthDialogType =
  | 'login'
  | 'register'
  | 'reset'
  | 'change'
  | 'logout'
  | 'profile'
  | 'databaseSwitch'

/**
 * Dialog configuration interface
 */
export interface DialogConfig {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Maximum width for the dialog */
  maxWidth?: string | number
  /** Whether the dialog is persistent (cannot be closed by clicking outside) */
  persistent?: boolean
  /** Custom dialog props */
  props?: Record<string, any>
}

/**
 * Dialog manager options
 */
export interface AuthDialogManagerOptions {
  /** Whether only one dialog can be open at a time */
  singleDialogMode?: boolean
  /** Whether to persist dialog state in localStorage */
  persistState?: boolean
  /** localStorage key for persisting state */
  persistKey?: string
  /** Whether to log dialog operations for debugging */
  enableLogging?: boolean
}

/**
 * Default dialog configurations
 */
const defaultDialogConfigs: Record<AuthDialogType, Omit<DialogConfig, 'isOpen'>> = {
  login: { maxWidth: 400, persistent: true },
  register: { maxWidth: 400, persistent: true },
  reset: { maxWidth: 400, persistent: true },
  change: { maxWidth: 400, persistent: true },
  logout: { maxWidth: 400, persistent: true },
  profile: { maxWidth: 400, persistent: true },
  databaseSwitch: { maxWidth: 500, persistent: true },
}

/**
 * Default options for authentication dialog manager
 */
const defaultOptions: Required<AuthDialogManagerOptions> = {
  singleDialogMode: true,
  persistState: false,
  persistKey: 'dialog-manager-state',
  enableLogging: true,
}

/**
 * Authentication dialog management composable
 * Provides centralized dialog state management with type safety and consistent behavior
 */
export function useAuthDialogManager (options: AuthDialogManagerOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  const { logDebug, logWarn } = useLogger()

  /**
   * Initialize dialog states
   */
  function initializeDialogs (): Record<AuthDialogType, DialogConfig> {
    const dialogStates: Record<AuthDialogType, DialogConfig> = {} as Record<AuthDialogType, DialogConfig>

    for (const [type, config] of Object.entries(defaultDialogConfigs)) {
      dialogStates[type as AuthDialogType] = {
        isOpen: false,
        ...config,
      }
    }

    return dialogStates
  }

  /**
   * Load persisted dialog state from localStorage
   */
  function loadPersistedState (): Record<AuthDialogType, DialogConfig> {
    if (!opts.persistState || typeof window === 'undefined') {
      return initializeDialogs()
    }

    try {
      const stored = localStorage.getItem(opts.persistKey)
      if (stored) {
        const persistedState = JSON.parse(stored)
        const initializedDialogs = initializeDialogs()

        // Merge persisted state with default configs, but don't persist open states
        for (const [type, config] of Object.entries(persistedState)) {
          if (initializedDialogs[type as AuthDialogType] && config && typeof config === 'object') {
            initializedDialogs[type as AuthDialogType] = {
              ...initializedDialogs[type as AuthDialogType],
              ...(config as Partial<DialogConfig>),
              isOpen: false, // Never persist open state for security
            }
          }
        }

        return initializedDialogs
      }
    } catch (error) {
      if (opts.enableLogging) {
        logWarn('Failed to load persisted dialog state', { error })
      }
    }

    return initializeDialogs()
  }

  /**
   * Save dialog state to localStorage
   */
  function savePersistedState (): void {
    if (!opts.persistState || typeof window === 'undefined') {
      return
    }

    try {
      // Don't persist open states for security reasons
      const stateToSave: Record<string, Omit<DialogConfig, 'isOpen'>> = {}
      for (const [type, config] of Object.entries(dialogs)) {
        stateToSave[type] = {
          maxWidth: config.maxWidth,
          persistent: config.persistent,
          props: config.props,
        }
      }
      localStorage.setItem(opts.persistKey, JSON.stringify(stateToSave))
    } catch (error) {
      if (opts.enableLogging) {
        logWarn('Failed to save dialog state', { error })
      }
    }
  }

  /**
   * Reactive dialog states
   */
  const dialogs = reactive<Record<AuthDialogType, DialogConfig>>(loadPersistedState())

  /**
   * Watch for changes and persist state if enabled
   */
  if (opts.persistState) {
    watch(dialogs, () => {
      savePersistedState()
    }, { deep: true })
  }

  /**
   * Computed property to check if any dialog is open
   */
  const hasOpenDialog = computed(() =>
    Object.values(dialogs).some(dialog => dialog.isOpen),
  )

  /**
   * Computed property to get the currently active dialog
   */
  const activeDialog = computed((): AuthDialogType | null => {
    const openDialog = Object.entries(dialogs).find(([, config]) => config.isOpen)
    return openDialog ? (openDialog[0] as AuthDialogType) : null
  })

  /**
   * Computed property to get count of open dialogs
   */
  const openDialogCount = computed(() =>
    Object.values(dialogs).filter(dialog => dialog.isOpen).length,
  )

  /**
   * Open a specific authentication dialog
   * @param dialogType - The type of dialog to open
   * @param config - Optional configuration overrides
   */
  function openDialog (dialogType: AuthDialogType, config?: Partial<DialogConfig>): void {
    if (!dialogs[dialogType]) {
      if (opts.enableLogging) {
        logWarn('Attempted to open unknown dialog type', { dialogType })
      }
      return
    }

    // Close other dialogs if in single dialog mode
    if (opts.singleDialogMode && hasOpenDialog.value) {
      closeAllDialogs()
    }

    // Apply configuration overrides
    if (config) {
      Object.assign(dialogs[dialogType], config)
    }

    dialogs[dialogType].isOpen = true

    if (opts.enableLogging) {
      logDebug('Dialog opened', {
        dialogType,
        singleDialogMode: opts.singleDialogMode,
        totalOpen: openDialogCount.value,
      })
    }
  }

  /**
   * Close a specific dialog
   * @param dialogType - The type of dialog to close
   */
  function closeDialog (dialogType: AuthDialogType): void {
    if (!dialogs[dialogType]) {
      if (opts.enableLogging) {
        logWarn('Attempted to close unknown dialog type', { dialogType })
      }
      return
    }

    if (dialogs[dialogType].isOpen) {
      dialogs[dialogType].isOpen = false

      if (opts.enableLogging) {
        logDebug('Dialog closed', {
          dialogType,
          remainingOpen: openDialogCount.value,
        })
      }
    }
  }

  /**
   * Close all open dialogs
   */
  function closeAllDialogs (): void {
    const openDialogs: AuthDialogType[] = []

    for (const [type, config] of Object.entries(dialogs)) {
      if (config.isOpen) {
        config.isOpen = false
        openDialogs.push(type as AuthDialogType)
      }
    }

    if (opts.enableLogging && openDialogs.length > 0) {
      logDebug('All dialogs closed', { closedDialogs: openDialogs })
    }
  }

  /**
   * Toggle a dialog's open state
   * @param dialogType - The type of dialog to toggle
   */
  function toggleDialog (dialogType: AuthDialogType): void {
    if (dialogs[dialogType].isOpen) {
      closeDialog(dialogType)
    } else {
      openDialog(dialogType)
    }
  }

  /**
   * Check if a specific dialog is open
   * @param dialogType - The type of dialog to check
   */
  function isDialogOpen (dialogType: AuthDialogType): boolean {
    return dialogs[dialogType]?.isOpen ?? false
  }

  /**
   * Update dialog configuration
   * @param dialogType - The type of dialog to update
   * @param config - Configuration updates
   */
  function updateDialogConfig (dialogType: AuthDialogType, config: Partial<DialogConfig>): void {
    if (!dialogs[dialogType]) {
      if (opts.enableLogging) {
        logWarn('Attempted to update unknown dialog type', { dialogType })
      }
      return
    }

    Object.assign(dialogs[dialogType], config)

    if (opts.enableLogging) {
      logDebug('Dialog configuration updated', { dialogType, config })
    }
  }

  /**
   * Get dialog configuration
   * @param dialogType - The type of dialog to get config for
   */
  function getDialogConfig (dialogType: AuthDialogType): DialogConfig | null {
    return dialogs[dialogType] || null
  }

  /**
   * Reset all dialogs to default state
   */
  function resetDialogs (): void {
    const initialDialogs = initializeDialogs()

    for (const [type, config] of Object.entries(initialDialogs)) {
      dialogs[type as AuthDialogType] = config
    }

    if (opts.enableLogging) {
      logDebug('All dialogs reset to default state')
    }
  }

  return {
    // State
    dialogs: readonly(dialogs),
    hasOpenDialog,
    activeDialog,
    openDialogCount,

    // Methods
    openDialog,
    closeDialog,
    closeAllDialogs,
    toggleDialog,
    isDialogOpen,
    updateDialogConfig,
    getDialogConfig,
    resetDialogs,

    // Utilities
    options: readonly(opts),
  }
}

export default useAuthDialogManager
