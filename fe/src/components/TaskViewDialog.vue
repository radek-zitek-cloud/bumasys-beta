<!--
  @fileoverview Task View Dialog Component

  This component provides a read-only view of task details.
  It follows the same design patterns as ProjectViewDialog.vue with proper
  formatting and display of all task information and relationships.
-->

<template>
  <v-card width="900">
    <v-card-title>
      <v-icon class="mr-2">mdi-clipboard-text-outline</v-icon>
      Task Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <!-- Task Name -->
        <v-col cols="12">
          <v-text-field
            label="Task Name"
            :model-value="task.name"
            prepend-icon="mdi-clipboard-text-outline"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Task ID -->
        <v-col cols="6">
          <v-text-field
            label="Task ID"
            :model-value="task.id"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Project -->
        <v-col cols="6">
          <v-text-field
            label="Project"
            :model-value="projectDisplay"
            prepend-icon="mdi-clipboard-outline"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Description -->
        <v-col cols="12">
          <v-textarea
            label="Description"
            :model-value="task.description || 'No description provided'"
            prepend-icon="mdi-text-box"
            readonly
            rows="3"
            variant="outlined"
          />
        </v-col>

        <!-- Parent Task -->
        <v-col cols="6">
          <v-text-field
            label="Parent Task"
            :model-value="parentTaskDisplay"
            prepend-icon="mdi-file-tree"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Evaluator -->
        <v-col cols="6">
          <v-text-field
            label="Evaluator"
            :model-value="evaluatorDisplay"
            prepend-icon="mdi-account-supervisor"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Status, Priority, Complexity -->
        <v-col cols="4">
          <v-text-field
            label="Status"
            :model-value="statusDisplay"
            prepend-icon="mdi-flag"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="Priority"
            :model-value="priorityDisplay"
            prepend-icon="mdi-priority-high"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="Complexity"
            :model-value="complexityDisplay"
            prepend-icon="mdi-gauge"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Planned Dates -->
        <v-col cols="6">
          <v-text-field
            label="Planned Start Date"
            :model-value="formatDate(task.plannedStartDate)"
            prepend-icon="mdi-calendar-start"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Planned End Date"
            :model-value="formatDate(task.plannedEndDate)"
            prepend-icon="mdi-calendar-end"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Actual Dates -->
        <v-col cols="6">
          <v-text-field
            label="Actual Start Date"
            :model-value="formatDate(task.actualStartDate)"
            prepend-icon="mdi-calendar-check"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Actual End Date"
            :model-value="formatDate(task.actualEndDate)"
            prepend-icon="mdi-calendar-check-outline"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Child Tasks (if available) -->
        <v-col v-if="task.childTasks && task.childTasks.length > 0" cols="12">
          <v-card variant="outlined">
            <v-card-title class="text-h6">
              <v-icon class="mr-2">mdi-file-tree-outline</v-icon>
              Child Tasks ({{ task.childTasks.length }})
            </v-card-title>
            <v-card-text>
              <v-chip
                v-for="childTask in task.childTasks"
                :key="childTask.id"
                class="ma-1"
                color="primary"
                variant="outlined"
              >
                {{ childTask.name }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" variant="text" @click="emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { Task } from '../services/tasks'

  /** Component props */
  const props = defineProps<{
    task: Task
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Computed properties for display values */
  const projectDisplay = computed(() => {
    return props.task.project?.name || 'Unknown Project'
  })

  const parentTaskDisplay = computed(() => {
    return props.task.parentTask?.name || 'No parent task'
  })

  const evaluatorDisplay = computed(() => {
    if (!props.task.evaluator) {
      return 'No evaluator assigned'
    }
    return `${props.task.evaluator.firstName} ${props.task.evaluator.lastName} (${props.task.evaluator.email})`
  })

  const statusDisplay = computed(() => {
    return props.task.status?.name || 'No status set'
  })

  const priorityDisplay = computed(() => {
    return props.task.priority?.name || 'No priority set'
  })

  const complexityDisplay = computed(() => {
    return props.task.complexity?.name || 'No complexity set'
  })

  /**
   * Format date string for display
   * @param dateString - ISO date string or undefined
   * @returns Formatted date or 'Not set'
   */
  function formatDate(dateString?: string): string {
    if (!dateString) return 'Not set'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }
</script>