<!--
  @fileoverview Staff Create Dialog Component

  This component provides a form interface for creating new staff members.
  It includes dropdown selection for organization, department, and supervisor.
-->

<template>
  <v-card width="700">
    <form @submit.prevent="onSubmit">
      <v-card-title>Create New Staff Member</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.firstName"
              label="First Name *"
              prepend-icon="mdi-account"
              required
              :rules="firstNameRules"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.lastName"
              label="Last Name *"
              prepend-icon="mdi-account"
              required
              :rules="lastNameRules"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              label="Email *"
              prepend-icon="mdi-email"
              required
              :rules="emailRules"
              type="email"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.phone"
              label="Phone"
              prepend-icon="mdi-phone"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.role"
              label="Role *"
              prepend-icon="mdi-briefcase"
              required
              :rules="roleRules"
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
              @update:model-value="onOrganizationChange"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.departmentId"
              :items="departmentOptions"
              label="Department *"
              prepend-icon="mdi-office-building-outline"
              required
              :rules="departmentRules"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.supervisorId"
              clearable
              :items="supervisorOptions"
              label="Supervisor"
              prepend-icon="mdi-account-supervisor"
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
          Create Staff Member
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Department } from '../../services/departments'
  import type { Organization } from '../../services/organizations'
  import type { CreateStaffInput, Staff } from '../../services/staff'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    organizations: Organization[]
    departments: Department[]
    staff: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [staff: CreateStaffInput]
  }>()

  /** Form data reactive object */
  const form = reactive<CreateStaffInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    organizationId: '',
    departmentId: '',
    supervisorId: '',
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

  /** Department options filtered by selected organization */
  const departmentOptions = computed(() => {
    if (!form.organizationId) return []
    return props.departments
      .filter(dept => dept.organizationId === form.organizationId)
      .map(dept => ({
        title: dept.name,
        value: dept.id,
      }))
  })

  /** Supervisor options from staff in the same organization */
  const supervisorOptions = computed(() => {
    if (!form.organizationId) return []
    return props.staff
      .filter(member => member.organizationId === form.organizationId)
      .map(member => ({
        title: `${member.firstName} ${member.lastName}`,
        value: member.id,
      }))
  })

  /** Validation rules */
  const firstNameRules = [
    (v: string) => !!v || 'First name is required',
    (v: string) => (v && v.length > 0) || 'First name must be at least 1 character',
    (v: string) => (v && v.length <= 50) || 'First name must be less than 50 characters',
  ]

  const lastNameRules = [
    (v: string) => !!v || 'Last name is required',
    (v: string) => (v && v.length > 0) || 'Last name must be at least 1 character',
    (v: string) => (v && v.length <= 50) || 'Last name must be less than 50 characters',
  ]

  const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  const roleRules = [
    (v: string) => !!v || 'Role is required',
    (v: string) => (v && v.length >= 2) || 'Role must be at least 2 characters',
    (v: string) => (v && v.length <= 50) || 'Role must be less than 50 characters',
  ]

  const organizationRules = [
    (v: string) => !!v || 'Organization is required',
  ]

  const departmentRules = [
    (v: string) => !!v || 'Department is required',
  ]

  /** Handle organization change - reset department and supervisor */
  function onOrganizationChange () {
    form.departmentId = ''
    form.supervisorId = ''
  }

  /**
   * Handle form submission
   * Validates form data and emits created event with staff data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.email || !form.role || !form.organizationId || !form.departmentId) {
      return
    }

    processing.value = true
    try {
      // Clean up empty optional fields
      const staffData = { ...form }
      if (!staffData.phone) {
        delete staffData.phone
      }
      if (!staffData.supervisorId) {
        delete staffData.supervisorId
      }

      // Emit the staff data to parent for actual API call
      emit('created', staffData)
    } finally {
      processing.value = false
    }
  }
</script>
