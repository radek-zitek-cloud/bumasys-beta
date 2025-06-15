<!--
  @fileoverview Project Delete Dialog Component

  This component provides a confirmation dialog for deleting projects.
  It follows the same design patterns as UserDeleteDialog.vue with proper
  warning messages and confirmation handling.
-->

<template>
  <v-card width="500">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="error">mdi-delete</v-icon>
      Delete Project
    </v-card-title>
    <v-card-text>
      <v-alert
        class="mb-4"
        color="error"
        icon="mdi-alert-circle"
        variant="tonal"
      >
        <div class="text-h6">Warning</div>
        <div>This action cannot be undone. The project and all its data will be permanently deleted.</div>
      </v-alert>

      <div class="text-body-1 mb-3">
        Are you sure you want to delete the following project?
      </div>

      <v-card class="mb-4" variant="outlined">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" color="primary">mdi-clipboard-text-outline</v-icon>
            <span class="text-h6">{{ project.name }}</span>
          </div>
          <div v-if="project.description" class="text-body-2 text-medium-emphasis">
            {{ project.description }}
          </div>
          <div v-if="project.leadStaff" class="text-body-2 text-medium-emphasis mt-2">
            <v-icon class="mr-1" size="small">mdi-account-supervisor</v-icon>
            Lead: {{ project.leadStaff.firstName }} {{ project.leadStaff.lastName }}
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        color="warning"
        icon="mdi-information"
        variant="tonal"
      >
        <div class="text-body-2">
          <strong>Note:</strong> If this project has associated tasks, the deletion will fail.
          Please delete or reassign all tasks before deleting the project.
        </div>
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="emit('cancel')">
        Cancel
      </v-btn>
      <v-btn
        color="error"
        :loading="loading"
        variant="elevated"
        @click="handleConfirm"
      >
        Delete Project
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Project } from '../../services/projects'
  import { ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    project: Project
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    confirm: [project: Project]
  }>()

  /** Loading state for deletion operation */
  const loading = ref(false)

  /** Handle deletion confirmation */
  async function handleConfirm () {
    loading.value = true
    try {
      emit('confirm', props.project)
    } finally {
      loading.value = false
    }
  }
</script>
