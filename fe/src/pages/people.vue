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
    <OrganizationTable
      v-model:search="organizationManagement.organizationSearch.value"
      :filtered-organizations="organizationManagement.filteredOrganizations.value"
      :headers="tableConfig.organizationHeaders"
      :items-per-page="itemsPerPage"
      :items-per-page-options="tableConfig.itemsPerPageOptions"
      :loading="organizationManagement.organizationLoading.value"
      @create="organizationManagement.openCreateDialog"
      @delete="organizationManagement.openDeleteDialog"
      @edit="organizationManagement.openEditDialog"
      @view="organizationManagement.openViewDialog"
    />

    <!-- Departments Table -->
    <DepartmentTable
      v-model:search="departmentManagement.departmentSearch.value"
      :filtered-departments="departmentManagement.filteredDepartments.value"
      :get-organization-name="entityHelpers.getOrganizationName"
      :get-staff-name="entityHelpers.getStaffName"
      :headers="tableConfig.departmentHeaders"
      :items-per-page="itemsPerPage"
      :items-per-page-options="tableConfig.itemsPerPageOptions"
      :loading="departmentManagement.departmentLoading.value"
      @create="departmentManagement.openCreateDialog"
      @delete="departmentManagement.openDeleteDialog"
      @edit="departmentManagement.openEditDialog"
      @tree="departmentManagement.openTreeDialog"
      @view="departmentManagement.openViewDialog"
    />

    <!-- Staff Table -->
    <StaffTable
      v-model:search="staffManagement.staffSearch.value"
      :filtered-staff="staffManagement.filteredStaff.value"
      :get-department-name="entityHelpers.getDepartmentName"
      :get-organization-name="entityHelpers.getOrganizationName"
      :headers="tableConfig.staffHeaders"
      :items-per-page="itemsPerPage"
      :items-per-page-options="tableConfig.itemsPerPageOptions"
      :loading="staffManagement.staffLoading.value"
      @create="staffManagement.openCreateDialog"
      @create-user="staffManagement.openCreateUserDialog"
      @delete="staffManagement.openDeleteDialog"
      @edit="staffManagement.openEditDialog"
      @tree="staffManagement.openTreeDialog"
      @view="staffManagement.openViewDialog"
    />

    <!-- All Dialogs -->
    <OrganizationDialogs
      :organization-management="organizationManagement"
      @created="handleOrganizationCreated"
      @deleted="handleOrganizationDeleted"
      @updated="handleOrganizationUpdated"
    />

    <DepartmentDialogs
      :department-management="departmentManagement"
      :departments="departmentManagement.departments.value"
      :organizations="organizationManagement.organizations.value"
      :staff="staffManagement.staff.value"
      @created="handleDepartmentCreated"
      @deleted="handleDepartmentDeleted"
      @updated="handleDepartmentUpdated"
    />

    <StaffDialogs
      :departments="departmentManagement.departments.value"
      :organizations="organizationManagement.organizations.value"
      :staff="staffManagement.staff.value"
      :staff-management="staffManagement"
      @created="handleStaffCreated"
      @deleted="handleStaffDeleted"
      @updated="handleStaffUpdated"
      @user-created="handleUserCreatedFromStaff"
    />
  </v-container>
</template>

<script lang="ts" setup>
  import type { CreateDepartmentInput, UpdateDepartmentInput } from '../services/departments'
  import type { CreateOrganizationInput, UpdateOrganizationInput } from '../services/organizations'
  import type { CreateStaffInput, UpdateStaffInput } from '../services/staff'
  import type { CreateUserInput } from '../services/users'
  import { onMounted, ref } from 'vue'

  import DepartmentDialogs from '../components/department/DepartmentDialogs.vue'
  import DepartmentTable from '../components/department/DepartmentTable.vue'
  import OrganizationDialogs from '../components/organization/OrganizationDialogs.vue'
  // Components
  import OrganizationTable from '../components/organization/OrganizationTable.vue'
  import StaffDialogs from '../components/staff/StaffDialogs.vue'
  import StaffTable from '../components/staff/StaffTable.vue'

  import { useDepartmentManagement } from '../composables/department/useDepartmentManagement'
  // Composables
  import { useOrganizationManagement } from '../composables/organization/useOrganizationManagement'
  import { useDataTableConfig } from '../composables/shared/useDataTableConfig'
  import { useEntityHelpers } from '../composables/shared/useEntityHelpers'
  import { useNotifications } from '../composables/useNotifications'
  import { useStaffManagement } from '../composables/staff/useStaffManagement'

  // Services
  import * as userService from '../services/users'

  // Initialize composables
  const organizationManagement = useOrganizationManagement()
  const departmentManagement = useDepartmentManagement()
  const staffManagement = useStaffManagement()
  const tableConfig = useDataTableConfig()
  const { notifySuccess, notifyError } = useNotifications()

  // Entity helpers
  const entityHelpers = useEntityHelpers(
    organizationManagement.organizations,
    departmentManagement.departments,
    staffManagement.staff,
  )

  // Data table configuration
  const itemsPerPage = ref(10)

  /**
   * Organization event handlers
   */
  async function handleOrganizationCreated (data: CreateOrganizationInput) {
    try {
      await organizationManagement.createOrganization(data)
      notifySuccess('Organization created successfully')
    } catch (error) {
      console.error('Error creating organization:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleOrganizationUpdated (data: UpdateOrganizationInput) {
    try {
      await organizationManagement.updateOrganization(data)
      notifySuccess('Organization updated successfully')
    } catch (error) {
      console.error('Error updating organization:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleOrganizationDeleted (organizationId: string) {
    try {
      await organizationManagement.deleteOrganization(organizationId)
      notifySuccess('Organization deleted successfully')
    } catch (error) {
      console.error('Error deleting organization:', error)
      notifyError((error as Error).message)
    }
  }

  /**
   * Department event handlers
   */
  async function handleDepartmentCreated (data: CreateDepartmentInput) {
    try {
      await departmentManagement.createDepartment(data)
      notifySuccess('Department created successfully')
    } catch (error) {
      console.error('Error creating department:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleDepartmentUpdated (data: UpdateDepartmentInput) {
    try {
      await departmentManagement.updateDepartment(data)
      notifySuccess('Department updated successfully')
    } catch (error) {
      console.error('Error updating department:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleDepartmentDeleted (departmentId: string) {
    try {
      await departmentManagement.deleteDepartment(departmentId)
      notifySuccess('Department deleted successfully')
    } catch (error) {
      console.error('Error deleting department:', error)
      notifyError((error as Error).message)
    }
  }

  /**
   * Staff event handlers
   */
  async function handleStaffCreated (data: CreateStaffInput) {
    try {
      await staffManagement.createStaff(data)
      notifySuccess('Staff member created successfully')
    } catch (error) {
      console.error('Error creating staff member:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleStaffUpdated (data: UpdateStaffInput) {
    try {
      await staffManagement.updateStaff(data)
      notifySuccess('Staff member updated successfully')
    } catch (error) {
      console.error('Error updating staff member:', error)
      notifyError((error as Error).message)
    }
  }

  async function handleStaffDeleted (staffId: string) {
    try {
      await staffManagement.deleteStaff(staffId)
      notifySuccess('Staff member deleted successfully')
    } catch (error) {
      console.error('Error deleting staff member:', error)
      notifyError((error as Error).message)
    }
  }

  /**
   * User creation from staff handler
   */
  async function handleUserCreatedFromStaff (userData: CreateUserInput) {
    try {
      const { createUser } = await userService.createUser(userData)
      staffManagement.showCreateUserFromStaffDialog.value = false
      staffManagement.userCreationData.value = null
      notifySuccess(`User account created successfully for ${createUser.firstName} ${createUser.lastName}`)
    } catch (error) {
      console.error('Error creating user from staff:', error)
      notifyError((error as Error).message)
    }
  }

  /**
   * Initialize data on component mount
   */
  onMounted(async () => {
    try {
      await Promise.all([
        organizationManagement.loadOrganizations(),
        departmentManagement.loadDepartments(),
        staffManagement.loadStaff(),
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      notifyError('Failed to load organization data')
    }
  })
</script>
