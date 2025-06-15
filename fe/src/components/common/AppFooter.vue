<!--
  @fileoverview Application Footer Component

  This component renders the main application footer with external links,
  backend status indicator, user information, and copyright notice.

  Features:
  - Links to external resources (currently Vuetify documentation)
  - Real-time backend connectivity status
  - Current user display for authenticated users
  - Responsive design with conditional content for different screen sizes
  - Copyright notice with current year

  The footer automatically checks backend health on mount and displays
  the connection status with appropriate color coding.

  Usage:
  ```vue
  <AppFooter />
  ```

  The component is typically used in the main App.vue layout and requires
  no props or configuration.
-->

<template>
  <v-footer app height="40">
    <a
      v-for="item in items"
      :key="item.title"
      class="d-inline-block mx-2 social-link"
      :href="item.href"
      rel="noopener noreferrer"
      target="_blank"
      :title="item.title"
    >
      <v-icon :icon="item.icon" :size="item.icon === '$vuetify' ? 24 : 16" />
    </a>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px"
    >
      <span :class="ready ? 'text-success' : 'text-error'">
        Backend: {{ ready ? "ready" : "offline" }}
      </span>
      <template v-if="userSummary">&nbsp;|&nbsp;Logged in as {{ userSummary }}</template>
      &nbsp;|&nbsp;© {{ new Date().getFullYear() }}
      <span class="d-none d-sm-inline-block">Radek Zitek</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
/**
 * @fileoverview App Footer Script
 *
 * Handles footer functionality including backend health checking,
 * user authentication display, and external link management.
 */

  import { storeToRefs } from 'pinia'
  import { computed, onMounted, ref } from 'vue'
  import { useAuthStore } from '../../stores/auth'

  /**
   * External links configuration for footer social/reference links.
   * Each item contains title, icon, and href for external navigation.
   */
  const items = [
    {
      title: 'Vuetify Documentation',
      icon: `$vuetify`,
      href: 'https://vuetifyjs.com/',
    },
  ]

  /**
   * Backend readiness indicator.
   * - null: initial state (checking)
   * - true: backend is responding
   * - false: backend is offline or error occurred
   */
  const ready = ref<boolean | null>(null)

  /** Authentication store for accessing user details */
  const auth = useAuthStore()
  const { user } = storeToRefs(auth)

  /**
   * Computed user summary for display in footer.
   * Shows user's full name and email if authenticated.
   * Falls back to email only if no name is available.
   * Returns empty string if not authenticated.
   */
  const userSummary = computed(() => {
    if (!user.value) return ''
    const name = [user.value.firstName, user.value.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()
    return name ? `${name} (${user.value.email})` : user.value.email
  })

  /**
   * Query the backend health endpoint and update the readiness state.
   * Called on component mount to check initial backend connectivity.
   * Uses the GraphQL health query to verify backend availability.
   */
  onMounted(async () => {
    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'query{ health }' }),
      })
      const json = await res.json()
      ready.value = json?.data?.health === true
    } catch {
      ready.value = false
    }
  })
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
