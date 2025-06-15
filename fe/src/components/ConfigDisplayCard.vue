<!--
  @fileoverview Backend Configuration Display Card

  This component fetches and displays backend configuration in a readable JSON format.
  Intended for debugging and administration purposes to inspect current backend settings.

  Features:
  - Automatic configuration fetching on mount
  - Pretty-printed JSON formatting with syntax highlighting
  - Loading and error state handling
  - Read-only display for security
  - Monospace font for better JSON readability

  Usage:
  ```vue
  <ConfigDisplayCard @close="handleClose" />
  ```

  Security Note:
  This component displays backend configuration which may contain sensitive
  information. Ensure proper access controls are in place before exposing
  this component to users.
-->

<template>
  <v-card width="600">
    <v-card-title>Backend Configuration</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-textarea
            class="font-monospace"
            label="Configuration JSON"
            :model-value="formattedConfig"
            prepend-icon="mdi-code-json"
            readonly
            rows="20"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/**
 * @fileoverview Config Display Card Script
 * 
 * Handles fetching and formatting backend configuration data for display.
 * Provides proper error handling and loading states for a smooth user experience.
 */

import type { Config } from '../services/config'
import { computed, onMounted, ref } from 'vue'
import { getConfig } from '../services/config'

/** Configuration data fetched from backend */
const config = ref<Config | null>(null)

/** Loading state indicator */
const loading = ref(false)

/** Error state for failed configuration loading */
const error = ref<string | null>(null)

/** 
 * Define component events.
 * @event close - Emitted when the dialog should be closed
 */
defineEmits<{
  /** Emitted when the dialog should be closed */
  (e: 'close'): void
}>()

/** 
 * Computed property to format the config as pretty JSON.
 * Handles different states: loading, error, success, and formatting errors.
 * @returns Formatted configuration string or appropriate status message
 */
const formattedConfig = computed(() => {
  if (!config.value) {
    if (loading.value) return 'Loading configuration...'
    if (error.value) return `Error loading configuration: ${error.value}`
    return 'No configuration data available'
  }

  try {
    return JSON.stringify(config.value, null, 2)
  } catch (error_) {
    return `Error formatting configuration: ${error_}`
  }
})

/** 
 * Fetch configuration data when component is mounted.
 * Handles loading states and error conditions gracefully.
 */
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getConfig()
    config.value = response.config
  } catch (error_) {
    console.error('Failed to fetch configuration:', error_)
    error.value = (error_ as Error).message || 'Unknown error occurred'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
  .font-monospace {
    font-family: 'Courier New', monospace;
  }
</style>
