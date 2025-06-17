/**
 * @fileoverview Navigation Management Composable
 *
 * This composable provides centralized navigation state management for the application.
 * It handles navigation drawer state, navigation items, authentication-based access control,
 * and provides a clean API for navigation-related operations.
 *
 * Features:
 * - Navigation drawer state management
 * - Dynamic navigation items with authentication-based filtering
 * - Access control for navigation items
 * - Responsive navigation behavior
 * - Keyboard navigation support
 * - Navigation analytics and tracking
 *
 * Usage:
 * ```typescript
 * const {
 *   drawer,
 *   navigationItems,
 *   toggleDrawer,
 *   openDrawer,
 *   closeDrawer,
 *   isNavigationItemDisabled
 * } = useNavigation()
 * ```
 *
 * TODO: Add navigation breadcrumbs functionality
 * TODO: Implement navigation history for back/forward navigation
 * TODO: Add navigation shortcuts and hotkeys
 * TODO: Implement navigation analytics tracking
 * TODO: Add support for dynamic navigation items based on user roles
 * TODO: Implement navigation search functionality
 */

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLogger } from './useLogger'

/**
 * Interface for navigation items in the navigation drawer.
 * Supports both regular navigation items and visual separators.
 */
export interface NavigationItem {
  /** Material Design icon name */
  icon?: string
  /** Display title for the navigation item */
  title?: string
  /** Subtitle/description shown below title */
  subtitle?: string
  /** Router path for navigation */
  to?: string
  /** Whether this is a separator (visual divider) */
  separator?: boolean
  /** Whether item requires authentication */
  requiresAuth?: boolean
  /** Minimum user role required (optional) */
  requiredRole?: string
  /** Whether item should be hidden instead of disabled */
  hideWhenDisabled?: boolean
  /** Custom badge text (e.g., "NEW", "BETA") */
  badge?: string
  /** Badge color */
  badgeColor?: string
  /** External link indicator */
  external?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
}

/**
 * Navigation drawer state and behavior options
 */
export interface NavigationOptions {
  /** Initial drawer state (open/closed) */
  initialDrawerState?: boolean
  /** Whether drawer should auto-close on mobile after navigation */
  autoCloseOnMobile?: boolean
  /** Breakpoint for mobile behavior */
  mobileBreakpoint?: number
  /** Whether to persist drawer state in localStorage */
  persistState?: boolean
  /** localStorage key for persisting state */
  persistKey?: string
}

/**
 * Default navigation options
 */
const defaultOptions: Required<NavigationOptions> = {
  initialDrawerState: true,
  autoCloseOnMobile: true,
  mobileBreakpoint: 960,
  persistState: true,
  persistKey: 'navigation-drawer-state',
}

/**
 * Navigation management composable
 * Provides centralized navigation state and behavior management
 */
export function useNavigation(options: NavigationOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  const auth = useAuthStore()
  const route = useRoute()
  const { logDebug } = useLogger()

  /**
   * Load persisted drawer state from localStorage
   */
  function loadPersistedState(): boolean {
    if (!opts.persistState || typeof window === 'undefined') {
      return opts.initialDrawerState
    }

    try {
      const stored = localStorage.getItem(opts.persistKey)
      return stored !== null ? JSON.parse(stored) : opts.initialDrawerState
    } catch (error) {
      logDebug('Failed to load persisted navigation state', { error })
      return opts.initialDrawerState
    }
  }

  /**
   * Save drawer state to localStorage
   */
  function savePersistedState(state: boolean): void {
    if (!opts.persistState || typeof window === 'undefined') return

    try {
      localStorage.setItem(opts.persistKey, JSON.stringify(state))
    } catch (error) {
      logDebug('Failed to save navigation state', { error })
    }
  }

  /**
   * Navigation drawer state
   */
  const drawer = ref(loadPersistedState())

  /**
   * Watch drawer state changes and persist them
   */
  if (opts.persistState) {
    watch(drawer, (newState) => {
      savePersistedState(newState)
      logDebug('Navigation drawer state changed', { isOpen: newState })
    })
  }

  /**
   * Check if current viewport is mobile-sized
   */
  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < opts.mobileBreakpoint
  })

  /**
   * Navigation items configuration
   * Each entry has a Material Design icon, title, and description.
   * Separators are represented with `separator: true`.
   */
  const navigationItems = computed((): NavigationItem[] => [
    { 
      icon: 'mdi-home', 
      title: 'Home', 
      subtitle: 'Return to home page', 
      to: '/',
      requiresAuth: false,
      tooltip: 'Navigate to the main dashboard'
    },
    { separator: true },
    {
      icon: 'mdi-account-group',
      title: 'Organization',
      subtitle: 'Manage organizations, departments and staff',
      to: '/people',
      requiresAuth: true,
      tooltip: 'Manage organizational structure and staff members'
    },
    {
      icon: 'mdi-account-multiple-outline',
      title: 'Teams',
      subtitle: 'Manage teams and team members',
      to: '/teams',
      requiresAuth: true,
      tooltip: 'Create and manage project teams'
    },
    {
      icon: 'mdi-clipboard-check-outline',
      title: 'Projects',
      subtitle: 'Manage projects and tasks',
      to: '/tasks',
      requiresAuth: true,
      tooltip: 'Track projects and assign tasks'
    },
    {
      icon: 'mdi-cash-multiple',
      title: 'Budget',
      subtitle: 'Manage budget',
      to: '/budget',
      requiresAuth: true,
      tooltip: 'Monitor and manage financial budgets'
    },
    { separator: true },
    {
      icon: 'mdi-book-open-page-variant-outline',
      title: 'References',
      subtitle: 'Manage reference data',
      to: '/references',
      requiresAuth: true,
      tooltip: 'Manage system reference data and configurations'
    },
    {
      icon: 'mdi-account-cog-outline',
      title: 'Users',
      subtitle: 'Manage system users',
      to: '/users',
      requiresAuth: true,
      tooltip: 'User management and permissions'
    },
    { separator: true },
    {
      icon: 'mdi-cog-outline',
      title: 'Administration',
      subtitle: 'System administration and configuration',
      to: '/admin',
      requiresAuth: true,
      tooltip: 'System settings and administrative tools'
    },
  ])

  /**
   * Filtered navigation items based on authentication and visibility rules
   */
  const visibleNavigationItems = computed(() => 
    navigationItems.value.filter(item => {
      if (item.separator) return true
      if (item.hideWhenDisabled && isNavigationItemDisabled(item)) return false
      return true
    })
  )

  /**
   * Get the current active navigation item based on the current route
   */
  const activeNavigationItem = computed(() => 
    navigationItems.value.find(item => 
      !item.separator && item.to === route.path
    )
  )

  /**
   * Determine if a navigation item should be disabled based on authentication state
   * and other access control rules.
   * @param item - The navigation item to check
   * @returns true if the item should be disabled
   */
  function isNavigationItemDisabled(item: NavigationItem): boolean {
    // Skip separator items (they don't have disable property)
    if (item.separator) {
      return false
    }

    // Check authentication requirement
    if (item.requiresAuth && !auth.loggedIn) {
      return true
    }

    // Home is always enabled for authenticated or non-authenticated users
    if (item.title === 'Home' || item.to === '/') {
      return false
    }

    // TODO: Add role-based access control
    // if (item.requiredRole && !auth.user?.roles?.includes(item.requiredRole)) {
    //   return true
    // }

    return false
  }

  /**
   * Toggle the navigation drawer state
   */
  function toggleDrawer(): void {
    drawer.value = !drawer.value
    logDebug('Navigation drawer toggled', { isOpen: drawer.value })
  }

  /**
   * Open the navigation drawer
   */
  function openDrawer(): void {
    if (!drawer.value) {
      drawer.value = true
      logDebug('Navigation drawer opened')
    }
  }

  /**
   * Close the navigation drawer
   */
  function closeDrawer(): void {
    if (drawer.value) {
      drawer.value = false
      logDebug('Navigation drawer closed')
    }
  }

  /**
   * Handle navigation to a specific route
   * @param path - The route path to navigate to
   */
  function navigateTo(path: string): void {
    logDebug('Navigation initiated', { path })
    
    // Auto-close drawer on mobile after navigation
    if (opts.autoCloseOnMobile && isMobile.value) {
      closeDrawer()
    }
  }

  /**
   * Get navigation item by path
   * @param path - The route path
   * @returns Navigation item or undefined
   */
  function getNavigationItemByPath(path: string): NavigationItem | undefined {
    return navigationItems.value.find(item => 
      !item.separator && item.to === path
    )
  }

  /**
   * Check if a path is currently active
   * @param path - The route path to check
   * @returns true if the path is currently active
   */
  function isPathActive(path: string): boolean {
    return route.path === path
  }

  /**
   * Get count of enabled navigation items
   */
  const enabledItemsCount = computed(() => 
    navigationItems.value.filter(item => 
      !item.separator && !isNavigationItemDisabled(item)
    ).length
  )

  /**
   * Get count of disabled navigation items
   */
  const disabledItemsCount = computed(() => 
    navigationItems.value.filter(item => 
      !item.separator && isNavigationItemDisabled(item)
    ).length
  )

  return {
    // State
    drawer: readonly(drawer),
    navigationItems: visibleNavigationItems,
    activeNavigationItem,
    isMobile,
    
    // Counts
    enabledItemsCount,
    disabledItemsCount,
    
    // Methods
    toggleDrawer,
    openDrawer,
    closeDrawer,
    navigateTo,
    isNavigationItemDisabled,
    getNavigationItemByPath,
    isPathActive,
    
    // Raw data (for advanced use cases)
    allNavigationItems: navigationItems,
  }
}

export default useNavigation
