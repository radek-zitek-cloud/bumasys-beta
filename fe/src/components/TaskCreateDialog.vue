<!--
  @fileoverview Task Create Dialog Component

  This component provides a form for creating new tasks.
  It follows the same design patterns as ProjectCreateDialog.vue with proper
  validation and dropdown selections for linked entities.
-->

<template>
  <v-card width="900">
    <v-card-title>
      <v-icon class="mr-2">mdi-clipboard-plus-outline</v-icon>
      Create New Task
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
        <v-row>
          <!-- Task Name -->
          <v-col cols="12">
            <v-text-field
              v-model="formData.name"
              label="Task Name"
              prepend-icon="mdi-clipboard-text-outline"
              required
              :rules="nameRules"
              variant="outlined"
            />
          </v-col>

          <!-- Description -->
          <v-col cols="12">
            <v-textarea
              v-model="formData.description"
              label="Description"
              prepend-icon="mdi-text-box"
              rows="3"
              variant="outlined"
            />
          </v-col>

          <!-- Project Selection -->
          <v-col cols="6">
            <v-select
              v-model="formData.projectId"
              item-title="name"
              item-value="id"
              :items="projects"
              label="Project"
              prepend-icon="mdi-clipboard-outline"
              required
              :rules="projectRules"
              variant="outlined"
            />
          </v-col>

          <!-- Parent Task -->
          <v-col cols="6">
            <v-select
              v-model="formData.parentTaskId"
              clearable
              item-title="displayName"
              item-value="id"
              :items="availableParentTasks"
              label="Parent Task"
              prepend-icon="mdi-file-tree"
              variant="outlined"
            />
          </v-col>

          <!-- Evaluator -->
          <v-col cols="6">
            <v-select
              v-model="formData.evaluatorId"
              clearable
              item-title="displayName"
              item-value="id"
              :items="staffMembers"
              label="Evaluator"
              prepend-icon="mdi-account-supervisor"
              variant="outlined"
            />
          </v-col>

          <!-- Status, Priority, Complexity -->
          <v-col cols="6">
            <v-select
              v-model="formData.statusId"
              clearable
              item-title="name"
              item-value="id"
              :items="statuses"
              label="Status"
              prepend-icon="mdi-flag"
              variant="outlined"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="formData.priorityId"
              clearable
              item-title="name"
              item-value="id"
              :items="priorities"
              label="Priority"
              prepend-icon="mdi-priority-high"
              variant="outlined"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="formData.complexityId"
              clearable
              item-title="name"
              item-value="id"
              :items="complexities"
              label="Complexity"
              prepend-icon="mdi-gauge"
              variant="outlined"
            />
          </v-col>

          <!-- Planned Dates -->
          <v-col cols="6">
            <v-text-field
              v-model="formData.plannedStartDate"
              label="Planned Start Date"
              prepend-icon="mdi-calendar-start"
              type="date"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="formData.plannedEndDate"
              label="Planned End Date"
              prepend-icon="mdi-calendar-end"
              type="date"
              variant="outlined"
            />
          </v-col>

          <!-- Actual Dates -->
          <v-col cols="6">
            <v-text-field
              v-model="formData.actualStartDate"
              label="Actual Start Date"
              prepend-icon="mdi-calendar-check"
              type="date"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="formData.actualEndDate"
              label="Actual End Date"
              prepend-icon="mdi-calendar-check-outline"
              type="date"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="emit('cancel')">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!valid || loading"
        :loading="loading"
        type="submit"
        variant="elevated"
        @click="handleSubmit"
      >
        Create Task
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import type { VForm } from 'vuetify/components'
  import type { CreateTaskInput } from '../services/tasks'
  import { getProjects } from '../services/projects'
  import { getTasks } from '../services/tasks'
  import { getStaff } from '../services/staff'
  import { getStatuses } from '../services/status'
  import { getPriorities } from '../services/priority'
  import { getComplexities } from '../services/complexity'

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    submit: [data: CreateTaskInput]
  }>()

  /** Form reference for validation */
  const form = ref<VForm>()

  /** Form validation state */
  const valid = ref(false)

  /** Loading state for API calls */
  const loading = ref(false)

  /** Form data matching CreateTaskInput interface */
  const formData = ref<CreateTaskInput>({
    name: '',
    description: '',
    projectId: '',
    parentTaskId: undefined,
    evaluatorId: undefined,
    statusId: undefined,
    priorityId: undefined,
    complexityId: undefined,
    plannedStartDate: undefined,
    plannedEndDate: undefined,
    actualStartDate: undefined,
    actualEndDate: undefined,
  })

  /** Reference data for dropdowns */
  const projects = ref<Array<{ id: string, name: string }>>([])
  const tasks = ref<Array<{ id: string, name: string, projectId: string }>>([])
  const staffMembers = ref<Array<{ id: string, displayName: string }>>([])
  const statuses = ref<Array<{ id: string, name: string }>>([])
  const priorities = ref<Array<{ id: string, name: string }>>([])
  const complexities = ref<Array<{ id: string, name: string }>>([])

  /** Validation rules */
  const nameRules = [
    (v: string) => !!v || 'Task name is required',
    (v: string) => (v && v.length >= 2) || 'Task name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Task name must be less than 100 characters',
  ]

  const projectRules = [
    (v: string) => !!v || 'Project is required',
  ]

  /** Computed property for available parent tasks (tasks in the same project) */
  const availableParentTasks = computed(() => {
    if (!formData.value.projectId) return []
    
    return tasks.value
      .filter(task => task.projectId === formData.value.projectId)
      .map(task => ({
        id: task.id,
        displayName: task.name,
      }))
  })

  /** Load reference data */
  async function loadReferenceData() {
    try {
      const [
        projectsResponse,
        tasksResponse,
        staffResponse,
        statusesResponse,
        prioritiesResponse,
        complexitiesResponse,
      ] = await Promise.all([
        getProjects(),
        getTasks(),
        getStaff(),
        getStatuses(),
        getPriorities(),
        getComplexities(),
      ])

      projects.value = projectsResponse.projects
      tasks.value = tasksResponse.tasks
      staffMembers.value = staffResponse.staff.map(member => ({
        id: member.id,
        displayName: `${member.firstName} ${member.lastName} (${member.email})`,
      }))
      statuses.value = statusesResponse.statuses
      priorities.value = prioritiesResponse.priorities
      complexities.value = complexitiesResponse.complexities
    } catch (error) {
      console.error('Failed to load reference data:', error)
    }
  }

  /** Clear parent task when project changes */
  watch(() => formData.value.projectId, () => {
    formData.value.parentTaskId = undefined
  })

  /** Handle form submission */
  async function handleSubmit() {
    if (!form.value) return

    const { valid: isValid } = await form.value.validate()
    if (!isValid) return

    loading.value = true
    try {
      // Clean up empty string values to undefined for optional fields
      const cleanedData: CreateTaskInput = {
        name: formData.value.name,
        description: formData.value.description || undefined,
        projectId: formData.value.projectId,
        parentTaskId: formData.value.parentTaskId || undefined,
        evaluatorId: formData.value.evaluatorId || undefined,
        statusId: formData.value.statusId || undefined,
        priorityId: formData.value.priorityId || undefined,
        complexityId: formData.value.complexityId || undefined,
        plannedStartDate: formData.value.plannedStartDate || undefined,
        plannedEndDate: formData.value.plannedEndDate || undefined,
        actualStartDate: formData.value.actualStartDate || undefined,
        actualEndDate: formData.value.actualEndDate || undefined,
      }

      emit('submit', cleanedData)
    } finally {
      loading.value = false
    }
  }

  /** Load data when component mounts */
  onMounted(() => {
    loadReferenceData()
  })
</script>