<!--
  @fileoverview Project Create Dialog Component

  This component provides a form for creating new projects.
  It follows the same design patterns as UserCreateDialog.vue with proper
  validation and error handling.
-->

<template>
  <v-card width="800">
    <v-card-title>
      <v-icon class="mr-2">mdi-clipboard-plus-outline</v-icon>
      Create New Project
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
        Create Project
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import type { VForm } from 'vuetify/components'
  import type { CreateProjectInput } from '../services/projects'
  import { getStaff } from '../services/staff'

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    submit: [data: CreateProjectInput]
  }>()

  /** Form reference for validation */
  const form = ref<VForm>()

  /** Form validation state */
  const valid = ref(false)

  /** Loading state for API calls */
  const loading = ref(false)

  /** Form data matching CreateProjectInput interface */
  const formData = ref<CreateProjectInput>({
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
  async function loadStaffMembers() {
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

  /** Handle form submission */
  async function handleSubmit() {
    if (!form.value) return

    const { valid: isValid } = await form.value.validate()
    if (!isValid) return

    loading.value = true
    try {
      // Clean up empty string values to undefined for optional fields
      const cleanedData: CreateProjectInput = {
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

  /** Load data when component mounts */
  onMounted(() => {
    loadStaffMembers()
  })
</script>