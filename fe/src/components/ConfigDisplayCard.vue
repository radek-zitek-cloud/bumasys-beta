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
  import type { Config } from '../services/config'
  import { computed, onMounted, ref } from 'vue'
  import { getConfig } from '../services/config'

  /** Configuration data fetched from backend */
  const config = ref<Config | null>(null)

  /** Loading state */
  const loading = ref(false)

  /** Error state */
  const error = ref<string | null>(null)

  /** Define component events */
  defineEmits<{
    /** Emitted when the dialog should be closed */
    (e: 'close'): void
  }>()

  /** Computed property to format the config as pretty JSON */
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

  /** Fetch configuration data when component is mounted */
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
