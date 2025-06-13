<template>
  <v-responsive class="border rounded">
    <v-app>
      <v-app-bar :elevation="2">
        <template #prepend>
          <!-- Navigation drawer toggle -->
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        </template>
        <v-app-bar-title >Fulcrum</v-app-bar-title>
        <template #append>
          <v-btn
            :icon="vuetifyTheme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            slim
            @click="toggleTheme"
          />
          <v-btn icon="mdi-dots-vertical" />
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
    </v-app>
  </v-responsive>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useTheme } from 'vuetify'

  /**
   * Reactive state for the navigation drawer.
   */
  const drawer = ref(false)

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
</script>
