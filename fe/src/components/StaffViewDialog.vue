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
            label="Staff ID"
            :model-value="staff.id"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Organization ID"
            :model-value="staff.organizationId"
            prepend-icon="mdi-office-building"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Department ID"
            :model-value="staff.departmentId"
            prepend-icon="mdi-office-building-outline"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col v-if="staff.supervisorId" cols="12">
          <v-text-field
            label="Supervisor ID"
            :model-value="staff.supervisorId"
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
  import type { Staff } from '../services/staff'

  /** Component props */
  const _props = defineProps<{
    staff: Staff
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()
</script>
