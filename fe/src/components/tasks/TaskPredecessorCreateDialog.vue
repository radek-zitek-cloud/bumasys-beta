<!--
  @fileoverview Task Predecessor Create Dialog Component

  This component provides a form interface for adding predecessor relationships to tasks.
  It includes dropdown selection for available tasks that can be predecessors.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Add Predecessor Task</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="form.predecessorTaskId"
              item-title="title"
              item-value="value"
              :items="taskOptions"
              label="Predecessor Task *"
              prepend-icon="mdi-arrow-left-bold"
              required
              :rules="taskRules"
            />
          </v-col>
          <v-col cols="12">
            <v-alert
              icon="mdi-information"
              type="info"
              variant="tonal"
            >
              Select a task that must be completed before this task can begin.
              The predecessor task can be from any project.
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="emit('cancel')">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="processing"
          type="submit"
          variant="flat"
        >
          Add Predecessor
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Task } from '../../services/tasks'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    availableTasks: Task[]
    currentPredecessors: Task[]
    currentTaskId: string
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [predecessorTaskId: string]
  }>()

  /** Form data reactive object */
  const form = reactive({
    predecessorTaskId: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Task options filtered to exclude current task, current predecessors, and child tasks */
  const taskOptions = computed(() => {
    const currentPredecessorIds = new Set(props.currentPredecessors.map(predecessor => predecessor.id))
    return props.availableTasks
      .filter(task =>
        task.id !== props.currentTaskId
        && !currentPredecessorIds.has(task.id)
        && task.parentTaskId !== props.currentTaskId, // Don't allow child tasks as predecessors
      )
      .map(task => ({
        title: `${task.name} (${task.project?.name || 'Unknown Project'})`,
        value: task.id,
      }))
  })

  /** Validation rules */
  const taskRules = [
    (v: string) => !!v || 'Predecessor task is required',
  ]

  /**
   * Handle form submission
   * Validates form data and emits created event with task ID
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.predecessorTaskId) {
      return
    }

    processing.value = true
    try {
      // Emit the task ID to parent for actual API call
      emit('created', form.predecessorTaskId)
    } finally {
      processing.value = false
    }
  }
</script>
