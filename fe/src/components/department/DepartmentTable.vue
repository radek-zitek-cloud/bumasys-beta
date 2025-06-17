<!--
  @fileoverview Department Table Component

  Displays departments in a data table with search functionality and action buttons.
  Provides a clean, reusable interface for department management operations.
-->

<template>
  <v-card class="mb-6">
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Departments ({{ filteredDepartments.length }})</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          @click="$emit('create')"
        >
          Add Department
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle>
      <v-text-field
        clearable
        density="compact"
        hide-details
        label="Search departments..."
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @update:model-value="$emit('update:search', $event)"
      />
    </v-card-subtitle>

    <v-data-table
      density="compact"
      :headers="headers"
      :items="filteredDepartments"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :loading="loading"
      no-data-text="No departments found"
    >
      <!-- Custom Name Column -->
      <template #item.name="{ item }">
        <div>
          <div class="text-body-1 font-weight-medium">{{ item.name }}</div>
        </div>
      </template>

      <!-- Organization Column -->
      <template #item.organizationId="{ item }">
        <v-chip
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ getOrganizationName(item.organizationId) }}
        </v-chip>
      </template>

      <!-- Manager Column -->
      <template #item.managerId="{ item }">
        <span v-if="item.managerId" class="text-body-2">
          {{ getStaffName(item.managerId) }}
        </span>
        <span v-else class="text-caption text-medium-emphasis">No manager assigned</span>
      </template>

      <!-- Description Column -->
      <template #item.description="{ item }">
        <span v-if="item.description" class="text-body-2">
          {{ item.description }}
        </span>
        <span v-else class="text-caption text-medium-emphasis">No description</span>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="$emit('view', item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="$emit('edit', item)"
          />
          <v-btn
            icon="mdi-file-tree"
            size="small"
            variant="text"
            @click="$emit('tree', item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            @click="$emit('delete', item)"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
  import type { DataTableHeaders } from '../../composables/shared/useDataTableConfig'
  import type { Department } from '../../services/departments'

  /**
   * Component props
   */
  interface Props {
    filteredDepartments: Department[]
    getOrganizationName: (id: string) => string
    getStaffName: (id: string) => string
    headers: DataTableHeaders
    itemsPerPage: number
    itemsPerPageOptions: Array<{ value: number, title: string }>
    loading: boolean
    search: string
  }

  /**
   * Component events
   */
  interface Emits {
    (e: 'create'): void
    (e: 'edit', department: Department): void
    (e: 'view', department: Department): void
    (e: 'delete', department: Department): void
    (e: 'tree', department: Department): void
    (e: 'update:search', value: string): void
  }

  defineProps<Props>()
  defineEmits<Emits>()
</script>
