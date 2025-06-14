<!--
  @fileoverview Organization Delete Dialog Component
  
  This component provides a confirmation dialog for deleting organizations.
  It follows the same design patterns as UserDeleteDialog.vue with proper
  warnings about the irreversible nature of the action.
-->

<template>
  <v-card width="500">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
      Delete Organization
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Are you sure you want to delete the organization
        <strong>{{ organization.name }}</strong>?
      </p>
      <v-alert
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        <v-icon>mdi-alert</v-icon>
        <div>
          <strong>This action cannot be undone.</strong>
          <br>
          This will permanently delete the organization and may affect
          related departments and staff members.
        </div>
      </v-alert>
      <p class="text-body-2 text-medium-emphasis">
        Organization ID: {{ organization.id }}
      </p>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="grey" variant="text" @click="emit('cancel')">
        Cancel
      </v-btn>
      <v-btn
        color="error"
        :loading="processing"
        variant="flat"
        @click="onConfirm"
      >
        Delete Organization
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import type { Organization } from '../services/organizations'

  /** Component props */
  const props = defineProps<{
    organization: Organization
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    deleted: [organizationId: string]
  }>()

  /** Processing state for the delete button */
  const processing = ref(false)

  /**
   * Handle delete confirmation
   * Emits deleted event with organization ID
   */
  async function onConfirm() {
    processing.value = true
    try {
      // Emit the organization ID to parent for actual API call
      emit('deleted', props.organization.id)
    } finally {
      processing.value = false
    }
  }
</script>