/**
 * @fileoverview Entity helper functions composable
 *
 * Provides helper functions for resolving entity names and relationships
 * across organizations, departments, and staff. These functions are used
 * throughout the application for displaying human-readable names instead of IDs.
 */

import type { Ref } from 'vue'
import type { Department } from '../../services/departments'
import type { Organization } from '../../services/organizations'
import type { Staff } from '../../services/staff'

/**
 * Composable for entity helper functions
 *
 * @param organizations - Reactive reference to organizations array
 * @param departments - Reactive reference to departments array
 * @param staff - Reactive reference to staff array
 * @returns Object containing helper functions for entity name resolution
 *
 * @example
 * ```typescript
 * const entityHelpers = useEntityHelpers(organizations, departments, staff)
 *
 * // Get organization name by ID
 * const orgName = entityHelpers.getOrganizationName('org-123')
 *
 * // Get department name by ID
 * const deptName = entityHelpers.getDepartmentName('dept-456')
 * ```
 */
export function useEntityHelpers (
  organizations: Ref<Organization[]>,
  departments: Ref<Department[]>,
  staff: Ref<Staff[]>,
) {
  /**
   * Get organization name by ID
   *
   * @param id - Organization ID
   * @returns Organization name or 'Unknown' if not found
   */
  function getOrganizationName (id: string): string {
    const org = organizations.value.find(o => o.id === id)
    return org ? org.name : 'Unknown'
  }

  /**
   * Get department name by ID
   *
   * @param id - Department ID
   * @returns Department name or 'Unknown' if not found
   */
  function getDepartmentName (id: string): string {
    const dept = departments.value.find(d => d.id === id)
    return dept ? dept.name : 'Unknown'
  }

  /**
   * Get staff member full name by ID
   *
   * @param id - Staff member ID
   * @returns Full name (first + last) or 'Unknown' if not found
   */
  function getStaffName (id: string): string {
    const staffMember = staff.value.find(s => s.id === id)
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Unknown'
  }

  /**
   * Get organization by ID
   *
   * @param id - Organization ID
   * @returns Organization object or undefined if not found
   */
  function getOrganization (id: string): Organization | undefined {
    return organizations.value.find(o => o.id === id)
  }

  /**
   * Get department by ID
   *
   * @param id - Department ID
   * @returns Department object or undefined if not found
   */
  function getDepartment (id: string): Department | undefined {
    return departments.value.find(d => d.id === id)
  }

  /**
   * Get staff member by ID
   *
   * @param id - Staff member ID
   * @returns Staff object or undefined if not found
   */
  function getStaffMember (id: string): Staff | undefined {
    return staff.value.find(s => s.id === id)
  }

  /**
   * Get all departments for a specific organization
   *
   * @param organizationId - Organization ID
   * @returns Array of departments belonging to the organization
   */
  function getDepartmentsByOrganization (organizationId: string): Department[] {
    return departments.value.filter(d => d.organizationId === organizationId)
  }

  /**
   * Get all staff members for a specific department
   *
   * @param departmentId - Department ID
   * @returns Array of staff members belonging to the department
   */
  function getStaffByDepartment (departmentId: string): Staff[] {
    return staff.value.filter(s => s.departmentId === departmentId)
  }

  /**
   * Get all staff members for a specific organization
   *
   * @param organizationId - Organization ID
   * @returns Array of staff members belonging to the organization
   */
  function getStaffByOrganization (organizationId: string): Staff[] {
    return staff.value.filter(s => s.organizationId === organizationId)
  }

  return {
    getOrganizationName,
    getDepartmentName,
    getStaffName,
    getOrganization,
    getDepartment,
    getStaffMember,
    getDepartmentsByOrganization,
    getStaffByDepartment,
    getStaffByOrganization,
  }
}
