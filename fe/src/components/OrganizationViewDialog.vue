<!--
  @fileoverview Organization View Dialog Component

  This component provides a read-only view of organization details.
  It follows the same design patterns as UserViewDialog.vue with proper
  formatting and display of all organization information.
-->

<template>
  <v-card width="600">
    <v-card-title>
      <v-icon class="mr-2">mdi-office-building</v-icon>
      Organization Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Organization Name"
            :model-value="organization.name"
            prepend-icon="mdi-office-building"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Organization ID"
            :model-value="organization.id"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Description"
            :model-value="organization.description || 'No description provided'"
            prepend-icon="mdi-text-box"
            readonly
            rows="3"
            variant="outlined"
          />
        </v-col>
        <v-col v-if="organization.rootDepartmentId" cols="6">
          <v-text-field
            label="Root Department ID"
            :model-value="organization.rootDepartmentId"
            prepend-icon="mdi-office-building-outline"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col v-if="organization.rootStaffId" cols="6">
          <v-text-field
            label="Root Staff ID"
            :model-value="organization.rootStaffId"
            prepend-icon="mdi-account"
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
  import type { Organization } from '../services/organizations'

  /** Component props */
  const _props = defineProps<{
    organization: Organization
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()
</script>
