<!--
  @fileoverview Department View Dialog Component

  This component provides a read-only view of department details.
  It follows the same design patterns as OrganizationViewDialog.vue with proper
  formatting and display of all department information.
-->

<template>
  <v-card width="600">
    <v-card-title>
      <v-icon class="mr-2">mdi-office-building-outline</v-icon>
      Department Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Department Name"
            :model-value="department.name"
            prepend-icon="mdi-office-building-outline"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Department ID"
            :model-value="department.id"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Description"
            :model-value="department.description || 'No description provided'"
            prepend-icon="mdi-text-box"
            readonly
            rows="3"
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
        <v-col v-if="department.parentDepartmentId" cols="6">
          <v-text-field
            label="Parent Department ID"
            :model-value="department.parentDepartmentId"
            prepend-icon="mdi-file-tree"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col v-if="managerDisplay" cols="6">
          <v-text-field
            label="Manager"
            :model-value="managerDisplay"
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
  import type { Department } from '../services/departments'
  import type { Organization } from '../services/organizations'
  import type { Staff } from '../services/staff'
  import { computed } from 'vue'

  /** Component props */
  const props = defineProps<{
    department: Department
    organizations: Organization[]
    staff: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Get organization display name with ID */
  const organizationDisplay = computed(() => {
    const org = props.organizations.find(o => o.id === props.department.organizationId)
    return org ? `${org.name} (ID: ${org.id})` : `Unknown (ID: ${props.department.organizationId})`
  })

  /** Get manager display name with ID */
  const managerDisplay = computed(() => {
    if (!props.department.managerId) return null
    const manager = props.staff.find(s => s.id === props.department.managerId)
    return manager 
      ? `${manager.firstName} ${manager.lastName} (ID: ${manager.id})` 
      : `Unknown (ID: ${props.department.managerId})`
  })
</script>
