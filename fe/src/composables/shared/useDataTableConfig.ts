/**
 * @fileoverview Data table configuration composable
 *
 * Provides centralized configuration for Vuetify data tables used across
 * the organization management interface. Ensures consistent table structure
 * and behavior across all entity tables.
 */

import type { VDataTable } from 'vuetify/components'

export type DataTableHeaders = VDataTable['$props']['headers']

/**
 * Composable for data table configuration
 *
 * @returns Object containing table headers and pagination options
 *
 * @example
 * ```typescript
 * const tableConfig = useDataTableConfig()
 *
 * // Use in template
 * <v-data-table
 *   :headers="tableConfig.organizationHeaders"
 *   :items-per-page-options="tableConfig.itemsPerPageOptions"
 * />
 * ```
 */
export function useDataTableConfig () {
  /**
   * Column configuration for organizations table
   */
  const organizationHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Description', key: 'description', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '150px' },
  ]

  /**
   * Column configuration for departments table
   */
  const departmentHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Manager', key: 'managerId', sortable: true },
    { title: 'Description', key: 'description', sortable: true },
    { title: 'Organization', key: 'organizationId', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '200px' },
  ]

  /**
   * Column configuration for staff table
   */
  const staffHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Role', key: 'role', sortable: true },
    { title: 'Department', key: 'departmentId', sortable: true },
    { title: 'Organization', key: 'organizationId', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, width: '250px' },
  ]

  /**
   * Pagination options for all data tables
   */
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  return {
    organizationHeaders,
    departmentHeaders,
    staffHeaders,
    itemsPerPageOptions,
  }
}
