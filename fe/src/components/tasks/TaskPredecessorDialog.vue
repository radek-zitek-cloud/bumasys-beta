<!--
  @fileoverview Enhanced Task Predecessor Dialog Component

  This component provides both options for adding predecessor relationships:
  1. Select existing task as predecessor
  2. Create new task as predecessor
-->

<template>
  <v-card width="700">
    <v-card-title>Add Predecessor Task</v-card-title>

    <v-card-text>
      <!-- Mode Selection Tabs -->
      <v-tabs v-model="selectedTab" align-tabs="center" color="primary">
        <v-tab value="select">Select Existing Task</v-tab>
        <v-tab value="create">Create New Task</v-tab>
      </v-tabs>

      <v-tabs-window v-model="selectedTab" class="mt-2">
        <!-- Select Existing Task Tab -->
        <v-tabs-window-item value="select">
          <form @submit.prevent="onSelectSubmit">
            <v-row class="mt-2">
              <v-col cols="12">
                <v-select
                  v-model="selectForm.predecessorTaskId"
                  item-title="title"
                  item-value="value"
                  :items="taskOptions"
                  label="Predecessor Task *"
                  prepend-icon="mdi-arrow-left-bold"
                  required
                  :rules="taskRules"
                  variant="outlined"
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
          </form>
        </v-tabs-window-item>

        <!-- Create New Task Tab -->
        <v-tabs-window-item value="create">
          <form @submit.prevent="onCreateSubmit">
            <v-row>
              <!-- Task Name -->
              <v-col cols="12">
                <v-text-field
                  v-model="createForm.name"
                  label="Task Name *"
                  prepend-icon="mdi-clipboard-text-outline"
                  required
                  :rules="nameRules"
                  variant="outlined"
                />
              </v-col>

              <!-- Project Selection -->
              <v-col cols="12">
                <v-select
                  v-model="createForm.projectId"
                  item-title="name"
                  item-value="id"
                  :items="availableProjects"
                  label="Project *"
                  prepend-icon="mdi-clipboard-outline"
                  required
                  :rules="projectRules"
                  variant="outlined"
                />
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="createForm.description"
                  label="Description"
                  prepend-icon="mdi-text-box"
                  rows="3"
                  variant="outlined"
                />
              </v-col>

              <!-- Status, Priority, Complexity -->
              <v-col cols="4">
                <v-select
                  v-model="createForm.statusId"
                  clearable
                  item-title="title"
                  item-value="value"
                  :items="statusOptions"
                  label="Status"
                  prepend-icon="mdi-flag"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="4">
                <v-select
                  v-model="createForm.priorityId"
                  clearable
                  item-title="title"
                  item-value="value"
                  :items="priorityOptions"
                  label="Priority"
                  prepend-icon="mdi-priority-high"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="4">
                <v-select
                  v-model="createForm.complexityId"
                  clearable
                  item-title="title"
                  item-value="value"
                  :items="complexityOptions"
                  label="Complexity"
                  prepend-icon="mdi-gauge"
                  variant="outlined"
                />
              </v-col>

              <!-- Dates -->
              <v-col cols="6">
                <v-text-field
                  v-model="createForm.plannedStartDate"
                  label="Planned Start Date"
                  prepend-icon="mdi-calendar-start"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="createForm.plannedEndDate"
                  label="Planned End Date"
                  prepend-icon="mdi-calendar-end"
                  type="date"
                  variant="outlined"
                />
              </v-col>

              <!-- Info Alert -->
              <v-col cols="12">
                <v-alert
                  icon="mdi-information"
                  type="info"
                  variant="tonal"
                >
                  This task will be created and automatically set as a predecessor to the current task.
                </v-alert>
              </v-col>
            </v-row>
          </form>
        </v-tabs-window-item>
      </v-tabs-window>
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
        @click="handleSubmit"
      >
        {{ selectedTab === 'select' ? 'Add Predecessor' : 'Create & Add Predecessor' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { CreateTaskInput, Task } from '../../services/tasks'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    availableTasks: Task[]
    availableProjects: Array<{ id: string, name: string }>
    availableStatuses: Array<{ id: string, name: string }>
    availablePriorities: Array<{ id: string, name: string }>
    availableComplexities: Array<{ id: string, name: string }>
    currentPredecessors: Task[]
    currentTaskId: string
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    'predecessor-selected': [predecessorTaskId: string]
    'predecessor-created': [taskData: CreateTaskInput]
  }>()

  /** Current selected tab */
  const selectedTab = ref('select')

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Form data for selecting existing task */
  const selectForm = reactive({
    predecessorTaskId: '',
  })

  /** Form data for creating new task */
  const createForm = reactive<Partial<CreateTaskInput>>({
    name: '',
    description: '',
    projectId: '',
    statusId: '',
    priorityId: '',
    complexityId: '',
    plannedStartDate: '',
    plannedEndDate: '',
  })

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
  const taskRules = [
    (v: string) => !!v || 'Predecessor task is required',
  ]

  const nameRules = [
    (v: string) => !!v || 'Task name is required',
    (v: string) => (v && v.length >= 2) || 'Task name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Task name must be less than 100 characters',
  ]

  const projectRules = [
    (v: string) => !!v || 'Project is required',
  ]

  /**
   * Handle form submission based on selected tab
   */
  async function handleSubmit () {
    selectedTab.value === 'select' ? await onSelectSubmit() : await onCreateSubmit()
  }

  /**
   * Handle selecting existing task form submission
   */
  async function onSelectSubmit () {
    if (!selectForm.predecessorTaskId) {
      return
    }

    processing.value = true
    try {
      emit('predecessor-selected', selectForm.predecessorTaskId)
    } finally {
      processing.value = false
    }
  }

  /**
   * Handle creating new task form submission
   */
  async function onCreateSubmit () {
    if (!createForm.name || !createForm.projectId) {
      return
    }

    processing.value = true
    try {
      // Create task data
      const taskData: CreateTaskInput = {
        name: createForm.name,
        description: createForm.description || undefined,
        projectId: createForm.projectId,
        statusId: createForm.statusId || undefined,
        priorityId: createForm.priorityId || undefined,
        complexityId: createForm.complexityId || undefined,
        plannedStartDate: createForm.plannedStartDate || undefined,
        plannedEndDate: createForm.plannedEndDate || undefined,
      }

      // Clean up empty fields
      for (const key of Object.keys(taskData)) {
        if (taskData[key as keyof CreateTaskInput] === '') {
          delete taskData[key as keyof CreateTaskInput]
        }
      }

      emit('predecessor-created', taskData)
    } finally {
      processing.value = false
    }
  }
</script>