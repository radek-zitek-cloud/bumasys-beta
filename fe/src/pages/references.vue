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
        @cancel="showStatusCreateDialog = false"
        @submit="handleCreateStatus"
      />
    </v-dialog>

    <v-dialog v-model="showStatusEditDialog" max-width="500" persistent>
      <StatusEditDialog
        :status="selectedStatus"
        @cancel="showStatusEditDialog = false"
        @submit="handleUpdateStatus"
      />
    </v-dialog>

    <v-dialog v-model="showStatusDeleteDialog" max-width="400" persistent>
      <StatusDeleteDialog
        :status="selectedStatus"
        @cancel="showStatusDeleteDialog = false"
        @confirm="handleDeleteStatus"
      />
    </v-dialog>

    <!-- Priority Dialogs -->
    <v-dialog v-model="showPriorityCreateDialog" max-width="500" persistent>
      <PriorityCreateDialog
        @cancel="showPriorityCreateDialog = false"
        @submit="handleCreatePriority"
      />
    </v-dialog>

    <v-dialog v-model="showPriorityEditDialog" max-width="500" persistent>
      <PriorityEditDialog
        :priority="selectedPriority"
        @cancel="showPriorityEditDialog = false"
        @submit="handleUpdatePriority"
      />
    </v-dialog>

    <v-dialog v-model="showPriorityDeleteDialog" max-width="400" persistent>
      <PriorityDeleteDialog
        :priority="selectedPriority"
        @cancel="showPriorityDeleteDialog = false"
        @confirm="handleDeletePriority"
      />
    </v-dialog>

    <!-- Complexity Dialogs -->
    <v-dialog v-model="showComplexityCreateDialog" max-width="500" persistent>
      <ComplexityCreateDialog
        @cancel="showComplexityCreateDialog = false"
        @submit="handleCreateComplexity"
      />
    </v-dialog>

    <v-dialog v-model="showComplexityEditDialog" max-width="500" persistent>
      <ComplexityEditDialog
        :complexity="selectedComplexity"
        @cancel="showComplexityEditDialog = false"
        @submit="handleUpdateComplexity"
      />
    </v-dialog>

    <v-dialog v-model="showComplexityDeleteDialog" max-width="400" persistent>
      <ComplexityDeleteDialog
        :complexity="selectedComplexity"
        @cancel="showComplexityDeleteDialog = false"
        @confirm="handleDeleteComplexity"
      />
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { VDataTable } from 'vuetify/components'
  import type { Complexity, CreateComplexityInput, UpdateComplexityInput } from '../services/complexity'

  import type { CreatePriorityInput, Priority, UpdatePriorityInput } from '../services/priority'
  import type { CreateStatusInput, Status, UpdateStatusInput } from '../services/status'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useNotifications } from '../composables/useNotifications'
  import * as complexityService from '../services/complexity'
  import * as priorityService from '../services/priority'
  import * as statusService from '../services/status'

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

  /** Reactive data */
  const statuses = ref<Status[]>([])
  const priorities = ref<Priority[]>([])
  const complexities = ref<Complexity[]>([])

  const selectedStatus = ref<Status | null>(null)
  const selectedPriority = ref<Priority | null>(null)
  const selectedComplexity = ref<Complexity | null>(null)

  const statusSearch = ref('')
  const prioritySearch = ref('')
  const complexitySearch = ref('')

  const statusLoading = ref(false)
  const priorityLoading = ref(false)
  const complexityLoading = ref(false)

  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  /** Dialog visibility flags */
  const showStatusCreateDialog = ref(false)
  const showStatusEditDialog = ref(false)
  const showStatusDeleteDialog = ref(false)

  const showPriorityCreateDialog = ref(false)
  const showPriorityEditDialog = ref(false)
  const showPriorityDeleteDialog = ref(false)

  const showComplexityCreateDialog = ref(false)
  const showComplexityEditDialog = ref(false)
  const showComplexityDeleteDialog = ref(false)

  // Notifications
  const { notifySuccess, notifyError } = useNotifications()

  /** Computed filtered data for the tables */
  const filteredStatuses = computed(() => {
    if (!statusSearch.value) return statuses.value

    const searchTerm = statusSearch.value.toLowerCase()
    return statuses.value.filter(status =>
      status.name.toLowerCase().includes(searchTerm),
    )
  })

  const filteredPriorities = computed(() => {
    if (!prioritySearch.value) return priorities.value

    const searchTerm = prioritySearch.value.toLowerCase()
    return priorities.value.filter(priority =>
      priority.name.toLowerCase().includes(searchTerm),
    )
  })

  const filteredComplexities = computed(() => {
    if (!complexitySearch.value) return complexities.value

    const searchTerm = complexitySearch.value.toLowerCase()
    return complexities.value.filter(complexity =>
      complexity.name.toLowerCase().includes(searchTerm),
    )
  })

  /** Load all reference data */
  async function loadStatuses () {
    try {
      statusLoading.value = true
      const response = await statusService.getStatuses()
      statuses.value = response.statuses
    } catch (error) {
      console.error('Failed to load statuses:', error)
      notifyError('Failed to load statuses')
    } finally {
      statusLoading.value = false
    }
  }

  async function loadPriorities () {
    try {
      priorityLoading.value = true
      const response = await priorityService.getPriorities()
      priorities.value = response.priorities
    } catch (error) {
      console.error('Failed to load priorities:', error)
      notifyError('Failed to load priorities')
    } finally {
      priorityLoading.value = false
    }
  }

  async function loadComplexities () {
    try {
      complexityLoading.value = true
      const response = await complexityService.getComplexities()
      complexities.value = response.complexities
    } catch (error) {
      console.error('Failed to load complexities:', error)
      notifyError('Failed to load complexities')
    } finally {
      complexityLoading.value = false
    }
  }

  /** Dialog handlers for Status */
  function openStatusCreateDialog () {
    showStatusCreateDialog.value = true
  }

  function openStatusEditDialog (status: Status) {
    selectedStatus.value = status
    showStatusEditDialog.value = true
  }

  function openStatusDeleteDialog (status: Status) {
    selectedStatus.value = status
    showStatusDeleteDialog.value = true
  }

  async function handleCreateStatus (statusData: CreateStatusInput) {
    try {
      await statusService.createStatus(statusData)
      notifySuccess('Status created successfully')
      showStatusCreateDialog.value = false
      await loadStatuses()
    } catch (error) {
      console.error('Failed to create status:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to create status',
      )
    }
  }

  async function handleUpdateStatus (statusData: UpdateStatusInput) {
    try {
      await statusService.updateStatus(statusData)
      notifySuccess('Status updated successfully')
      showStatusEditDialog.value = false
      await loadStatuses()
    } catch (error) {
      console.error('Failed to update status:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update status',
      )
    }
  }

  async function handleDeleteStatus () {
    if (!selectedStatus.value) return

    try {
      await statusService.deleteStatus(selectedStatus.value.id)
      notifySuccess('Status deleted successfully')
      showStatusDeleteDialog.value = false
      await loadStatuses()
    } catch (error) {
      console.error('Failed to delete status:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to delete status',
      )
    }
  }

  /** Dialog handlers for Priority */
  function openPriorityCreateDialog () {
    showPriorityCreateDialog.value = true
  }

  function openPriorityEditDialog (priority: Priority) {
    selectedPriority.value = priority
    showPriorityEditDialog.value = true
  }

  function openPriorityDeleteDialog (priority: Priority) {
    selectedPriority.value = priority
    showPriorityDeleteDialog.value = true
  }

  async function handleCreatePriority (priorityData: CreatePriorityInput) {
    try {
      await priorityService.createPriority(priorityData)
      notifySuccess('Priority created successfully')
      showPriorityCreateDialog.value = false
      await loadPriorities()
    } catch (error) {
      console.error('Failed to create priority:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to create priority',
      )
    }
  }

  async function handleUpdatePriority (priorityData: UpdatePriorityInput) {
    try {
      await priorityService.updatePriority(priorityData)
      notifySuccess('Priority updated successfully')
      showPriorityEditDialog.value = false
      await loadPriorities()
    } catch (error) {
      console.error('Failed to update priority:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update priority',
      )
    }
  }

  async function handleDeletePriority () {
    if (!selectedPriority.value) return

    try {
      await priorityService.deletePriority(selectedPriority.value.id)
      notifySuccess('Priority deleted successfully')
      showPriorityDeleteDialog.value = false
      await loadPriorities()
    } catch (error) {
      console.error('Failed to delete priority:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to delete priority',
      )
    }
  }

  /** Dialog handlers for Complexity */
  function openComplexityCreateDialog () {
    showComplexityCreateDialog.value = true
  }

  function openComplexityEditDialog (complexity: Complexity) {
    selectedComplexity.value = complexity
    showComplexityEditDialog.value = true
  }

  function openComplexityDeleteDialog (complexity: Complexity) {
    selectedComplexity.value = complexity
    showComplexityDeleteDialog.value = true
  }

  async function handleCreateComplexity (complexityData: CreateComplexityInput) {
    try {
      await complexityService.createComplexity(complexityData)
      notifySuccess('Complexity created successfully')
      showComplexityCreateDialog.value = false
      await loadComplexities()
    } catch (error) {
      console.error('Failed to create complexity:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to create complexity',
      )
    }
  }

  async function handleUpdateComplexity (complexityData: UpdateComplexityInput) {
    try {
      await complexityService.updateComplexity(complexityData)
      notifySuccess('Complexity updated successfully')
      showComplexityEditDialog.value = false
      await loadComplexities()
    } catch (error) {
      console.error('Failed to update complexity:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update complexity',
      )
    }
  }

  async function handleDeleteComplexity () {
    if (!selectedComplexity.value) return

    try {
      await complexityService.deleteComplexity(selectedComplexity.value.id)
      notifySuccess('Complexity deleted successfully')
      showComplexityDeleteDialog.value = false
      await loadComplexities()
    } catch (error) {
      console.error('Failed to delete complexity:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to delete complexity',
      )
    }
  }



  /** Initialize page data */
  onMounted(async () => {
    await Promise.all([
      loadStatuses(),
      loadPriorities(),
      loadComplexities(),
    ])
  })
</script>
