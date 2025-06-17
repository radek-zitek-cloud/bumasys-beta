<!--
  @fileoverview Staff Table Component

  Displays staff members in a data table with search functionality and action buttons.
  Provides a clean, reusable interface for staff management operations.
-->

<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Staff ({{ filteredStaff.length }})</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          @click="$emit('create')"
        >
          Add Staff Member
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle>
      <v-text-field
        clearable
        density="compact"
        hide-details
        label="Search staff..."
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @update:model-value="$emit('update:search', $event)"
      />
    </v-card-subtitle>

    <v-data-table
      density="compact"
      :headers="headers"
      :items="filteredStaff"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :loading="loading"
      no-data-text="No staff members found"
    >
      <!-- Custom Name Column -->
      <template #item.name="{ item }">
        <div>
          <div class="text-body-1 font-weight-medium">
            {{ item.firstName }} {{ item.lastName }}
          </div>
        </div>
      </template>

      <!-- Email Column -->
      <template #item.email="{ item }">
        <span class="text-body-2">{{ item.email }}</span>
      </template>

      <!-- Role Column -->
      <template #item.role="{ item }">
        <v-chip
          color="secondary"
          size="small"
          variant="tonal"
        >
          {{ item.role }}
        </v-chip>
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

      <!-- Department Column -->
      <template #item.departmentId="{ item }">
        <v-chip
          color="info"
          size="small"
          variant="tonal"
        >
          {{ getDepartmentName(item.departmentId) }}
        </v-chip>
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
            icon="mdi-account-plus"
            size="small"
            variant="text"
            @click="$emit('create-user', item)"
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
  import type { Staff } from '../../services/staff'

  /**
   * Component props
   */
  interface Props {
    filteredStaff: Staff[]
    getDepartmentName: (id: string) => string
    getOrganizationName: (id: string) => string
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
    (e: 'edit', staff: Staff): void
    (e: 'view', staff: Staff): void
    (e: 'delete', staff: Staff): void
    (e: 'tree', staff: Staff): void
    (e: 'create-user', staff: Staff): void
    (e: 'update:search', value: string): void
  }

  defineProps<Props>()
  defineEmits<Emits>()
</script>
