<!--
  @fileoverview Staff Delete Dialog Component

  This component provides a confirmation dialog for deleting staff members.
-->

<template>
  <v-card width="500">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
      Delete Staff Member
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Are you sure you want to delete the staff member
        <strong>{{ staff.firstName }} {{ staff.lastName }}</strong>?
      </p>
      <v-alert
        class="mb-4"
        type="warning"
        variant="tonal"
      >
        <v-icon>mdi-alert</v-icon>
        <div>
          <strong>This action cannot be undone.</strong>
          <br>
          This will permanently delete the staff member and may affect
          related records and reporting relationships.
        </div>
      </v-alert>
      <p class="text-body-2 text-medium-emphasis">
        Staff ID: {{ staff.id }}<br>
        Email: {{ staff.email }}
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
        Delete Staff Member
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Staff } from '../services/staff'
  import { ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    staff: Staff
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    deleted: [staffId: string]
  }>()

  /** Processing state for the delete button */
  const processing = ref(false)

  /**
   * Handle delete confirmation
   * Emits deleted event with staff ID
   */
  async function onConfirm () {
    processing.value = true
    try {
      // Emit the staff ID to parent for actual API call
      emit('deleted', props.staff.id)
    } finally {
      processing.value = false
    }
  }
</script>
