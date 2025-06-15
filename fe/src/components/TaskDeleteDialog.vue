<!--
  @fileoverview Task Delete Dialog Component

  This component provides a confirmation dialog for deleting tasks.
  It follows the same design patterns as ProjectDeleteDialog.vue with proper
  warning messages and confirmation handling.
-->

<template>
  <v-card width="500">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="error">mdi-delete</v-icon>
      Delete Task
    </v-card-title>
    <v-card-text>
      <v-alert
        color="error"
        icon="mdi-alert-circle"
        variant="tonal"
        class="mb-4"
      >
        <div class="text-h6">Warning</div>
        <div>This action cannot be undone. The task and all its data will be permanently deleted.</div>
      </v-alert>

      <div class="text-body-1 mb-3">
        Are you sure you want to delete the following task?
      </div>
      
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" color="primary">mdi-clipboard-text-outline</v-icon>
            <span class="text-h6">{{ task.name }}</span>
          </div>
          
          <div v-if="task.description" class="text-body-2 text-medium-emphasis mb-2">
            {{ task.description }}
          </div>
          
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-if="task.project"
              color="primary"
              size="small"
              variant="outlined"
            >
              <v-icon start>mdi-clipboard-outline</v-icon>
              {{ task.project.name }}
            </v-chip>
            
            <v-chip
              v-if="task.status"
              color="info"
              size="small"
              variant="outlined"
            >
              <v-icon start>mdi-flag</v-icon>
              {{ task.status.name }}
            </v-chip>
            
            <v-chip
              v-if="task.priority"
              color="warning"
              size="small"
              variant="outlined"
            >
              <v-icon start>mdi-priority-high</v-icon>
              {{ task.priority.name }}
            </v-chip>
          </div>

          <div v-if="task.evaluator" class="text-body-2 text-medium-emphasis mt-2">
            <v-icon class="mr-1" size="small">mdi-account-supervisor</v-icon>
            Evaluator: {{ task.evaluator.firstName }} {{ task.evaluator.lastName }}
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="hasChildTasks"
        color="warning"
        icon="mdi-information"
        variant="tonal"
      >
        <div class="text-body-2">
          <strong>Note:</strong> If this task has child tasks, the deletion will fail. 
          Please delete or reassign all child tasks before deleting this task.
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
        Delete Task
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import type { Task } from '../services/tasks'

  /** Component props */
  const props = defineProps<{
    task: Task
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    confirm: [task: Task]
  }>()

  /** Loading state for deletion operation */
  const loading = ref(false)

  /** Computed property to check if task has child tasks */
  const hasChildTasks = computed(() => {
    return props.task.childTasks && props.task.childTasks.length > 0
  })

  /** Handle deletion confirmation */
  async function handleConfirm() {
    loading.value = true
    try {
      emit('confirm', props.task)
    } finally {
      loading.value = false
    }
  }
</script>