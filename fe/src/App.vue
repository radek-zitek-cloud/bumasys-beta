<template>
  <v-app>
    <v-app-bar :elevation="2">
      <template #prepend>
        <!-- Navigation drawer toggle -->
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      </template>
      <v-app-bar-title class="font-weight-black text-h4">Fulcrum</v-app-bar-title>
      <template #append>
        <v-btn
          :icon="themeIcon"
          :aria-label="`Switch to ${vuetifyTheme.global.current.value.dark ? 'light' : 'dark'} theme`"
          slim
          @click="toggleTheme"
        />
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" aria-label="User menu" />
          </template>
          <v-list density="compact">
            <template v-if="auth.loggedIn">
              <v-list-item title="Profile" prepend-icon="mdi-account" @click="showProfile = true" />
              <v-list-item title="Change Password" prepend-icon="mdi-key-change" @click="showChange = true" />
              <v-list-item title="Switch Database" prepend-icon="mdi-database" @click="showDatabaseSwitch = true" />
              <v-list-item title="Logout" prepend-icon="mdi-logout" @click="showLogout = true" />
            </template>
            <template v-else>
              <v-list-item title="Login" prepend-icon="mdi-login" @click="showLogin = true" />
              <v-list-item title="Register" prepend-icon="mdi-account-plus" @click="showRegister = true" />
              <v-list-item title="Password Reset" prepend-icon="mdi-key-remove" @click="showReset = true" />
            </template>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer 
      v-model="drawer" 
      :elevation="2" 
      location="left"
      aria-label="Main navigation"
    >
      <v-list density="compact" nav>
        <template v-for="(item, i) in navigationItems" :key="i">
          <v-divider v-if="item.separator" :thickness="3" />
          <v-list-item
            v-else
            :disabled="isNavigationItemDisabled(item)"
            link
            :prepend-icon="item.icon"
            :subtitle="item.subtitle"
            :title="item.title"
            :to="item.to"
            :aria-label="`Navigate to ${item.title}${item.subtitle ? ': ' + item.subtitle : ''}`"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>

    <AppFooter />

    <!-- Authentication dialogs positioned under the top-right navbar -->
    <v-dialog v-model="showLogin" max-width="400" persistent>
      <LoginCard @cancel="showLogin = false" @login="handleLogin" />
    </v-dialog>
    <v-dialog v-model="showRegister" max-width="400" persistent>
      <RegisterCard @cancel="showRegister = false" @register="handleRegister" />
    </v-dialog>
    <v-dialog v-model="showReset" max-width="400" persistent>
      <PasswordResetCard @cancel="showReset = false" @reset="handleReset" />
    </v-dialog>
    <v-dialog v-model="showChange" max-width="400" persistent>
      <ChangePasswordCard @cancel="showChange = false" @change="handleChange" />
    </v-dialog>
    <v-dialog v-model="showLogout" max-width="400" persistent>
      <LogoutCard @cancel="showLogout = false" @logout="handleLogout" />
    </v-dialog>
    <v-dialog v-model="showProfile" max-width="400" persistent>
      <ProfileCard @cancel="showProfile = false" @save="handleProfile" />
    </v-dialog>
    <v-dialog v-model="showDatabaseSwitch" max-width="500" persistent>
      <DatabaseTagSwitchCard @cancel="showDatabaseSwitch = false" @switch="handleDatabaseSwitch" />
    </v-dialog>
    
    <!-- Global notification system -->
    <NotificationContainer />
  </v-app>
</template>

<script lang="ts" setup>
/**
 * @fileoverview Main Application Component
 *
 * This is the root component that provides the main application layout including:
 * - Top navigation bar with theme toggle and user menu
 * - Side navigation drawer with main navigation items
 * - Main content area with router-view
 * - Authentication dialogs and notifications
 * - Footer component
 *
 * TODO: Consider extracting authentication logic into a composable
 * TODO: Add error boundary component for better error handling
 * TODO: Implement loading states for authentication operations
 * TODO: Add keyboard shortcuts for common actions
 * TODO: Consider implementing navigation breadcrumbs for complex workflows
 * TODO: Add aria-labels and improve accessibility for navigation items
 * TODO: Implement proper toast/notification management system
 */

  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import ChangePasswordCard from './components/auth/ChangePasswordCard.vue'
  import DatabaseTagSwitchCard from './components/auth/DatabaseTagSwitchCard.vue'
  import LoginCard from './components/auth/LoginCard.vue'
  import LogoutCard from './components/auth/LogoutCard.vue'
  import PasswordResetCard from './components/auth/PasswordResetCard.vue'
  import ProfileCard from './components/auth/ProfileCard.vue'
  import RegisterCard from './components/auth/RegisterCard.vue'
  import AppFooter from './components/common/AppFooter.vue'
  import NotificationContainer from './components/common/NotificationContainer.vue'
  import { useAuth } from './composables/useAuth'
  import { useLogger } from './composables/useLogger'
  import { useNotifications } from './composables/useNotifications'
  import { useAuthStore } from './stores/auth'

  /**
   * Interface for navigation items in the side drawer.
   * Supports both regular navigation items and separators.
   */
  interface NavigationItem {
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
  }

  /**
   * Interface for login credentials
   */
  interface LoginCredentials {
    email: string
    password: string
  }

  /**
   * Interface for registration data
   */
  interface RegistrationData {
    email: string
    password: string
    firstName?: string
    lastName?: string
    note?: string
  }

  /**
   * Interface for password change data
   */
  interface PasswordChangeData {
    oldPassword: string
    newPassword: string
  }

  /**
   * Interface for profile update data
   */
  interface ProfileUpdateData {
    firstName: string
    lastName: string
    note: string
  }

  const router = useRouter()
  const { logInfo, logError, logWarn } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()
  
  const { 
    login: loginUser, 
    register: registerUser, 
    logout: logoutUser, 
    changePassword: changeUserPassword,
    resetPassword: resetUserPassword,
    updateProfile: updateUserProfile 
  } = useAuth()

  /**
   * Reactive state for the navigation drawer.
   */
  const drawer = ref(true)

  /** Authentication store controlling login state. */
  const auth = useAuthStore()

  /** Dialog visibility flags for each action. */
  const showLogin = ref(false)
  const showRegister = ref(false)
  const showReset = ref(false)
  const showChange = ref(false)
  const showLogout = ref(false)
  const showProfile = ref(false)
  const showDatabaseSwitch = ref(false)

  /**
   * Access Vuetify's theme instance so we can switch between light and dark
   * modes.
   */
  const vuetifyTheme = useTheme()

  /**
   * Computed property for theme icon to improve performance
   */
  const themeIcon = computed(() => 
    vuetifyTheme.global.current.value.dark
      ? 'mdi-weather-night'
      : 'mdi-weather-sunny'
  )

  /**
   * Computed property for checking if any dialog is open
   */
  const hasOpenDialog = computed(() => 
    showLogin.value || showRegister.value || showReset.value || 
    showChange.value || showLogout.value || showProfile.value || 
    showDatabaseSwitch.value
  )

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme () {
    vuetifyTheme.global.name.value = vuetifyTheme.global.current.value.dark
      ? 'light'
      : 'dark'
  }

  /**
   * Determine if a navigation item should be disabled based on authentication state.
   * Home is always enabled, all other items require authentication.
   * @param item - The navigation item to check
   * @returns true if the item should be disabled
   */
  function isNavigationItemDisabled (item: NavigationItem): boolean {
    // Skip separator items (they don't have disable property)
    if (item.separator) {
      return false
    }
    // Home is always enabled
    if (item.title === 'Home' || item.to === '/') {
      return false
    }
    // All other items require authentication
    return !auth.loggedIn
  }

  /**
   * Navigation drawer items.
   * Each entry has a Material Design icon, a title, and a short description
   * shown as the subtitle. Separators are represented with `separator: true`.
   */
  const navigationItems: NavigationItem[] = [
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
    {
      icon: 'mdi-cash-multiple',
      title: 'Budget',
      subtitle: 'Manage budget',
      to: '/budget',
    },
    { separator: true },
    {
      icon: 'mdi-book-open-page-variant-outline',
      title: 'References',
      subtitle: 'Manage reference data',
      to: '/references',
    },
    {
      icon: 'mdi-account-cog-outline',
      title: 'Users',
      subtitle: 'Manage system users',
      to: '/users',
    },
    { separator: true },
    {
      icon: 'mdi-cog-outline',
      title: 'Administration',
      subtitle: 'System administration and configuration',
      to: '/admin',
    },
  ]

  /**
   * Handle login form submission via the useAuth composable.
   * Authenticates the user and updates the auth store on success.
   * @param payload - Login credentials containing email and password
   */
  async function handleLogin (payload: LoginCredentials) {
    try {
      logInfo('User attempting to login', { email: payload.email })
      await loginUser(payload)
      logInfo('User login completed successfully')
      // Navigate to home page after successful login
      router.push('/')
    } catch (error) {
      logError('User login failed', error)
      // Error notification is handled by the composable
    } finally {
      showLogin.value = false
    }
  }

  /**
   * Handle user registration form submission via the useAuth composable.
   * Creates a new user account and automatically logs them in on success.
   * @param payload - Registration data including email, password, and optional user details
   */
  async function handleRegister (payload: RegistrationData) {
    try {
      logInfo('User attempting to register', {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      })
      await registerUser(payload)
      logInfo('User registration completed successfully')
      // Navigate to home page after successful registration
      router.push('/')
    } catch (error) {
      logError('User registration failed', error)
      // Error notification is handled by the composable
    } finally {
      showRegister.value = false
    }
  }

  /**
   * Submit a password reset request via the useAuth composable.
   * Sends a password reset email to the specified address.
   * @param email - Email address to send the password reset link to
   */
  async function handleReset (email: string) {
    try {
      logInfo('User requesting password reset', { email })
      await resetUserPassword(email)
      logInfo('Password reset email sent successfully', { email })
    } catch (error) {
      logError('Password reset request failed', error)
      // Error notification is handled by the composable
    } finally {
      showReset.value = false
    }
  }

  /**
   * Change the authenticated user's password via the useAuth composable.
   * Requires the current password for security verification.
   * @param payload - Object containing old and new passwords
   */
  async function handleChange (payload: PasswordChangeData) {
    try {
      logInfo('User attempting password change')
      await changeUserPassword(payload)
      logInfo('User password change completed successfully')
    } catch (error) {
      logError('User password change failed', error)
      // Error notification is handled by the composable
    } finally {
      showChange.value = false
    }
  }

  /**
   * Handle user logout confirmation via the useAuth composable.
   * Clears authentication state and navigates to home page.
   * Attempts to notify the backend but continues logout even if that fails.
   */
  async function handleLogout () {
    try {
      logInfo('User attempting logout')
      await logoutUser()
      logInfo('User logout completed successfully')
      // Navigate to home page after logout
      router.push('/')
    } catch (error) {
      logWarn('Logout request failed, but continuing with local logout', error)
      // Error notification is handled by the composable
    } finally {
      showLogout.value = false
    }
  }

  /**
   * Save the user's profile changes via the useAuth composable.
   * Updates the current user's profile information and refreshes the auth store.
   * @param payload - Updated profile data containing firstName, lastName, and note
   */
  async function handleProfile (payload: ProfileUpdateData) {
    if (!auth.user) {
      logWarn('Profile update attempted but no authenticated user found')
      return
    }
    try {
      logInfo('User attempting profile update', {
        userId: auth.user.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
      })
      await updateUserProfile(payload)
      logInfo('User profile update completed successfully', { userId: auth.user.id })
    } catch (error) {
      logError('User profile update failed', error)
      // Error notification is handled by the composable
    } finally {
      showProfile.value = false
    }
  }

  /**
   * Handle database tag switch.
   * Switches the backend to use a different database tag for data isolation.
   * @param tag - The database tag to switch to
   */
  async function handleDatabaseSwitch (tag: string) {
    try {
      logInfo('Switching database tag', { tag })
      notifySuccess(`Successfully switched to database tag: ${tag}`)
      logInfo('Database tag switch completed successfully', { tag })
    } catch (error) {
      logError('Database tag switch failed', error)
      notifyError((error as Error).message)
    } finally {
      showDatabaseSwitch.value = false
    }
  }
</script>

<style>
/* Global fix for Vuetify dialog centering issues - only for dialogs, not menus */
.v-dialog .v-overlay__content {
  /* Ensure dialogs are properly centered horizontally */
  left: 50% !important;
  transform: translateX(-50%) translateY(-50%) !important;
  top: 50% !important;
  position: fixed !important;
}

/* Alternative approach - ensure the overlay container uses full viewport for dialogs */
.v-dialog .v-overlay__scrim {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}
</style>
