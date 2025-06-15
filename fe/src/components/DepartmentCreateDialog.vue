<!--
  @fileoverview Department Create Dialog Component

  This component provides a form interface for creating new departments.
  It includes dropdown selection for organization and parent department.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Create New Department</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Department Name *"
              prepend-icon="mdi-office-building-outline"
              required
              :rules="nameRules"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.organizationId"
              :items="organizationOptions"
              label="Organization *"
              prepend-icon="mdi-office-building"
              required
              :rules="organizationRules"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.parentDepartmentId"
              clearable
              :items="parentDepartmentOptions"
              label="Parent Department"
              prepend-icon="mdi-file-tree"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              prepend-icon="mdi-text-box"
              rows="3"
              :rules="descriptionRules"
            />
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
          Create Department
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { CreateDepartmentInput, Department } from '../services/departments'
  import type { Organization } from '../services/organizations'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    organizations: Organization[]
    departments: Department[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [department: CreateDepartmentInput]
  }>()

  /** Form data reactive object */
  const form = reactive<CreateDepartmentInput>({
    name: '',
    description: '',
    organizationId: '',
    parentDepartmentId: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Organization options for dropdown */
  const organizationOptions = computed(() =>
    props.organizations.map(org => ({
      title: org.name,
      value: org.id,
    })),
  )

  /** Parent department options filtered by selected organization */
  const parentDepartmentOptions = computed(() => {
    if (!form.organizationId) return []
    return props.departments
      .filter(dept => dept.organizationId === form.organizationId)
      .map(dept => ({
        title: dept.name,
        value: dept.id,
      }))
  })

  /** Validation rules for department name */
  const nameRules = [
    (v: string) => !!v || 'Department name is required',
    (v: string) => (v && v.length >= 2) || 'Name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Name must be less than 100 characters',
  ]

  /** Validation rules for organization */
  const organizationRules = [
    (v: string) => !!v || 'Organization is required',
  ]

  /** Validation rules for description */
  const descriptionRules = [
    (v: string) => !v || v.length <= 500 || 'Description must be less than 500 characters',
  ]

  /**
   * Handle form submission
   * Validates form data and emits created event with department data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.name || !form.organizationId) {
      return
    }

    processing.value = true
    try {
      // Clean up empty parent department ID
      const departmentData = { ...form }
      if (!departmentData.parentDepartmentId) {
        delete departmentData.parentDepartmentId
      }

      // Emit the department data to parent for actual API call
      emit('created', departmentData)
    } finally {
      processing.value = false
    }
  }
</script>
