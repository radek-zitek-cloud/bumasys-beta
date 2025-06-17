<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2" color="primary">mdi-database-switch</v-icon>
      Switch Database Tag
    </v-card-title>

    <v-card-text>
      <p class="text-body-2 mb-4">
        Enter a database tag to switch between different data sets.
        This allows you to work with separate environments (e.g., development, staging, production).
      </p>

      <v-form ref="form" v-model="valid" @submit.prevent="handleSwitch">
        <v-text-field
          v-model="databaseTag"
          autofocus
          :disabled="loading"
          hint="Only alphanumeric characters and hyphens are allowed"
          label="Database Tag"
          :loading="loading"
          persistent-hint
          placeholder="e.g., production, staging, testing"
          required
          :rules="tagRules"
        >
          <template #prepend-inner>
            <v-icon>mdi-tag</v-icon>
          </template>
        </v-text-field>
      </v-form>

      <v-alert v-if="error" class="mt-4" type="error">
        {{ error }}
      </v-alert>

      <v-alert v-if="success" class="mt-4" type="success">
        {{ success }}
      </v-alert>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="grey" :disabled="loading" variant="text" @click="handleCancel">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!valid || !databaseTag"
        :loading="loading"
        variant="elevated"
        @click="handleSwitch"
      >
        Switch Database
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
/**
 * @fileoverview Database Tag Switch Component
 *
 * This component provides a dialog for switching between different database tags,
 * allowing users to work with separate data environments.
 */

  import { ref } from 'vue'
  import { useLogger } from '../../composables/useLogger'
  import { graphqlClient } from '../../services/graphql-client'

  /**
   * Component props interface
   */
  interface Props {
    /** Optional initial tag value */
    initialTag?: string
  }

  /**
   * Component emits interface
   */
  interface Emits {
    /** Emitted when user cancels the operation */
    (e: 'cancel'): void
    /** Emitted when database tag is successfully switched */
    (e: 'switch', tag: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    initialTag: '',
  })

  const emit = defineEmits<Emits>()

  const { logInfo, logError } = useLogger()

  // Form state
  const form = ref()
  const valid = ref(false)
  const loading = ref(false)
  const databaseTag = ref(props.initialTag)
  const error = ref('')
  const success = ref('')

  // Validation rules
  const tagRules = [
    (v: string) => !!v || 'Database tag is required',
    (v: string) => /^[a-zA-Z0-9-]+$/.test(v) || 'Only alphanumeric characters and hyphens are allowed',
    (v: string) => v.length >= 2 || 'Tag must be at least 2 characters long',
    (v: string) => v.length <= 50 || 'Tag must be less than 50 characters',
    (v: string) => !['auth', 'sessions', 'system'].includes(v.toLowerCase()) || 'This tag name is reserved',
  ]

  /**
   * Handle cancel action
   */
  function handleCancel () {
    logInfo('Database tag switch cancelled')
    emit('cancel')
  }

  /**
   * Handle database tag switch
   */
  async function handleSwitch () {
    if (!valid.value || !databaseTag.value) {
      return
    }

    loading.value = true
    error.value = ''
    success.value = ''

    try {
      logInfo('Switching database tag', { tag: databaseTag.value })

      const result = await graphqlClient<{ dbtag: boolean }>(
        `
        mutation SwitchDatabaseTag($tag: String!) {
          dbtag(tag: $tag)
        }
      `,
        { tag: databaseTag.value },
      )

      if (result.dbtag) {
        success.value = `Successfully switched to database tag: ${databaseTag.value}`
        logInfo('Database tag switched successfully', { tag: databaseTag.value })

        // Emit success after a brief delay to show the success message
        setTimeout(() => {
          emit('switch', databaseTag.value)
        }, 1500)
      } else {
        throw new Error('Database tag switch failed')
      }
    } catch (error_: any) {
      const errorMessage = error_.message || 'An error occurred while switching database tag'
      error.value = errorMessage
      logError('Failed to switch database tag', error_)
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.v-card {
  max-width: 500px;
}
</style>
