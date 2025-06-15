<!--
  @fileoverview Department Delete Dialog Component

  This component provides a confirmation dialog for deleting departments.
-->

<template>
  <v-card width="500">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
      Delete Department
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Are you sure you want to delete the department
        <strong>{{ department.name }}</strong>?
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
          This will permanently delete the department and may affect
          related staff members and sub-departments.
        </div>
      </v-alert>
      <p class="text-body-2 text-medium-emphasis">
        Department ID: {{ department.id }}
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
        Delete Department
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Department } from '../services/departments'
  import { ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    department: Department
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    deleted: [departmentId: string]
  }>()

  /** Processing state for the delete button */
  const processing = ref(false)

  /**
   * Handle delete confirmation
   * Emits deleted event with department ID
   */
  async function onConfirm () {
    processing.value = true
    try {
      // Emit the department ID to parent for actual API call
      emit('deleted', props.department.id)
    } finally {
      processing.value = false
    }
  }
</script>
