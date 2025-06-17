<template>
  <v-app>
    <v-app-bar :elevation="2">
      <template #prepend>
        <!-- Navigation drawer toggle -->
        <v-app-bar-nav-icon @click.stop="toggleDrawer" />
      </template>
      <v-app-bar-title class="font-weight-black text-h4">Fulcrum</v-app-bar-title>
      <template #append>
        <v-btn
          :aria-label="`Switch to ${vuetifyTheme.global.current.value.dark ? 'light' : 'dark'} theme`"
          :icon="themeIcon"
          slim
          @click="toggleTheme"
        />
        <v-menu :disabled="isAuthLoading" location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              aria-label="User menu"
              :disabled="isAuthLoading"
              icon="mdi-dots-vertical"
            />
          </template>
          <v-list density="compact">
            <template v-if="auth.loggedIn">
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-account"
                title="Profile"
                @click="openDialog('profile')"
              />
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-key-change"
                title="Change Password"
                @click="openDialog('change')"
              />
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-database"
                title="Switch Database"
                @click="openDialog('databaseSwitch')"
              />
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-logout"
                title="Logout"
                @click="openDialog('logout')"
              />
            </template>
            <template v-else>
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-login"
                title="Login"
                @click="openDialog('login')"
              />
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-account-plus"
                title="Register"
                @click="openDialog('register')"
              />
              <v-list-item
                :disabled="isAuthLoading"
                prepend-icon="mdi-key-remove"
                title="Password Reset"
                @click="openDialog('reset')"
              />
            </template>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      aria-label="Main navigation"
      :elevation="2"
      location="left"
    >
      <v-list density="compact" nav>
        <template v-for="(item, i) in navigationItems" :key="i">
          <v-divider v-if="item.separator" :thickness="3" />
          <v-list-item
            v-else
            :aria-label="`Navigate to ${item.title}${item.subtitle ? ': ' + item.subtitle : ''}`"
            :disabled="isNavigationItemDisabled(item)"
            link
            :prepend-icon="item.icon"
            :subtitle="item.subtitle"
            :title="item.title"
            :to="item.to"
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
    <v-dialog v-model="dialogs.login.isOpen" max-width="400" persistent>
      <LoginCard
        :loading="loginLoading"
        @cancel="closeDialog('login')"
        @login="handleLogin"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.register.isOpen" max-width="400" persistent>
      <RegisterCard
        :loading="registerLoading"
        @cancel="closeDialog('register')"
        @register="handleRegister"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.reset.isOpen" max-width="400" persistent>
      <PasswordResetCard
        :loading="resetPasswordLoading"
        @cancel="closeDialog('reset')"
        @reset="handleReset"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.change.isOpen" max-width="400" persistent>
      <ChangePasswordCard
        :loading="changePasswordLoading"
        @cancel="closeDialog('change')"
        @change="handleChange"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.logout.isOpen" max-width="400" persistent>
      <LogoutCard
        :loading="logoutLoading"
        @cancel="closeDialog('logout')"
        @logout="handleLogout"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.profile.isOpen" max-width="400" persistent>
      <ProfileCard
        :loading="updateProfileLoading"
        @cancel="closeDialog('profile')"
        @save="handleProfile"
      />
    </v-dialog>
    <v-dialog v-model="dialogs.databaseSwitch.isOpen" max-width="500" persistent>
      <DatabaseTagSwitchCard @cancel="closeDialog('databaseSwitch')" @switch="handleDatabaseSwitch" />
    </v-dialog>

    <!-- Global notification system -->
    <NotificationContainer />

    <!-- Global loading overlay for authentication operations -->
    <v-overlay
      v-model="isAuthLoading"
      class="align-center justify-center"
      contained
      :persistent="true"
      :opacity="0.8"
    >
      <v-card class="pa-8 text-center" elevation="8" rounded="lg">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
          width="4"
        />
        <div class="text-h6 mt-4 mb-2">
          {{ authLoadingMessage }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Please wait...
        </div>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
/**
 * @fileoverview Main Application Component
 *
 * This is the root component that provides the main application layout including:
 * - Top navigation bar with theme toggle and user menu
 * - Side navigation drawer with main navigation items (managed by useNavigation composable)
 * - Main content area with router-view
 * - Authentication dialogs with loading states and notifications (managed by useDialogManager composable)
 * - Footer component
 * - Global loading overlay for authentication operations with enhanced UX
 * - Keyboard shortcuts for common actions (Ctrl+L, Ctrl+T, Ctrl+D, Escape)
 *
 * The navigation logic has been extracted to the useNavigation composable for better
 * separation of concerns and reusability. All navigation state management, items
 * configuration, and access control is handled by the composable.
 *
 * The dialog management has been consolidated into the useDialogManager composable
 * for better state management, type safety, and consistent behavior across all dialogs.
 *
 * Loading states are implemented for all authentication operations to provide
 * proper user feedback and prevent multiple simultaneous operations.
 *
 * Type definitions have been moved to shared types files to reduce duplication
 * and improve maintainability across the application.
 *
 * Keyboard shortcuts:
 * - Ctrl/Cmd + L: Open login dialog (when not logged in)
 * - Ctrl/Cmd + Shift + L: Open logout dialog (when logged in)
 * - Ctrl/Cmd + D: Toggle navigation drawer
 * - Ctrl/Cmd + T: Toggle theme
 * - Escape: Close active dialog
 *
 * TODO: Add error boundary component for better error handling
 * TODO: Consider implementing navigation breadcrumbs for complex workflows
 */

  import { computed, onMounted, onUnmounted } from 'vue'
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
  import { useDialogManager } from './composables/useDialogManager'
  import { useLogger } from './composables/useLogger'
  import { useNavigation } from './composables/useNavigation'
  import { useNotifications } from './composables/useNotifications'
  import { useAuthStore } from './stores/auth'
  import type { LoginCredentials, RegistrationData, PasswordChangeData, ProfileUpdateData } from './types/auth'

  const { logInfo, logError, logWarn } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()

  // Navigation management
  const {
    drawer,
    navigationItems,
    toggleDrawer,
    isNavigationItemDisabled,
  } = useNavigation()

  const {
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    changePassword: changeUserPassword,
    resetPassword: resetUserPassword,
    updateProfile: updateUserProfile,
    // Loading states
    loginLoading,
    registerLoading,
    changePasswordLoading,
    resetPasswordLoading,
    updateProfileLoading,
    logoutLoading,
  } = useAuth()

  // Dialog management
  const {
    dialogs,
    openDialog,
    closeDialog,
    hasOpenDialog,
  } = useDialogManager()

  /** Authentication store controlling login state. */
  const auth = useAuthStore()

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
      : 'mdi-weather-sunny',
  )

  /**
   * Computed property to check if any authentication operation is in progress
   */
  const isAuthLoading = computed(() =>
    loginLoading.value
    || registerLoading.value
    || changePasswordLoading.value
    || resetPasswordLoading.value
    || updateProfileLoading.value
    || logoutLoading.value,
  )

  /**
   * Computed property for authentication loading message
   */
  const authLoadingMessage = computed(() => {
    if (loginLoading.value) return 'Logging in'
    if (registerLoading.value) return 'Creating account'
    if (logoutLoading.value) return 'Logging out'
    if (changePasswordLoading.value) return 'Changing password'
    if (resetPasswordLoading.value) return 'Sending password reset'
    if (updateProfileLoading.value) return 'Updating profile'
    return 'Processing'
  })

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme () {
    vuetifyTheme.global.name.value = vuetifyTheme.global.current.value.dark
      ? 'light'
      : 'dark'
  }

  /**
   * Handle login form submission via the useAuth composable.
   * Authenticates the user and updates the auth store on success.
   * The loading state is managed by the useAuth composable.
   * @param payload - Login credentials containing email and password
   */
  async function handleLogin (payload: LoginCredentials) {
    try {
      logInfo('User attempting to login', { email: payload.email })
      await loginUser(payload)
      logInfo('User login completed successfully')
      // Navigation is handled by the composable
    } catch (error) {
      logError('User login failed', error)
      // Error notification is handled by the composable
    } finally {
      // Only close dialog if operation is complete (not loading)
      if (!loginLoading.value) {
        closeDialog('login')
      }
    }
  }

  /**
   * Handle user registration form submission via the useAuth composable.
   * Creates a new user account and automatically logs them in on success.
   * The loading state is managed by the useAuth composable.
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
      // Navigation is handled by the composable
    } catch (error) {
      logError('User registration failed', error)
      // Error notification is handled by the composable
    } finally {
      // Only close dialog if operation is complete (not loading)
      if (!registerLoading.value) {
        closeDialog('register')
      }
    }
  }

  /**
   * Submit a password reset request via the useAuth composable.
   * Sends a password reset email to the specified address.
   * The loading state is managed by the useAuth composable.
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
      // Only close dialog if operation is complete (not loading)
      if (!resetPasswordLoading.value) {
        closeDialog('reset')
      }
    }
  }

  /**
   * Change the authenticated user's password via the useAuth composable.
   * Requires the current password for security verification.
   * The loading state is managed by the useAuth composable.
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
      // Only close dialog if operation is complete (not loading)
      if (!changePasswordLoading.value) {
        closeDialog('change')
      }
    }
  }

  /**
   * Handle user logout confirmation via the useAuth composable.
   * Clears authentication state and navigates to home page.
   * The loading state is managed by the useAuth composable.
   * Attempts to notify the backend but continues logout even if that fails.
   */
  async function handleLogout () {
    try {
      logInfo('User attempting logout')
      await logoutUser()
      logInfo('User logout completed successfully')
      // Navigation is handled by the composable
    } catch (error) {
      logWarn('Logout request failed, but continuing with local logout', error)
      // Error notification is handled by the composable
    } finally {
      // Only close dialog if operation is complete (not loading)
      if (!logoutLoading.value) {
        closeDialog('logout')
      }
    }
  }

  /**
   * Save the user's profile changes via the useAuth composable.
   * Updates the current user's profile information and refreshes the auth store.
   * The loading state is managed by the useAuth composable.
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
      // Only close dialog if operation is complete (not loading)
      if (!updateProfileLoading.value) {
        closeDialog('profile')
      }
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
      closeDialog('databaseSwitch')
    }
  }

  // Keyboard shortcuts
  onMounted(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Only handle shortcuts when no dialogs are open to avoid conflicts
      if (hasOpenDialog.value) return
      
      // Ctrl/Cmd + L for Login (when not logged in)
      if ((event.ctrlKey || event.metaKey) && event.key === 'l' && !auth.loggedIn) {
        event.preventDefault()
        openDialog('login')
        return
      }
      
      // Ctrl/Cmd + Shift + L for Logout (when logged in)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L' && auth.loggedIn) {
        event.preventDefault()
        openDialog('logout')
        return
      }
      
      // Ctrl/Cmd + D for drawer toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault()
        toggleDrawer()
        return
      }
      
      // Ctrl/Cmd + T for theme toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault()
        toggleTheme()
        return
      }
      
      // Escape to close any open dialog
      if (event.key === 'Escape' && hasOpenDialog.value) {
        // Get the active dialog and close it
        const activeDialogType = Object.entries(dialogs).find(([, config]) => config.isOpen)?.[0]
        if (activeDialogType) {
          closeDialog(activeDialogType as any)
        }
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    
    // Cleanup on unmount
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    })
  })
</script>

<style>
/**
 * Global dialog positioning and overlay styles
 * Ensures proper centering and viewport handling for all dialogs
 */

/* Dialog content positioning - ensures proper centering */
.v-dialog .v-overlay__content {
  left: 50% !important;
  top: 50% !important;
  transform: translateX(-50%) translateY(-50%) !important;
  position: fixed !important;
}

/* Dialog overlay - ensures full viewport coverage */
.v-dialog .v-overlay__scrim {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

/* Loading overlay improvements */
.v-overlay .v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
}

/* Focus management for accessibility */
.v-dialog:focus-within {
  outline: none;
}

/* Responsive adjustments for mobile */
@media (max-width: 600px) {
  .v-dialog .v-overlay__content {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}
</style>
