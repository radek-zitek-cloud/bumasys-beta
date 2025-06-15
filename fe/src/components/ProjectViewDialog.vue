<!--
  @fileoverview Project View Dialog Component

  This component provides a read-only view of project details.
  It follows the same design patterns as DepartmentViewDialog.vue with proper
  formatting and display of all project information.
-->

<template>
  <v-card width="800">
    <v-card-title>
      <v-icon class="mr-2">mdi-clipboard-text-outline</v-icon>
      Project Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <!-- Project Name -->
        <v-col cols="12">
          <v-text-field
            label="Project Name"
            :model-value="project.name"
            prepend-icon="mdi-clipboard-text-outline"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Project ID -->
        <v-col cols="12">
          <v-text-field
            label="Project ID"
            :model-value="project.id"
            prepend-icon="mdi-identifier"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Description -->
        <v-col cols="12">
          <v-textarea
            label="Description"
            :model-value="project.description || 'No description provided'"
            prepend-icon="mdi-text-box"
            readonly
            rows="3"
            variant="outlined"
          />
        </v-col>

        <!-- Lead Staff -->
        <v-col cols="12">
          <v-text-field
            label="Lead Staff Member"
            :model-value="leadStaffDisplay"
            prepend-icon="mdi-account-supervisor"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Planned Dates -->
        <v-col cols="6">
          <v-text-field
            label="Planned Start Date"
            :model-value="formatDate(project.plannedStartDate)"
            prepend-icon="mdi-calendar-start"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Planned End Date"
            :model-value="formatDate(project.plannedEndDate)"
            prepend-icon="mdi-calendar-end"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Actual Dates -->
        <v-col cols="6">
          <v-text-field
            label="Actual Start Date"
            :model-value="formatDate(project.actualStartDate)"
            prepend-icon="mdi-calendar-check"
            readonly
            variant="outlined"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Actual End Date"
            :model-value="formatDate(project.actualEndDate)"
            prepend-icon="mdi-calendar-check-outline"
            readonly
            variant="outlined"
          />
        </v-col>

        <!-- Task Count (if available) -->
        <v-col v-if="project.tasks" cols="12">
          <v-text-field
            label="Number of Tasks"
            :model-value="project.tasks.length"
            prepend-icon="mdi-clipboard-list-outline"
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
  import { computed } from 'vue'
  import type { Project } from '../services/projects'

  /** Component props */
  const props = defineProps<{
    project: Project
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Computed property for lead staff display */
  const leadStaffDisplay = computed(() => {
    if (!props.project.leadStaff) {
      return 'No lead staff assigned'
    }
    return `${props.project.leadStaff.firstName} ${props.project.leadStaff.lastName} (${props.project.leadStaff.email})`
  })

  /**
   * Format date string for display
   * @param dateString - ISO date string or undefined
   * @returns Formatted date or 'Not set'
   */
  function formatDate(dateString?: string): string {
    if (!dateString) return 'Not set'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }
</script>