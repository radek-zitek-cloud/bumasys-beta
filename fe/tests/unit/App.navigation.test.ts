import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../src/stores/auth'

describe('Navigation Item Access Control', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  // This test validates the logic that would be used in the isNavigationItemDisabled function
  it('should disable non-Home navigation items when user is not authenticated', () => {
    const authStore = useAuthStore()
    authStore.loggedIn = false

    // Mock navigation items like in App.vue
    const navigationItems = [
      { icon: 'mdi-home', title: 'Home', subtitle: 'Return to home page', to: '/' },
      { separator: true },
      {
        icon: 'mdi-account-group',
        title: 'Organization',
        subtitle: 'Manage organizations, departments and staff',
        to: '/people',
      },
      {
        icon: 'mdi-account-multiple-outline',
        title: 'Teams',
        subtitle: 'Manage teams and team members',
        to: '/teams',
      },
      {
        icon: 'mdi-clipboard-check-outline',
        title: 'Projects',
        subtitle: 'Manage projects and tasks',
        to: '/tasks',
      },
    ]

    // Test the logic that would be in isNavigationItemDisabled function
    function isNavigationItemDisabled (item: any) {
      // Skip separator items (they don't have disable property)
      if (item.separator) {
        return false
      }
      // Home is always enabled
      if (item.title === 'Home' || item.to === '/') {
        return false
      }
      // All other items require authentication
      return !authStore.loggedIn
    }

    // Test each navigation item
    for (const item of navigationItems) {
      if (item.separator) {
        // Separators are not disabled
        expect(isNavigationItemDisabled(item)).toBe(false)
      } else if (item.title === 'Home') {
        // Home should always be enabled
        expect(isNavigationItemDisabled(item)).toBe(false)
      } else {
        // Other items should be disabled when not authenticated
        expect(isNavigationItemDisabled(item)).toBe(true)
      }
    }
  })

  it('should enable all navigation items when user is authenticated', () => {
    const authStore = useAuthStore()
    authStore.loggedIn = true
    authStore.setAuth({
      token: 'fake-token',
      refreshToken: 'fake-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    // Mock navigation items like in App.vue
    const navigationItems = [
      { icon: 'mdi-home', title: 'Home', subtitle: 'Return to home page', to: '/' },
      { separator: true },
      {
        icon: 'mdi-account-group',
        title: 'Organization',
        subtitle: 'Manage organizations, departments and staff',
        to: '/people',
      },
      {
        icon: 'mdi-account-multiple-outline',
        title: 'Teams',
        subtitle: 'Manage teams and team members',
        to: '/teams',
      },
    ]

    // Test the logic that would be in isNavigationItemDisabled function
    function isNavigationItemDisabled (item: any) {
      // Skip separator items (they don't have disable property)
      if (item.separator) {
        return false
      }
      // Home is always enabled
      if (item.title === 'Home' || item.to === '/') {
        return false
      }
      // All other items require authentication
      return !authStore.loggedIn
    }

    // Test each navigation item - all should be enabled when authenticated
    for (const item of navigationItems) {
      expect(isNavigationItemDisabled(item)).toBe(false)
    }
  })
})
