<template>
  <v-responsive class="border rounded">
    <v-app>
      <v-app-bar :elevation="2">
        <template #prepend>
          <!-- Navigation drawer toggle -->
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        </template>
        <v-app-bar-title>Fulcrum</v-app-bar-title>
        <template #append>
          <v-btn
            :icon="vuetifyTheme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
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
                <v-list-item title="Change Password" @click="showChange = true" />
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

      <!-- Authentication dialogs positioned under the top-right navbar -->
      <v-dialog 
        max-width="400"
        v-model="showLogin"
        persistent
      >
        <LoginCard @cancel="showLogin = false" @login="handleLogin" />
      </v-dialog>
      <v-dialog
        max-width="400"
        v-model="showRegister"
        persistent
      >
        <RegisterCard @cancel="showRegister = false" @register="handleRegister" />
      </v-dialog>
      <v-dialog
        max-width="400"
        v-model="showReset"
        persistent
      >
        <PasswordResetCard @cancel="showReset = false" @reset="handleReset" />
      </v-dialog>
      <v-dialog
        max-width="400"
        v-model="showChange"
        persistent
      >
        <ChangePasswordCard @cancel="showChange = false" @change="handleChange" />
      </v-dialog>
      <v-dialog
        max-width="400"
        v-model="showLogout"
        persistent
      >
        <LogoutCard @cancel="showLogout = false" @logout="handleLogout" />
      </v-dialog>
      <v-dialog
        max-width="400"
        v-model="showProfile"
        persistent
      >
        <ProfileCard @cancel="showProfile = false" @save="handleProfile" />
      </v-dialog>
    </v-app>
  </v-responsive>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useTheme } from 'vuetify'
  import ChangePasswordCard from './components/ChangePasswordCard.vue'
  import LoginCard from './components/LoginCard.vue'
  import LogoutCard from './components/LogoutCard.vue'
  import PasswordResetCard from './components/PasswordResetCard.vue'
  import ProfileCard from './components/ProfileCard.vue'
  import RegisterCard from './components/RegisterCard.vue'
  import { useAuthStore } from './stores/auth'

  /**
   * Reactive state for the navigation drawer.
   */
  const drawer = ref(false)

  /** Authentication store controlling login state. */
  const auth = useAuthStore()

  /** Dialog visibility flags for each action. */
  const showLogin = ref(false)
  const showRegister = ref(false)
  const showReset = ref(false)
  const showChange = ref(false)
  const showLogout = ref(false)
  const showProfile = ref(false)

  /**
   * Access Vuetify's theme instance so we can switch between light and dark
   * modes.
   */
  const vuetifyTheme = useTheme()

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme () {
    vuetifyTheme.global.name.value
      = vuetifyTheme.global.current.value.dark ? 'light' : 'dark'
  }

  /**
   * Navigation drawer items.
   * Each entry has a Material Design icon, a title, and a short description
   * shown as the subtitle. Separators are represented with `separator: true`.
   */
  const navigationItems = [
    { icon: 'mdi-home', title: 'Home', subtitle: 'Return to home page', to: '/' },
    { separator: true },
    { icon: 'mdi-account-group', title: 'People', subtitle: 'Manage team members', to: '/people' },
    { icon: 'mdi-account-multiple-outline', title: 'Teams', subtitle: 'Manage teams', to: '/teams' },
    { icon: 'mdi-clipboard-check-outline', title: 'Tasks', subtitle: 'Manage tasks', to: '/tasks' },
    { icon: 'mdi-cash-multiple', title: 'Budget', subtitle: 'Manage budget', to: '/budget' },
    { separator: true },
    { icon: 'mdi-book-open-page-variant-outline', title: 'References', subtitle: 'Manage reference data', to: '/references' },
    { icon: 'mdi-account-cog-outline', title: 'Users', subtitle: 'Manage system users', to: '/users' },
  ]

  /** Handle login form submission. Simply mark the user as logged in. */
  function handleLogin () {
    auth.loggedIn = true
    showLogin.value = false
  }

  /** Handle register form submission and mark the user as logged in. */
  function handleRegister () {
    auth.loggedIn = true
    showRegister.value = false
  }

  /** Close the password reset dialog. */
  function handleReset () {
    showReset.value = false
  }

  /** Close the password change dialog. */
  function handleChange () {
    showChange.value = false
  }

  /** Handle logout confirmation. */
  function handleLogout () {
    auth.loggedIn = false
    showLogout.value = false
  }

  /** Close the profile dialog after saving. */
  function handleProfile () {
    showProfile.value = false
  }
</script>
