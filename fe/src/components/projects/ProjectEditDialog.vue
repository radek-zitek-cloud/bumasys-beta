<!--
  @fileoverview Project Edit Dialog Component

  This component provides a form for editing existing projects.
  It follows the same design patterns as UserEditDialog.vue with proper
  pre-population of data and validation.
-->

<template>
  <v-card width="800">
    <v-card-title>
      <v-icon class="mr-2">mdi-pencil</v-icon>
      Edit Project
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
        <v-row>
          <!-- Project Name -->
          <v-col cols="12">
            <v-text-field
              v-model="formData.name"
              label="Project Name"
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

          <!-- Lead Staff -->
          <v-col cols="12">
            <v-select
              v-model="formData.leadStaffId"
              clearable
              item-title="displayName"
              item-value="id"
              :items="staffMembers"
              label="Lead Staff Member"
              prepend-icon="mdi-account-supervisor"
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
        Update Project
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { VForm } from 'vuetify/components'
  import type { Project, UpdateProjectInput } from '../../services/projects'
  import { onMounted, ref, watch } from 'vue'
  import { getStaff } from '../../services/staff'

  /** Component props */
  const props = defineProps<{
    project: Project
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    submit: [data: UpdateProjectInput]
  }>()

  /** Form reference for validation */
  const form = ref<VForm>()

  /** Form validation state */
  const valid = ref(false)

  /** Loading state for API calls */
  const loading = ref(false)

  /** Form data matching UpdateProjectInput interface */
  const formData = ref<UpdateProjectInput>({
    id: '',
    name: '',
    description: '',
    leadStaffId: undefined,
    plannedStartDate: undefined,
    plannedEndDate: undefined,
    actualStartDate: undefined,
    actualEndDate: undefined,
  })

  /** Staff members for lead staff dropdown */
  const staffMembers = ref<Array<{ id: string, displayName: string }>>([])

  /** Validation rules for project name */
  const nameRules = [
    (v: string) => !!v || 'Project name is required',
    (v: string) => (v && v.length >= 2) || 'Project name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Project name must be less than 100 characters',
  ]

  /** Load staff members for lead staff selection */
  async function loadStaffMembers () {
    try {
      const { staff } = await getStaff()
      staffMembers.value = staff.map(member => ({
        id: member.id,
        displayName: `${member.firstName} ${member.lastName} (${member.email})`,
      }))
    } catch (error) {
      console.error('Failed to load staff members:', error)
    }
  }

  /** Populate form data from props */
  function populateForm () {
    formData.value = {
      id: props.project.id,
      name: props.project.name,
      description: props.project.description || '',
      leadStaffId: props.project.leadStaffId || undefined,
      plannedStartDate: props.project.plannedStartDate || undefined,
      plannedEndDate: props.project.plannedEndDate || undefined,
      actualStartDate: props.project.actualStartDate || undefined,
      actualEndDate: props.project.actualEndDate || undefined,
    }
  }

  /** Handle form submission */
  async function handleSubmit () {
    if (!form.value) return

    const { valid: isValid } = await form.value.validate()
    if (!isValid) return

    loading.value = true
    try {
      // Clean up empty string values to undefined for optional fields
      const cleanedData: UpdateProjectInput = {
        id: formData.value.id,
        name: formData.value.name,
        description: formData.value.description || undefined,
        leadStaffId: formData.value.leadStaffId || undefined,
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

  /** Watch for changes to the project prop and repopulate form */
  watch(() => props.project, populateForm, { immediate: true })

  /** Load data when component mounts */
  onMounted(() => {
    loadStaffMembers()
    populateForm()
  })
</script>
