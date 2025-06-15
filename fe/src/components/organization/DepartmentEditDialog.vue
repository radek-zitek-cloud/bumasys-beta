<!--
  @fileoverview Department Edit Dialog Component

  This component provides a form interface for editing existing departments.
  It includes dropdown selection for organization and parent department.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Department</v-card-title>
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
              v-model="form.parentDepartmentId"
              clearable
              :items="parentDepartmentOptions"
              label="Parent Department"
              prepend-icon="mdi-file-tree"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.managerId"
              clearable
              :items="managerOptions"
              label="Manager"
              prepend-icon="mdi-account-supervisor"
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
          Update Department
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Department, UpdateDepartmentInput } from '../../services/departments'
  import type { Staff } from '../../services/staff'
  import { computed, reactive, ref, watch } from 'vue'

  /** Component props */
  const props = defineProps<{
    department: Department
    departments: Department[]
    staff: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    updated: [department: UpdateDepartmentInput]
  }>()

  /** Form data reactive object */
  const form = reactive<Omit<UpdateDepartmentInput, 'id'>>({
    name: '',
    description: '',
    parentDepartmentId: '',
    managerId: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Parent department options filtered by same organization, excluding self */
  const parentDepartmentOptions = computed(() => {
    return props.departments
      .filter(dept =>
        dept.organizationId === props.department.organizationId
        && dept.id !== props.department.id,
      )
      .map(dept => ({
        title: dept.name,
        value: dept.id,
      }))
  })

  /** Manager options from staff in the same organization */
  const managerOptions = computed(() => {
    return props.staff
      .filter(member => member.organizationId === props.department.organizationId)
      .map(member => ({
        title: `${member.firstName} ${member.lastName}`,
        value: member.id,
      }))
  })

  /** Validation rules for department name */
  const nameRules = [
    (v: string) => !!v || 'Department name is required',
    (v: string) => (v && v.length >= 2) || 'Name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Name must be less than 100 characters',
  ]

  /** Validation rules for description */
  const descriptionRules = [
    (v: string) => !v || v.length <= 500 || 'Description must be less than 500 characters',
  ]

  /** Watch for changes to the department prop and update form */
  watch(
    () => props.department,
    newDepartment => {
      if (newDepartment) {
        form.name = newDepartment.name
        form.description = newDepartment.description || ''
        form.parentDepartmentId = newDepartment.parentDepartmentId || ''
        form.managerId = newDepartment.managerId || ''
      }
    },
    { immediate: true },
  )

  /**
   * Handle form submission
   * Validates form data and emits updated event with department data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.name) {
      return
    }

    processing.value = true
    try {
      // Clean up empty optional fields
      const departmentData = { ...form }
      if (!departmentData.parentDepartmentId) {
        delete departmentData.parentDepartmentId
      }
      if (!departmentData.managerId) {
        delete departmentData.managerId
      }

      // Emit the department data to parent for actual API call
      emit('updated', {
        id: props.department.id,
        ...departmentData,
      })
    } finally {
      processing.value = false
    }
  }
</script>
