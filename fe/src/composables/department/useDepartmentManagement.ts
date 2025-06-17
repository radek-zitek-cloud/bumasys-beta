/**
 * @fileoverview Department management composable
 *
 * Handles CRUD operations, filtering, and dialog state management for departments.
 * Provides a centralized interface for all department-related operations used
 * across the application.
 */

import type { CreateDepartmentInput, Department, UpdateDepartmentInput } from '../../services/departments'
import { computed, ref } from 'vue'
import * as departmentService from '../../services/departments'

/**
 * Composable for department management operations
 *
 * @returns Object containing department state, computed values, and action functions
 *
 * @example
 * ```typescript
 * const departmentManagement = useDepartmentManagement()
 *
 * // Load departments
 * await departmentManagement.loadDepartments()
 *
 * // Filter departments
 * departmentManagement.departmentSearch.value = 'Engineering'
 * console.log(departmentManagement.filteredDepartments.value)
 *
 * // Open create dialog
 * departmentManagement.openCreateDialog()
 * ```
 */
export function useDepartmentManagement () {
  // State
  const departments = ref<Department[]>([])
  const selectedDepartment = ref<Department | null>(null)
  const departmentSearch = ref('')
  const departmentLoading = ref(false)

  // Dialog states
  const showDepartmentCreateDialog = ref(false)
  const showDepartmentEditDialog = ref(false)
  const showDepartmentViewDialog = ref(false)
  const showDepartmentDeleteDialog = ref(false)
  const showDepartmentTreeDialog = ref(false)

  /**
   * Computed filtered departments based on search term
   */
  const filteredDepartments = computed(() => {
    if (!departmentSearch.value) {
      return departments.value
    }

    const searchTerm = departmentSearch.value.toLowerCase()
    return departments.value.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm)
      || (dept.description && dept.description.toLowerCase().includes(searchTerm)),
    )
  })

  /**
   * Load all departments from the API
   *
   * @throws Error if the API request fails
   */
  async function loadDepartments () {
    try {
      departmentLoading.value = true
      const { departments: data } = await departmentService.getDepartments()
      departments.value = data
    } catch (error) {
      console.error('Error loading departments:', error)
      throw error
    } finally {
      departmentLoading.value = false
    }
  }

  /**
   * Create a new department
   *
   * @param data - Department creation data
   * @returns Created department
   * @throws Error if the creation fails
   */
  async function createDepartment (data: CreateDepartmentInput) {
    const { createDepartment } = await departmentService.createDepartment(data)
    departments.value.push(createDepartment)
    showDepartmentCreateDialog.value = false
    return createDepartment
  }

  /**
   * Update an existing department
   *
   * @param data - Department update data
   * @returns Updated department
   * @throws Error if the update fails
   */
  async function updateDepartment (data: UpdateDepartmentInput) {
    const { updateDepartment } = await departmentService.updateDepartment(data)
    const index = departments.value.findIndex(dept => dept.id === updateDepartment.id)
    if (index !== -1) {
      departments.value[index] = updateDepartment
    }
    showDepartmentEditDialog.value = false
    return updateDepartment
  }

  /**
   * Delete a department
   *
   * @param id - Department ID to delete
   * @throws Error if the deletion fails
   */
  async function deleteDepartment (id: string) {
    await departmentService.deleteDepartment(id)
    const index = departments.value.findIndex(dept => dept.id === id)
    if (index !== -1) {
      departments.value.splice(index, 1)
    }
    showDepartmentDeleteDialog.value = false
  }

  // Dialog handlers

  /**
   * Open the create department dialog
   */
  function openCreateDialog () {
    showDepartmentCreateDialog.value = true
  }

  /**
   * Open the edit department dialog
   *
   * @param department - Department to edit
   */
  function openEditDialog (department: Department) {
    selectedDepartment.value = department
    showDepartmentEditDialog.value = true
  }

  /**
   * Open the view department dialog
   *
   * @param department - Department to view
   */
  function openViewDialog (department: Department) {
    selectedDepartment.value = department
    showDepartmentViewDialog.value = true
  }

  /**
   * Open the delete department dialog
   *
   * @param department - Department to delete
   */
  function openDeleteDialog (department: Department) {
    selectedDepartment.value = department
    showDepartmentDeleteDialog.value = true
  }

  /**
   * Open the department tree dialog
   *
   * @param department - Department to show tree for
   */
  function openTreeDialog (department: Department) {
    selectedDepartment.value = department
    showDepartmentTreeDialog.value = true
  }

  /**
   * Close all department dialogs
   */
  function closeAllDialogs () {
    showDepartmentCreateDialog.value = false
    showDepartmentEditDialog.value = false
    showDepartmentViewDialog.value = false
    showDepartmentDeleteDialog.value = false
    showDepartmentTreeDialog.value = false
    selectedDepartment.value = null
  }

  return {
    // State
    departments,
    selectedDepartment,
    departmentSearch,
    departmentLoading,
    filteredDepartments,

    // Dialog states
    showDepartmentCreateDialog,
    showDepartmentEditDialog,
    showDepartmentViewDialog,
    showDepartmentDeleteDialog,
    showDepartmentTreeDialog,

    // Actions
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    openTreeDialog,
    closeAllDialogs,
  }
}
