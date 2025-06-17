<!--
  @fileoverview Organization Table Component

  Displays organizations in a data table with search functionality and action buttons.
  Provides a clean, reusable interface for organization management operations.
-->

<template>
  <v-card class="mb-6">
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Organizations ({{ filteredOrganizations.length }})</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          @click="$emit('create')"
        >
          Add Organization
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle>
      <v-text-field
        clearable
        density="compact"
        hide-details
        label="Search organizations..."
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @update:model-value="$emit('update:search', $event)"
      />
    </v-card-subtitle>

    <v-data-table
      density="compact"
      :headers="headers"
      :items="filteredOrganizations"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :loading="loading"
      no-data-text="No organizations found"
    >
      <!-- Custom Name Column -->
      <template #item.name="{ item }">
        <div>
          <div class="text-body-1 font-weight-medium">{{ item.name }}</div>
        </div>
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
  import type { Organization } from '../../services/organizations'

  /**
   * Component props
   */
  interface Props {
    filteredOrganizations: Organization[]
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
    (e: 'edit', organization: Organization): void
    (e: 'view', organization: Organization): void
    (e: 'delete', organization: Organization): void
    (e: 'update:search', value: string): void
  }

  defineProps<Props>()
  defineEmits<Emits>()
</script>
