/**
 * @fileoverview Staff management composable
 *
 * Handles CRUD operations, filtering, and dialog state management for staff members.
 * Provides a centralized interface for all staff-related operations used
 * across the application, including user creation from staff data.
 */

import type { CreateStaffInput, Staff, UpdateStaffInput } from '../../services/staff'
import type { CreateUserInput } from '../../services/users'
import { computed, ref } from 'vue'
import * as staffService from '../../services/staff'

/**
 * Composable for staff management operations
 *
 * @returns Object containing staff state, computed values, and action functions
 *
 * @example
 * ```typescript
 * const staffManagement = useStaffManagement()
 *
 * // Load staff
 * await staffManagement.loadStaff()
 *
 * // Filter staff
 * staffManagement.staffSearch.value = 'John'
 * console.log(staffManagement.filteredStaff.value)
 *
 * // Open create dialog
 * staffManagement.openCreateDialog()
 * ```
 */
export function useStaffManagement () {
  // State
  const staff = ref<Staff[]>([])
  const selectedStaff = ref<Staff | null>(null)
  const staffSearch = ref('')
  const staffLoading = ref(false)

  // Dialog states
  const showStaffCreateDialog = ref(false)
  const showStaffEditDialog = ref(false)
  const showStaffViewDialog = ref(false)
  const showStaffDeleteDialog = ref(false)
  const showStaffTreeDialog = ref(false)
  const showCreateUserFromStaffDialog = ref(false)

  // User creation state
  const userCreationData = ref<CreateUserInput | null>(null)

  /**
   * Computed filtered staff based on search term
   */
  const filteredStaff = computed(() => {
    if (!staffSearch.value) {
      return staff.value
    }

    const searchTerm = staffSearch.value.toLowerCase()
    return staff.value.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm)
      || member.lastName.toLowerCase().includes(searchTerm)
      || member.email.toLowerCase().includes(searchTerm)
      || member.role.toLowerCase().includes(searchTerm),
    )
  })

  /**
   * Load all staff from the API
   *
   * @throws Error if the API request fails
   */
  async function loadStaff () {
    try {
      staffLoading.value = true
      const { staff: data } = await staffService.getStaff()
      staff.value = data
    } catch (error) {
      console.error('Error loading staff:', error)
      throw error
    } finally {
      staffLoading.value = false
    }
  }

  /**
   * Create a new staff member
   *
   * @param data - Staff creation data
   * @returns Created staff member
   * @throws Error if the creation fails
   */
  async function createStaff (data: CreateStaffInput) {
    const { createStaff } = await staffService.createStaff(data)
    staff.value.push(createStaff)
    showStaffCreateDialog.value = false
    return createStaff
  }

  /**
   * Update an existing staff member
   *
   * @param data - Staff update data
   * @returns Updated staff member
   * @throws Error if the update fails
   */
  async function updateStaff (data: UpdateStaffInput) {
    const { updateStaff } = await staffService.updateStaff(data)
    const index = staff.value.findIndex(member => member.id === updateStaff.id)
    if (index !== -1) {
      staff.value[index] = updateStaff
    }
    showStaffEditDialog.value = false
    return updateStaff
  }

  /**
   * Delete a staff member
   *
   * @param id - Staff member ID to delete
   * @throws Error if the deletion fails
   */
  async function deleteStaff (id: string) {
    await staffService.deleteStaff(id)
    const index = staff.value.findIndex(member => member.id === id)
    if (index !== -1) {
      staff.value.splice(index, 1)
    }
    showStaffDeleteDialog.value = false
  }

  // Dialog handlers

  /**
   * Open the create staff dialog
   */
  function openCreateDialog () {
    showStaffCreateDialog.value = true
  }

  /**
   * Open the edit staff dialog
   *
   * @param staffMember - Staff member to edit
   */
  function openEditDialog (staffMember: Staff) {
    selectedStaff.value = staffMember
    showStaffEditDialog.value = true
  }

  /**
   * Open the view staff dialog
   *
   * @param staffMember - Staff member to view
   */
  function openViewDialog (staffMember: Staff) {
    selectedStaff.value = staffMember
    showStaffViewDialog.value = true
  }

  /**
   * Open the delete staff dialog
   *
   * @param staffMember - Staff member to delete
   */
  function openDeleteDialog (staffMember: Staff) {
    selectedStaff.value = staffMember
    showStaffDeleteDialog.value = true
  }

  /**
   * Open the staff tree dialog
   *
   * @param staffMember - Staff member to show tree for
   */
  function openTreeDialog (staffMember: Staff) {
    selectedStaff.value = staffMember
    showStaffTreeDialog.value = true
  }

  /**
   * Open the create user from staff dialog
   *
   * @param staffMember - Staff member to create user from
   */
  function openCreateUserDialog (staffMember: Staff) {
    // Pre-populate user data from staff member
    userCreationData.value = {
      email: staffMember.email,
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      password: '', // Will be filled in the dialog
      note: `User account created from staff member: ${staffMember.firstName} ${staffMember.lastName}`,
    }
    selectedStaff.value = staffMember
    showCreateUserFromStaffDialog.value = true
  }

  /**
   * Close all staff dialogs
   */
  function closeAllDialogs () {
    showStaffCreateDialog.value = false
    showStaffEditDialog.value = false
    showStaffViewDialog.value = false
    showStaffDeleteDialog.value = false
    showStaffTreeDialog.value = false
    showCreateUserFromStaffDialog.value = false
    selectedStaff.value = null
    userCreationData.value = null
  }

  return {
    // State
    staff,
    selectedStaff,
    staffSearch,
    staffLoading,
    filteredStaff,
    userCreationData,

    // Dialog states
    showStaffCreateDialog,
    showStaffEditDialog,
    showStaffViewDialog,
    showStaffDeleteDialog,
    showStaffTreeDialog,
    showCreateUserFromStaffDialog,

    // Actions
    loadStaff,
    createStaff,
    updateStaff,
    deleteStaff,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    openTreeDialog,
    openCreateUserDialog,
    closeAllDialogs,
  }
}
