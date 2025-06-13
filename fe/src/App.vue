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
          <v-btn icon="mdi-dots-vertical" />
        </template>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" :locations="left">
        <v-list>
          <v-list-item title="Navigation drawer" />
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
</script>
