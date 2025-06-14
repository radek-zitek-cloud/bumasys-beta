<!--
  @fileoverview Organization Management Page
  
  This page provides a comprehensive interface for managing organizations,
  departments, and staff. It follows the design patterns established in
  the user management and reference data interfaces.
-->

<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 mb-2">Organization Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage organizations, departments, and staff members
        </p>
      </div>
    </div>

    <!-- Organizations Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Organizations ({{ filteredOrganizations.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openOrganizationCreateDialog"
              >
                Add Organization
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="organizationSearch"
              clearable
              density="compact"
              hide-details
              label="Search organizations..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="organizationHeaders"
            :items="filteredOrganizations"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="organizationLoading"
            no-data-text="No organizations found"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Description Column -->
            <template #item.description="{ item }">
              <span v-if="item.description" class="text-body-2">
                {{ item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description }}
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
                  @click="openOrganizationViewDialog(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openOrganizationEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Organization</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openOrganizationDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Organization</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Departments Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Departments ({{ filteredDepartments.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openDepartmentCreateDialog"
              >
                Add Department
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="departmentSearch"
              clearable
              density="compact"
              hide-details
              label="Search departments..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="departmentHeaders"
            :items="filteredDepartments"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="departmentLoading"
            no-data-text="No departments found"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Organization Column -->
            <template #item.organizationId="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ getOrganizationName(item.organizationId) }}
              </v-chip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openDepartmentEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Department</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openDepartmentDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Department</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Staff Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Staff Members ({{ filteredStaff.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openStaffCreateDialog"
              >
                Add Staff Member
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="staffSearch"
              clearable
              density="compact"
              hide-details
              label="Search staff..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="staffHeaders"
            :items="filteredStaff"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="staffLoading"
            no-data-text="No staff members found"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Email Column -->
            <template #item.email="{ item }">
              <v-chip
                prepend-icon="mdi-email"
                size="small"
                variant="tonal"
              >
                {{ item.email }}
              </v-chip>
            </template>

            <!-- Organization Column -->
            <template #item.organizationId="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ getOrganizationName(item.organizationId) }}
              </v-chip>
            </template>

            <!-- Department Column -->
            <template #item.departmentId="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                color="secondary"
              >
                {{ getDepartmentName(item.departmentId) }}
              </v-chip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openStaffEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Staff Member</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openStaffDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Staff Member</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Organization Dialogs -->
    <v-dialog v-model="showOrganizationCreateDialog" max-width="600" persistent>
      <OrganizationCreateDialog
        @cancel="showOrganizationCreateDialog = false"
        @created="handleOrganizationCreated"
      />
    </v-dialog>

    <v-dialog v-model="showOrganizationEditDialog" max-width="600" persistent>
      <OrganizationEditDialog
        v-if="selectedOrganization"
        :organization="selectedOrganization"
        @cancel="showOrganizationEditDialog = false"
        @updated="handleOrganizationUpdated"
      />
    </v-dialog>

    <v-dialog v-model="showOrganizationViewDialog" max-width="600" persistent>
      <OrganizationViewDialog
        v-if="selectedOrganization"
        :organization="selectedOrganization"
        @close="showOrganizationViewDialog = false"
      />
    </v-dialog>

    <v-dialog v-model="showOrganizationDeleteDialog" max-width="500" persistent>
      <OrganizationDeleteDialog
        v-if="selectedOrganization"
        :organization="selectedOrganization"
        @cancel="showOrganizationDeleteDialog = false"
        @deleted="handleOrganizationDeleted"
      />
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom"
      timeout="4000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import type { VDataTable } from 'vuetify/components'
  import OrganizationCreateDialog from '../components/OrganizationCreateDialog.vue'
  import OrganizationEditDialog from '../components/OrganizationEditDialog.vue'
  import OrganizationViewDialog from '../components/OrganizationViewDialog.vue'
  import OrganizationDeleteDialog from '../components/OrganizationDeleteDialog.vue'
  import * as organizationService from '../services/organizations'
  import * as departmentService from '../services/departments'
  import * as staffService from '../services/staff'
  import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '../services/organizations'
  import type { Department } from '../services/departments'
  import type { Staff } from '../services/staff'

  /** Data table configuration */
  type DataTableHeaders = VDataTable['$props']['headers']

  const organizationHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Description', key: 'description', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '150px' },
  ]

  const departmentHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Organization', key: 'organizationId', sortable: true },
    { title: 'Description', key: 'description', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '120px' },
  ]

  const staffHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Role', key: 'role', sortable: true },
    { title: 'Organization', key: 'organizationId', sortable: true },
    { title: 'Department', key: 'departmentId', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '120px' },
  ]

  /** Reactive data */
  const organizations = ref<Organization[]>([])
  const departments = ref<Department[]>([])
  const staff = ref<Staff[]>([])
  const selectedOrganization = ref<Organization | null>(null)

  /** Search filters */
  const organizationSearch = ref('')
  const departmentSearch = ref('')
  const staffSearch = ref('')

  /** Loading states */
  const organizationLoading = ref(false)
  const departmentLoading = ref(false)
  const staffLoading = ref(false)

  /** Dialog visibility flags */
  const showOrganizationCreateDialog = ref(false)
  const showOrganizationEditDialog = ref(false)
  const showOrganizationViewDialog = ref(false)
  const showOrganizationDeleteDialog = ref(false)

  /** Data table configuration */
  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  /** Snackbar for notifications */
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success' as 'success' | 'error' | 'warning' | 'info',
  })

  /** Computed filtered lists */
  const filteredOrganizations = computed(() => {
    if (!organizationSearch.value) return organizations.value

    const searchTerm = organizationSearch.value.toLowerCase()
    return organizations.value.filter(org =>
      org.name.toLowerCase().includes(searchTerm) ||
      (org.description && org.description.toLowerCase().includes(searchTerm))
    )
  })

  const filteredDepartments = computed(() => {
    if (!departmentSearch.value) return departments.value

    const searchTerm = departmentSearch.value.toLowerCase()
    return departments.value.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm)) ||
      getOrganizationName(dept.organizationId).toLowerCase().includes(searchTerm)
    )
  })

  const filteredStaff = computed(() => {
    if (!staffSearch.value) return staff.value

    const searchTerm = staffSearch.value.toLowerCase()
    return staff.value.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm) ||
      getOrganizationName(member.organizationId).toLowerCase().includes(searchTerm) ||
      getDepartmentName(member.departmentId).toLowerCase().includes(searchTerm)
    )
  })

  /** Helper functions */
  function getOrganizationName(id: string): string {
    const org = organizations.value.find(o => o.id === id)
    return org ? org.name : 'Unknown'
  }

  function getDepartmentName(id: string): string {
    const dept = departments.value.find(d => d.id === id)
    return dept ? dept.name : 'Unknown'
  }

  function showSnackbar(message: string, color: typeof snackbar.color = 'success') {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  /** Organization dialog handlers */
  function openOrganizationCreateDialog() {
    showOrganizationCreateDialog.value = true
  }

  function openOrganizationEditDialog(organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationEditDialog.value = true
  }

  function openOrganizationViewDialog(organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationViewDialog.value = true
  }

  function openOrganizationDeleteDialog(organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationDeleteDialog.value = true
  }

  async function handleOrganizationCreated(organizationData: CreateOrganizationInput) {
    try {
      const { createOrganization } = await organizationService.createOrganization(organizationData)
      organizations.value.push(createOrganization)
      showSnackbar('Organization created successfully')
      showOrganizationCreateDialog.value = false
    } catch (error) {
      console.error('Error creating organization:', error)
      showSnackbar((error as Error).message, 'error')
    }
  }

  async function handleOrganizationUpdated(organizationData: UpdateOrganizationInput) {
    try {
      const { updateOrganization } = await organizationService.updateOrganization(organizationData)
      const index = organizations.value.findIndex(org => org.id === updateOrganization.id)
      if (index !== -1) {
        organizations.value[index] = updateOrganization
      }
      showSnackbar('Organization updated successfully')
      showOrganizationEditDialog.value = false
    } catch (error) {
      console.error('Error updating organization:', error)
      showSnackbar((error as Error).message, 'error')
    }
  }

  async function handleOrganizationDeleted(organizationId: string) {
    try {
      await organizationService.deleteOrganization(organizationId)
      const index = organizations.value.findIndex(org => org.id === organizationId)
      if (index !== -1) {
        organizations.value.splice(index, 1)
      }
      showSnackbar('Organization deleted successfully')
      showOrganizationDeleteDialog.value = false
    } catch (error) {
      console.error('Error deleting organization:', error)
      showSnackbar((error as Error).message, 'error')
    }
  }

  /** Department dialog handlers - placeholder for now */
  function openDepartmentCreateDialog() {
    showSnackbar('Department creation coming soon', 'info')
  }

  function openDepartmentEditDialog(department: Department) {
    showSnackbar('Department editing coming soon', 'info')
  }

  function openDepartmentDeleteDialog(department: Department) {
    showSnackbar('Department deletion coming soon', 'info')
  }

  /** Staff dialog handlers - placeholder for now */
  function openStaffCreateDialog() {
    showSnackbar('Staff creation coming soon', 'info')
  }

  function openStaffEditDialog(staffMember: Staff) {
    showSnackbar('Staff editing coming soon', 'info')
  }

  function openStaffDeleteDialog(staffMember: Staff) {
    showSnackbar('Staff deletion coming soon', 'info')
  }

  /** Load all data */
  async function loadOrganizations() {
    try {
      organizationLoading.value = true
      const { organizations: data } = await organizationService.getOrganizations()
      organizations.value = data
    } catch (error) {
      console.error('Error loading organizations:', error)
      showSnackbar('Failed to load organizations', 'error')
    } finally {
      organizationLoading.value = false
    }
  }

  async function loadDepartments() {
    try {
      departmentLoading.value = true
      const { departments: data } = await departmentService.getDepartments()
      departments.value = data
    } catch (error) {
      console.error('Error loading departments:', error)
      showSnackbar('Failed to load departments', 'error')
    } finally {
      departmentLoading.value = false
    }
  }

  async function loadStaff() {
    try {
      staffLoading.value = true
      const { staff: data } = await staffService.getStaff()
      staff.value = data
    } catch (error) {
      console.error('Error loading staff:', error)
      showSnackbar('Failed to load staff', 'error')
    } finally {
      staffLoading.value = false
    }
  }

  /** Initialize data on component mount */
  onMounted(async () => {
    await Promise.all([
      loadOrganizations(),
      loadDepartments(),
      loadStaff(),
    ])
  })
</script>
