<template>
  <v-responsive class="border rounded">
    <v-app>
      <v-app-bar :elevation="2">
        <template #prepend>
          <!-- Navigation drawer toggle -->
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        </template>
        <v-app-bar-title class="font-weight-black text-h4">Fulcrum</v-app-bar-title>
        <template #append>
          <v-btn
            :icon="
              vuetifyTheme.global.current.value.dark
                ? 'mdi-weather-night'
                : 'mdi-weather-sunny'
            "
            slim
            @click="toggleTheme"
          />
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" />
            </template>
            <v-list density="compact">
              <template v-if="auth.loggedIn">
                <v-list-item title="Profile" @click="showProfile = true" />
                <v-list-item
                  title="Change Password"
                  @click="showChange = true"
                />
                <v-list-item title="Debug Info" @click="showDebugInfo = true" />
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
            <v-list-item
              v-else
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
      <v-dialog v-model="showLogin" max-width="400" persistent>
        <LoginCard @cancel="showLogin = false" @login="handleLogin" />
      </v-dialog>
      <v-dialog v-model="showRegister" max-width="400" persistent>
        <RegisterCard
          @cancel="showRegister = false"
          @register="handleRegister"
        />
      </v-dialog>
      <v-dialog v-model="showReset" max-width="400" persistent>
        <PasswordResetCard @cancel="showReset = false" @reset="handleReset" />
      </v-dialog>
      <v-dialog v-model="showChange" max-width="400" persistent>
        <ChangePasswordCard
          @cancel="showChange = false"
          @change="handleChange"
        />
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
      <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        location="bottom"
        timeout="4000"
      >
        {{ snackbarMessage }}
      </v-snackbar>
    </v-app>
  </v-responsive>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useTheme } from 'vuetify'
  import AppFooter from './components/AppFooter.vue'
  import ChangePasswordCard from './components/ChangePasswordCard.vue'
  import DebugInfoCard from './components/DebugInfoCard.vue'
  import LoginCard from './components/LoginCard.vue'
  import LogoutCard from './components/LogoutCard.vue'
  import PasswordResetCard from './components/PasswordResetCard.vue'
  import ProfileCard from './components/ProfileCard.vue'
  import RegisterCard from './components/RegisterCard.vue'
  import * as authApi from './services/auth'
  import { useAuthStore } from './stores/auth'

  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref<'success' | 'error'>('success')

  function notify (message: string, success = true) {
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

  /**
   * Access Vuetify's theme instance so we can switch between light and dark
   * modes.
   */
  const vuetifyTheme = useTheme()

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme () {
    vuetifyTheme.global.name.value = vuetifyTheme.global.current.value.dark
      ? 'light'
      : 'dark'
  }

  /**
   * Navigation drawer items.
   * Each entry has a Material Design icon, a title, and a short description
   * shown as the subtitle. Separators are represented with `separator: true`.
   */
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

  /** Handle login form submission via the GraphQL API. */
  async function handleLogin (payload: { email: string, password: string }) {
    try {
      const { login } = await authApi.login(payload.email, payload.password)
      auth.setAuth(login)
      notify('Login successful')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      showLogin.value = false
    }
  }

  /** Handle register form submission via the GraphQL API. */
  async function handleRegister (payload: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    note?: string
  }) {
    try {
      const { register } = await authApi.register(
        payload.email,
        payload.password,
        payload.firstName,
        payload.lastName,
        payload.note,
      )
      auth.setAuth(register)
      notify('Registration successful')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      showRegister.value = false
    }
  }

  /** Submit a password reset request. */
  async function handleReset (email: string) {
    try {
      await authApi.resetPassword(email)
      notify('Password reset email sent')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      showReset.value = false
    }
  }

  /** Change the authenticated user's password. */
  async function handleChange (payload: {
    oldPassword: string
    newPassword: string
  }) {
    try {
      await authApi.changePassword(payload.oldPassword, payload.newPassword)
      notify('Password changed')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      showChange.value = false
    }
  }

  /** Handle logout confirmation. */
  async function handleLogout () {
    try {
      if (auth.refreshToken) await authApi.logout(auth.refreshToken)
      notify('Logged out')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      auth.clearAuth()
      showLogout.value = false
    }
  }

  /**
   * Save the user's profile changes via the GraphQL API and close the dialog.
   */
  async function handleProfile (payload: {
    firstName: string
    lastName: string
    note: string
  }) {
    if (!auth.user) return
    try {
      const { updateUser } = await authApi.updateUser(
        auth.user.id,
        payload.firstName,
        payload.lastName,
        payload.note,
      )
      auth.user = updateUser
      notify('Profile updated')
    } catch (error) {
      console.error(error)
      notify((error as Error).message, false)
    } finally {
      showProfile.value = false
    }
  }
</script>
