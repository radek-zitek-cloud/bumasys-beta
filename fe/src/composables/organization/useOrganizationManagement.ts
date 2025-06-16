/**
 * @fileoverview Organization management composable
 *
 * Handles CRUD operations, filtering, and dialog state management for organizations.
 * Provides a centralized interface for all organization-related operations used
 * across the application.
 */

import type { CreateOrganizationInput, Organization, UpdateOrganizationInput } from '../../services/organizations'
import { computed, ref } from 'vue'
import * as organizationService from '../../services/organizations'

/**
 * Composable for organization management operations
 *
 * @returns Object containing organization state, computed values, and action functions
 *
 * @example
 * ```typescript
 * const organizationManagement = useOrganizationManagement()
 *
 * // Load organizations
 * await organizationManagement.loadOrganizations()
 *
 * // Filter organizations
 * organizationManagement.organizationSearch.value = 'Tech'
 * console.log(organizationManagement.filteredOrganizations.value)
 *
 * // Open create dialog
 * organizationManagement.openCreateDialog()
 * ```
 */
export function useOrganizationManagement () {
  // State
  const organizations = ref<Organization[]>([])
  const selectedOrganization = ref<Organization | null>(null)
  const organizationSearch = ref('')
  const organizationLoading = ref(false)

  // Dialog states
  const showOrganizationCreateDialog = ref(false)
  const showOrganizationEditDialog = ref(false)
  const showOrganizationViewDialog = ref(false)
  const showOrganizationDeleteDialog = ref(false)

  /**
   * Computed filtered organizations based on search term
   */
  const filteredOrganizations = computed(() => {
    if (!organizationSearch.value) {
      return organizations.value
    }

    const searchTerm = organizationSearch.value.toLowerCase()
    return organizations.value.filter(org =>
      org.name.toLowerCase().includes(searchTerm)
      || (org.description && org.description.toLowerCase().includes(searchTerm)),
    )
  })

  /**
   * Load all organizations from the API
   *
   * @throws Error if the API request fails
   */
  async function loadOrganizations () {
    try {
      organizationLoading.value = true
      const { organizations: data } = await organizationService.getOrganizations()
      organizations.value = data
    } catch (error) {
      console.error('Error loading organizations:', error)
      throw error
    } finally {
      organizationLoading.value = false
    }
  }

  /**
   * Create a new organization
   *
   * @param data - Organization creation data
   * @returns Created organization
   * @throws Error if the creation fails
   */
  async function createOrganization (data: CreateOrganizationInput) {
    const { createOrganization } = await organizationService.createOrganization(data)
    organizations.value.push(createOrganization)
    showOrganizationCreateDialog.value = false
    return createOrganization
  }

  /**
   * Update an existing organization
   *
   * @param data - Organization update data
   * @returns Updated organization
   * @throws Error if the update fails
   */
  async function updateOrganization (data: UpdateOrganizationInput) {
    const { updateOrganization } = await organizationService.updateOrganization(data)
    const index = organizations.value.findIndex(org => org.id === updateOrganization.id)
    if (index !== -1) {
      organizations.value[index] = updateOrganization
    }
    showOrganizationEditDialog.value = false
    return updateOrganization
  }

  /**
   * Delete an organization
   *
   * @param id - Organization ID to delete
   * @throws Error if the deletion fails
   */
  async function deleteOrganization (id: string) {
    await organizationService.deleteOrganization(id)
    const index = organizations.value.findIndex(org => org.id === id)
    if (index !== -1) {
      organizations.value.splice(index, 1)
    }
    showOrganizationDeleteDialog.value = false
  }

  // Dialog handlers

  /**
   * Open the create organization dialog
   */
  function openCreateDialog () {
    showOrganizationCreateDialog.value = true
  }

  /**
   * Open the edit organization dialog
   *
   * @param organization - Organization to edit
   */
  function openEditDialog (organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationEditDialog.value = true
  }

  /**
   * Open the view organization dialog
   *
   * @param organization - Organization to view
   */
  function openViewDialog (organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationViewDialog.value = true
  }

  /**
   * Open the delete organization dialog
   *
   * @param organization - Organization to delete
   */
  function openDeleteDialog (organization: Organization) {
    selectedOrganization.value = organization
    showOrganizationDeleteDialog.value = true
  }

  /**
   * Close all organization dialogs
   */
  function closeAllDialogs () {
    showOrganizationCreateDialog.value = false
    showOrganizationEditDialog.value = false
    showOrganizationViewDialog.value = false
    showOrganizationDeleteDialog.value = false
    selectedOrganization.value = null
  }

  return {
    // State
    organizations,
    selectedOrganization,
    organizationSearch,
    organizationLoading,
    filteredOrganizations,

    // Dialog states
    showOrganizationCreateDialog,
    showOrganizationEditDialog,
    showOrganizationViewDialog,
    showOrganizationDeleteDialog,

    // Actions
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeAllDialogs,
  }
}
