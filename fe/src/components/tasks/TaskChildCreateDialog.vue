<!--
  @fileoverview Task Child Create Dialog Component

  This component provides a form interface for creating child tasks.
  It pre-fills the parent task ID and allows setting basic task information.
-->

<template>
  <v-card width="700">
    <form @submit.prevent="onSubmit">
      <v-card-title>
        <v-icon class="mr-2">mdi-file-tree</v-icon>
        Create Child Task
      </v-card-title>
      <v-card-text>
        <v-row>
          <!-- Task Name -->
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Task Name *"
              prepend-icon="mdi-clipboard-text-outline"
              required
              :rules="nameRules"
              variant="outlined"
            />
          </v-col>

          <!-- Description -->
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              prepend-icon="mdi-text-box"
              rows="3"
              variant="outlined"
            />
          </v-col>

          <!-- Status, Priority, Complexity -->
          <v-col cols="4">
            <v-select
              v-model="form.statusId"
              clearable
              :items="statusOptions"
              label="Status"
              prepend-icon="mdi-flag"
              variant="outlined"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <v-col cols="4">
            <v-select
              v-model="form.priorityId"
              clearable
              :items="priorityOptions"
              label="Priority"
              prepend-icon="mdi-priority-high"
              variant="outlined"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <v-col cols="4">
            <v-select
              v-model="form.complexityId"
              clearable
              :items="complexityOptions"
              label="Complexity"
              prepend-icon="mdi-gauge"
              variant="outlined"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <!-- Dates -->
          <v-col cols="6">
            <v-text-field
              v-model="form.plannedStartDate"
              label="Planned Start Date"
              prepend-icon="mdi-calendar-start"
              type="date"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.plannedEndDate"
              label="Planned End Date"
              prepend-icon="mdi-calendar-end"
              type="date"
              variant="outlined"
            />
          </v-col>

          <!-- Info Alert -->
          <v-col cols="12">
            <v-alert
              type="info"
              variant="tonal"
              icon="mdi-information"
            >
              This task will be created as a child of the current task and inherit its project.
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
          Create Child Task
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { CreateTaskInput } from '../../services/tasks'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    parentTaskId: string
    projectId: string
    availableStatuses: Array<{ id: string; name: string }>
    availablePriorities: Array<{ id: string; name: string }>
    availableComplexities: Array<{ id: string; name: string }>
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [data: CreateTaskInput]
  }>()

  /** Form data reactive object */
  const form = reactive<Partial<CreateTaskInput>>({
    name: '',
    description: '',
    statusId: '',
    priorityId: '',
    complexityId: '',
    plannedStartDate: '',
    plannedEndDate: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Status options for dropdown */
  const statusOptions = computed(() =>
    props.availableStatuses.map(status => ({
      title: status.name,
      value: status.id,
    })),
  )

  /** Priority options for dropdown */
  const priorityOptions = computed(() =>
    props.availablePriorities.map(priority => ({
      title: priority.name,
      value: priority.id,
    })),
  )

  /** Complexity options for dropdown */
  const complexityOptions = computed(() =>
    props.availableComplexities.map(complexity => ({
      title: complexity.name,
      value: complexity.id,
    })),
  )

  /** Validation rules */
  const nameRules = [
    (v: string) => !!v || 'Task name is required',
    (v: string) => (v && v.length >= 2) || 'Task name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Task name must be less than 100 characters',
  ]

  /**
   * Handle form submission
   * Validates form data and emits created event with task data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.name) {
      return
    }

    processing.value = true
    try {
      // Create task data with parent relationship
      const taskData: CreateTaskInput = {
        name: form.name,
        description: form.description || undefined,
        projectId: props.projectId,
        parentTaskId: props.parentTaskId,
        statusId: form.statusId || undefined,
        priorityId: form.priorityId || undefined,
        complexityId: form.complexityId || undefined,
        plannedStartDate: form.plannedStartDate || undefined,
        plannedEndDate: form.plannedEndDate || undefined,
      }

      // Clean up empty fields
      Object.keys(taskData).forEach(key => {
        if (taskData[key as keyof CreateTaskInput] === '') {
          delete taskData[key as keyof CreateTaskInput]
        }
      })

      // Emit the task data to parent for actual API call
      emit('created', taskData)
    } finally {
      processing.value = false
    }
  }
</script>