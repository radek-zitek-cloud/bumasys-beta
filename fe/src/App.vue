<template>
  <v-app>
    <v-app-bar :elevation="2">
      <template #prepend>
        <!-- Navigation drawer toggle -->
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      </template>
      <v-app-bar-title class="font-weight-black text-h4">Fulcrum</v-app-bar-title>
      <template #append>
        <v-btn :icon="vuetifyTheme.global.current.value.dark
            ? 'mdi-weather-night'
            : 'mdi-weather-sunny'
          " slim @click="toggleTheme" />
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" />
          </template>
          <v-list density="compact">
            <template v-if="auth.loggedIn">
              <v-list-item title="Profile" @click="showProfile = true" />
              <v-list-item title="Change Password" @click="showChange = true" />
              <v-list-item title="Debug Info" @click="showDebugInfo = true" />
              <v-list-item title="BE Config" @click="showConfig = true" />
              <v-list-item title="Logout" @click="showLogout = true" />
            </template>
            <template v-else>
              <v-list-item title="Login" @click="showLogin = true" />
              <v-list-item title="Register" @click="showRegister = true" />
              <v-list-item title="Password Reset" @click="showReset = true" />
            </template>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :elevation="2" location="left">
      <v-list density="compact">
        <template v-for="(item, i) in navigationItems" :key="i">
          <v-divider v-if="item.separator" :thickness="3" />
          <v-list-item v-else :disabled="isNavigationItemDisabled(item)" link :prepend-icon="item.icon"
            :subtitle="item.subtitle" :title="item.title" :to="item.to" />
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
    <v-dialog v-model="showDebugInfo" max-width="600" persistent>
      <DebugInfoCard @close="showDebugInfo = false" />
    </v-dialog>
    <v-dialog v-model="showConfig" max-width="600" persistent>
      <ConfigDisplayCard @close="showConfig = false" />
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="snackbarColor" location="bottom" timeout="4000">
      {{ snackbarMessage }}
    </v-snackbar>
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

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import AppFooter from './components/AppFooter.vue'
import ChangePasswordCard from './components/ChangePasswordCard.vue'
import ConfigDisplayCard from './components/ConfigDisplayCard.vue'
import DebugInfoCard from './components/DebugInfoCard.vue'
import LoginCard from './components/LoginCard.vue'
import LogoutCard from './components/LogoutCard.vue'
import PasswordResetCard from './components/PasswordResetCard.vue'
import ProfileCard from './components/ProfileCard.vue'
import RegisterCard from './components/RegisterCard.vue'
import { useLogger } from './composables/useLogger'
import * as authApi from './services/auth'
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

const router = useRouter()
const { logInfo, logError, logWarn } = useLogger()
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

/**
 * Display a notification message to the user.
 * @param message - The message to display
 * @param success - Whether this is a success (true) or error (false) message
 */
function notify(message: string, success = true) {
  logInfo('Showing notification to user', { message, success })
  snackbarMessage.value = message
  snackbarColor.value = success ? 'success' : 'error'
  snackbar.value = true
}

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
const showDebugInfo = ref(false)
const showConfig = ref(false)

/**
 * Access Vuetify's theme instance so we can switch between light and dark
 * modes.
 */
const vuetifyTheme = useTheme()

/**
 * Toggle between light and dark themes.
 */
function toggleTheme() {
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
function isNavigationItemDisabled(item: NavigationItem): boolean {
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
]

/**
 * Handle login form submission via the GraphQL API.
 * Authenticates the user and updates the auth store on success.
 * @param payload - Login credentials containing email and password
 */
async function handleLogin(payload: { email: string, password: string }) {
  try {
    logInfo('User attempting to login', { email: payload.email })
    const { login } = await authApi.login(payload.email, payload.password)
    auth.setAuth(login)
    notify('Login successful')
    logInfo('User login completed successfully', { userId: login.user.id })
    // Navigate to home page after successful login
    router.push('/')
  } catch (error) {
    logError('User login failed', error)
    notify((error as Error).message, false)
  } finally {
    showLogin.value = false
  }
}

/**
 * Handle user registration form submission via the GraphQL API.
 * Creates a new user account and automatically logs them in on success.
 * @param payload - Registration data including email, password, and optional user details
 */
async function handleRegister(payload: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  note?: string
}) {
  try {
    logInfo('User attempting to register', {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    })
    const { register } = await authApi.register(
      payload.email,
      payload.password,
      payload.firstName,
      payload.lastName,
      payload.note,
    )
    auth.setAuth(register)
    notify('Registration successful')
    logInfo('User registration completed successfully', { userId: register.user.id })
    // Navigate to home page after successful registration
    router.push('/')
  } catch (error) {
    logError('User registration failed', error)
    notify((error as Error).message, false)
  } finally {
    showRegister.value = false
  }
}

/**
 * Submit a password reset request
 * Sends a password reset email to the specified address.
 * @param email - Email address to send the password reset link to
 */
async function handleReset(email: string) {
  try {
    logInfo('User requesting password reset', { email })
    await authApi.resetPassword(email)
    notify('Password reset email sent')
    logInfo('Password reset email sent successfully', { email })
  } catch (error) {
    logError('Password reset request failed', error)
    notify((error as Error).message, false)
  } finally {
    showReset.value = false
  }
}

/**
 * Change the authenticated user's password.
 * Requires the current password for security verification.
 * @param payload - Object containing old and new passwords
 */
async function handleChange(payload: {
  oldPassword: string
  newPassword: string
}) {
  try {
    logInfo('User attempting password change')
    await authApi.changePassword(payload.oldPassword, payload.newPassword)
    notify('Password changed')
    logInfo('User password change completed successfully')
  } catch (error) {
    logError('User password change failed', error)
    notify((error as Error).message, false)
  } finally {
    showChange.value = false
  }
}

/**
 * Handle user logout confirmation.
 * Clears authentication state and navigates to home page.
 * Attempts to notify the backend but continues logout even if that fails.
 */
async function handleLogout() {
  try {
    logInfo('User attempting logout')
    if (auth.refreshToken) await authApi.logout(auth.refreshToken)
    notify('Logged out')
    logInfo('User logout completed successfully')
  } catch (error) {
    logWarn('Logout request failed, but continuing with local logout', error)
    notify((error as Error).message, false)
  } finally {
    auth.clearAuth()
    showLogout.value = false
    // Navigate to home page after logout
    router.push('/')
  }
}

/**
 * Save the user's profile changes via the GraphQL API.
 * Updates the current user's profile information and refreshes the auth store.
 * @param payload - Updated profile data containing firstName, lastName, and note
 */
async function handleProfile(payload: {
  firstName: string
  lastName: string
  note: string
}) {
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
    const { updateUser } = await authApi.updateUser(
      auth.user.id,
      payload.firstName,
      payload.lastName,
      payload.note,
    )
    auth.user = updateUser
    notify('Profile updated')
    logInfo('User profile update completed successfully', { userId: updateUser.id })
  } catch (error) {
    logError('User profile update failed', error)
    notify((error as Error).message, false)
  } finally {
    showProfile.value = false
  }
}
</script>

<style>
/* Global fix for Vuetify dialog centering issues */
.v-overlay__content {
  /* Ensure dialogs are properly centered horizontally */
  left: 50% !important;
  transform: translateX(-50%) translateY(-50%) !important;
  top: 50% !important;
  position: fixed !important;
}

/* Alternative approach - ensure the overlay container uses full viewport */
.v-overlay__scrim {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}
</style>
