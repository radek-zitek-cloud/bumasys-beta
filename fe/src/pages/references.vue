<!--
  @fileoverview Reference Data Management Page

  This page provides a comprehensive interface for managing reference data including
  Status, Priority, and Complexity entities. It follows the design patterns
  established in the user management interface.
-->

<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 mb-2">Reference Data Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage system reference data including status, priority, and complexity values
        </p>
      </div>
    </div>

    <!-- Reference Data Tables -->
    <v-row>
      <!-- Status Management -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Status ({{ filteredStatuses.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openStatusCreateDialog"
              >
                Add Status
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="statusSearch"
              clearable
              density="compact"
              hide-details
              label="Search statuses..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="statusHeaders"
            :items="filteredStatuses"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="statusLoading"
            no-data-text="No statuses found"
          >
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openStatusEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Status</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openStatusDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Status</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Priority Management -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Priority ({{ filteredPriorities.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openPriorityCreateDialog"
              >
                Add Priority
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="prioritySearch"
              clearable
              density="compact"
              hide-details
              label="Search priorities..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="priorityHeaders"
            :items="filteredPriorities"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="priorityLoading"
            no-data-text="No priorities found"
          >
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openPriorityEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Priority</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openPriorityDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Priority</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Complexity Management -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Complexity ({{ filteredComplexities.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openComplexityCreateDialog"
              >
                Add Complexity
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="complexitySearch"
              clearable
              density="compact"
              hide-details
              label="Search complexities..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="complexityHeaders"
            :items="filteredComplexities"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="complexityLoading"
            no-data-text="No complexities found"
          >
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openComplexityEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Complexity</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openComplexityDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Complexity</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Status Dialogs -->
    <v-dialog v-model="showStatusCreateDialog" max-width="500" persistent>
      <StatusCreateDialog
        @cancel="closeStatusCreateDialog"
        @submit="handleCreateStatus"
      />
    </v-dialog>

    <v-dialog v-model="showStatusEditDialog" max-width="500" persistent>
      <StatusEditDialog
        :status="selectedStatus"
        @cancel="closeStatusEditDialog"
        @submit="handleUpdateStatus"
      />
    </v-dialog>

    <v-dialog v-model="showStatusDeleteDialog" max-width="400" persistent>
      <StatusDeleteDialog
        :status="selectedStatus"
        @cancel="closeStatusDeleteDialog"
        @confirm="handleDeleteStatus"
      />
    </v-dialog>

    <!-- Priority Dialogs -->
    <v-dialog v-model="showPriorityCreateDialog" max-width="500" persistent>
      <PriorityCreateDialog
        @cancel="closePriorityCreateDialog"
        @submit="handleCreatePriority"
      />
    </v-dialog>

    <v-dialog v-model="showPriorityEditDialog" max-width="500" persistent>
      <PriorityEditDialog
        :priority="selectedPriority"
        @cancel="closePriorityEditDialog"
        @submit="handleUpdatePriority"
      />
    </v-dialog>

    <v-dialog v-model="showPriorityDeleteDialog" max-width="400" persistent>
      <PriorityDeleteDialog
        :priority="selectedPriority"
        @cancel="closePriorityDeleteDialog"
        @confirm="handleDeletePriority"
      />
    </v-dialog>

    <!-- Complexity Dialogs -->
    <v-dialog v-model="showComplexityCreateDialog" max-width="500" persistent>
      <ComplexityCreateDialog
        @cancel="closeComplexityCreateDialog"
        @submit="handleCreateComplexity"
      />
    </v-dialog>

    <v-dialog v-model="showComplexityEditDialog" max-width="500" persistent>
      <ComplexityEditDialog
        :complexity="selectedComplexity"
        @cancel="closeComplexityEditDialog"
        @submit="handleUpdateComplexity"
      />
    </v-dialog>

    <v-dialog v-model="showComplexityDeleteDialog" max-width="400" persistent>
      <ComplexityDeleteDialog
        :complexity="selectedComplexity"
        @cancel="closeComplexityDeleteDialog"
        @confirm="handleDeleteComplexity"
      />
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { VDataTable } from 'vuetify/components'
  import type { CreateComplexityInput, UpdateComplexityInput } from '../services/complexity'
  import type { CreatePriorityInput, UpdatePriorityInput } from '../services/priority'
  import type { CreateStatusInput, UpdateStatusInput } from '../services/status'
  import { onMounted, ref } from 'vue'
  import { useComplexityManagement } from '../composables/references/useComplexityManagement'
  import { usePriorityManagement } from '../composables/references/usePriorityManagement'
  import { useStatusManagement } from '../composables/references/useStatusManagement'

  /** Data table configuration */
  type DataTableHeaders = VDataTable['$props']['headers']

  const statusHeaders: DataTableHeaders = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '120px',
    },
  ]

  const priorityHeaders: DataTableHeaders = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '120px',
    },
  ]

  const complexityHeaders: DataTableHeaders = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '120px',
    },
  ]

  // Initialize management composables
  const statusManagement = useStatusManagement()
  const priorityManagement = usePriorityManagement()
  const complexityManagement = useComplexityManagement()

  // Destructure for easier access
  const {
    statuses,
    selectedStatus,
    statusSearch,
    loading: statusLoading,
    filteredStatuses,
    loadStatuses,
    createStatus,
    updateStatus,
    deleteStatus,
    showStatusCreateDialog,
    showStatusEditDialog,
    showStatusDeleteDialog,
    openCreateDialog: openStatusCreateDialog,
    closeCreateDialog: closeStatusCreateDialog,
    openEditDialog: openStatusEditDialog,
    closeEditDialog: closeStatusEditDialog,
    openDeleteDialog: openStatusDeleteDialog,
    closeDeleteDialog: closeStatusDeleteDialog,
  } = statusManagement

  const {
    priorities,
    selectedPriority,
    prioritySearch,
    loading: priorityLoading,
    filteredPriorities,
    loadPriorities,
    createPriority,
    updatePriority,
    deletePriority,
    showPriorityCreateDialog,
    showPriorityEditDialog,
    showPriorityDeleteDialog,
    openCreateDialog: openPriorityCreateDialog,
    closeCreateDialog: closePriorityCreateDialog,
    openEditDialog: openPriorityEditDialog,
    closeEditDialog: closePriorityEditDialog,
    openDeleteDialog: openPriorityDeleteDialog,
    closeDeleteDialog: closePriorityDeleteDialog,
  } = priorityManagement

  const {
    complexities,
    selectedComplexity,
    complexitySearch,
    loading: complexityLoading,
    filteredComplexities,
    loadComplexities,
    createComplexity,
    updateComplexity,
    deleteComplexity,
    showComplexityCreateDialog,
    showComplexityEditDialog,
    showComplexityDeleteDialog,
    openCreateDialog: openComplexityCreateDialog,
    closeCreateDialog: closeComplexityCreateDialog,
    openEditDialog: openComplexityEditDialog,
    closeEditDialog: closeComplexityEditDialog,
    openDeleteDialog: openComplexityDeleteDialog,
    closeDeleteDialog: closeComplexityDeleteDialog,
  } = complexityManagement

  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  /** Initialize page data */
  onMounted(async () => {
    await Promise.all([
      loadStatuses(),
      loadPriorities(),
      loadComplexities(),
    ])
  })

  /** Handler functions for dialogs */
  async function handleCreateStatus (statusData: CreateStatusInput) {
    await createStatus(statusData)
  }

  async function handleUpdateStatus (statusData: UpdateStatusInput) {
    await updateStatus(statusData)
  }

  async function handleDeleteStatus () {
    if (!selectedStatus.value) return
    await deleteStatus(selectedStatus.value.id)
  }

  async function handleCreatePriority (priorityData: CreatePriorityInput) {
    await createPriority(priorityData)
  }

  async function handleUpdatePriority (priorityData: UpdatePriorityInput) {
    await updatePriority(priorityData)
  }

  async function handleDeletePriority () {
    if (!selectedPriority.value) return
    await deletePriority(selectedPriority.value.id)
  }

  async function handleCreateComplexity (complexityData: CreateComplexityInput) {
    await createComplexity(complexityData)
  }

  async function handleUpdateComplexity (complexityData: UpdateComplexityInput) {
    await updateComplexity(complexityData)
  }

  async function handleDeleteComplexity () {
    if (!selectedComplexity.value) return
    await deleteComplexity(selectedComplexity.value.id)
  }
</script>
