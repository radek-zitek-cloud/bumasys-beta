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
            :model-value="organization.name"
            label="Organization Name"
            prepend-icon="mdi-office-building"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            :model-value="organization.id"
            label="Organization ID"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            :model-value="organization.description || 'No description provided'"
            label="Description"
            prepend-icon="mdi-text-box"
            readonly
            rows="3"
            variant="outlined"
          />
        </v-col>
        <v-col cols="6" v-if="organization.rootDepartmentId">
          <v-text-field
            :model-value="organization.rootDepartmentId"
            label="Root Department ID"
            prepend-icon="mdi-office-building-outline"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6" v-if="organization.rootStaffId">
          <v-text-field
            :model-value="organization.rootStaffId"
            label="Root Staff ID"
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
  const props = defineProps<{
    organization: Organization
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()
</script>