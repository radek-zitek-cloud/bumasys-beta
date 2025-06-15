<!--
  @fileoverview Staff View Dialog Component

  This component provides a read-only view of staff member details.
  It follows the same design patterns as OrganizationViewDialog.vue with proper
  formatting and display of all staff information.
-->

<template>
  <v-card width="600">
    <v-card-title>
      <v-icon class="mr-2">mdi-account</v-icon>
      Staff Member Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-text-field
            label="First Name"
            :model-value="staff.firstName"
            prepend-icon="mdi-account"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Last Name"
            :model-value="staff.lastName"
            prepend-icon="mdi-account"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Email"
            :model-value="staff.email"
            prepend-icon="mdi-email"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Phone"
            :model-value="staff.phone || 'Not provided'"
            prepend-icon="mdi-phone"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Role"
            :model-value="staff.role"
            prepend-icon="mdi-briefcase"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Staff"
            :model-value="staffDisplay"
            prepend-icon="mdi-account"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Organization"
            :model-value="organizationDisplay"
            prepend-icon="mdi-office-building"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Department"
            :model-value="departmentDisplay"
            prepend-icon="mdi-office-building-outline"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col v-if="staff.supervisorId" cols="12">
          <v-text-field
            label="Supervisor"
            :model-value="supervisorDisplay"
            prepend-icon="mdi-account-supervisor"
            readonly
            variant="outlined"
          />
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
  import type { Department } from '../../services/departments'
  import type { Organization } from '../../services/organizations'
  import type { Staff } from '../../services/staff'
  import { computed } from 'vue'

  /** Component props */
  const props = defineProps<{
    staff: Staff
    organizations?: Organization[]
    departments?: Department[]
    allStaff?: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Computed properties for display */
  const staffDisplay = computed(() => {
    return `${props.staff.firstName} ${props.staff.lastName} (${props.staff.id})`
  })

  const organizationDisplay = computed(() => {
    if (!props.organizations) {
      return `Unknown Organization (${props.staff.organizationId})`
    }
    const org = props.organizations.find(o => o.id === props.staff.organizationId)
    return org ? `${org.name} (${org.id})` : `Unknown Organization (${props.staff.organizationId})`
  })

  const departmentDisplay = computed(() => {
    if (!props.departments) {
      return `Unknown Department (${props.staff.departmentId})`
    }
    const dept = props.departments.find(d => d.id === props.staff.departmentId)
    return dept ? `${dept.name} (${dept.id})` : `Unknown Department (${props.staff.departmentId})`
  })

  const supervisorDisplay = computed(() => {
    if (!props.staff.supervisorId || !props.allStaff) {
      return `Unknown Supervisor (${props.staff.supervisorId})`
    }
    const supervisor = props.allStaff.find(s => s.id === props.staff.supervisorId)
    return supervisor
      ? `${supervisor.firstName} ${supervisor.lastName} (${supervisor.id})`
      : `Unknown Supervisor (${props.staff.supervisorId})`
  })
</script>
