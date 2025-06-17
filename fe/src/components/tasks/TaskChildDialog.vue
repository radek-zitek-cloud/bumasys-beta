<!--
  @fileoverview Enhanced Task Child Dialog Component

  This component provides both options for adding child task relationships:
  1. Create new task as child
  2. Select existing task as child
-->

<template>
  <v-card width="700">
    <v-card-title>
      <v-icon class="mr-2">mdi-file-tree</v-icon>
      Add Child Task
    </v-card-title>
    
    <v-card-text>
      <!-- Mode Selection Tabs -->
      <v-tabs v-model="selectedTab" color="primary" align-tabs="center">
        <v-tab value="create">Create New Task</v-tab>
        <v-tab value="select">Select Existing Task</v-tab>
      </v-tabs>

      <v-tabs-window v-model="selectedTab" class="mt-4">
        <!-- Create New Task Tab -->
        <v-tabs-window-item value="create">
          <form @submit.prevent="onCreateSubmit">
            <v-row class="mt-0">
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
                  This task will be created as a child of the current task and inherit its project.
                </v-alert>
              </v-col>
            </v-row>
          </form>
        </v-tabs-window-item>

        <!-- Select Existing Task Tab -->
        <v-tabs-window-item value="select">
          <form @submit.prevent="onSelectSubmit">
            <v-row class="mt-0">
              <v-col cols="12">
                <v-select
                  v-model="selectForm.childTaskId"
                  item-title="title"
                  item-value="value"
                  :items="taskOptions"
                  label="Child Task *"
                  prepend-icon="mdi-file-tree"
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
                  Select an existing task to make it a child of the current task.
                  The task will be moved under this task as a subtask.
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
        {{ selectedTab === 'create' ? 'Create Child Task' : 'Set as Child Task' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Task, CreateTaskInput } from '../../services/tasks'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    parentTaskId: string
    projectId: string
    availableTasks: Task[]
    availableStatuses: Array<{ id: string, name: string }>
    availablePriorities: Array<{ id: string, name: string }>
    availableComplexities: Array<{ id: string, name: string }>
    currentChildTasks: Task[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    'child-created': [data: CreateTaskInput]
    'child-selected': [childTaskId: string]
  }>()

  /** Current selected tab */
  const selectedTab = ref('create')

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Form data for creating new task */
  const createForm = reactive<Partial<CreateTaskInput>>({
    name: '',
    description: '',
    statusId: '',
    priorityId: '',
    complexityId: '',
    plannedStartDate: '',
    plannedEndDate: '',
  })

  /** Form data for selecting existing task */
  const selectForm = reactive({
    childTaskId: '',
  })

  /** Task options filtered to exclude current task, current children, and tasks that already have parents */
  const taskOptions = computed(() => {
    const currentChildIds = new Set(props.currentChildTasks.map(child => child.id))
    return props.availableTasks
      .filter(task =>
        task.id !== props.parentTaskId
        && !currentChildIds.has(task.id)
        && !task.parentTaskId // Don't allow tasks that already have a parent
        && task.projectId === props.projectId, // Only allow tasks from the same project
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
  const nameRules = [
    (v: string) => !!v || 'Task name is required',
    (v: string) => (v && v.length >= 2) || 'Task name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Task name must be less than 100 characters',
  ]

  const taskRules = [
    (v: string) => !!v || 'Child task is required',
  ]

  /**
   * Handle form submission based on selected tab
   */
  async function handleSubmit () {
    selectedTab.value === 'create' ? await onCreateSubmit() : await onSelectSubmit()
  }

  /**
   * Handle creating new task form submission
   */
  async function onCreateSubmit () {
    if (!createForm.name) {
      return
    }

    processing.value = true
    try {
      // Create task data with parent relationship
      const taskData: CreateTaskInput = {
        name: createForm.name,
        description: createForm.description || undefined,
        projectId: props.projectId,
        parentTaskId: props.parentTaskId,
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

      emit('child-created', taskData)
    } finally {
      processing.value = false
    }
  }

  /**
   * Handle selecting existing task form submission
   */
  async function onSelectSubmit () {
    if (!selectForm.childTaskId) {
      return
    }

    processing.value = true
    try {
      emit('child-selected', selectForm.childTaskId)
    } finally {
      processing.value = false
    }
  }
</script>