/**
 * @fileoverview Organization service module
 *
 * This module contains all business logic related to organization management,
 * including organization creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '../types';

/**
 * Service class for organization management operations
 */
export class OrganizationService {
  private db: Database;

  /**
   * Initialize the organization service with a database instance
   * @param database - The database instance to use for operations
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Find an organization by ID
   * @param id - Organization ID to search for
   * @returns Organization object if found, undefined otherwise
   */
  public findById(id: string): Organization | undefined {
    return this.db.data.organizations.find((org) => org.id === id);
  }

  /**
   * Find an organization by name
   * @param name - Organization name to search for
   * @returns Organization object if found, undefined otherwise
   */
  public findByName(name: string): Organization | undefined {
    return this.db.data.organizations.find((org) => org.name === name);
  }

  /**
   * Get all organizations
   * @returns Array of all organization objects
   */
  public getAllOrganizations(): Organization[] {
    return this.db.data.organizations;
  }

  /**
   * Create a new organization with the provided information
   * @param orgData - Organization creation data
   * @returns Promise resolving to the created organization object
   * @throws Error if organization name is already in use
   */
  public async createOrganization(
    orgData: CreateOrganizationInput,
  ): Promise<Organization> {
    // Check if organization name is already in use
    const existingOrg = this.findByName(orgData.name);
    if (existingOrg) {
      throw new Error('Organization name already in use');
    }

    // Create new organization object
    const newOrganization: Organization = {
      id: uuidv4(),
      name: orgData.name,
      description: orgData.description,
    };

    // Add to database
    this.db.data.organizations.push(newOrganization);
    await this.db.write();

    return newOrganization;
  }

  /**
   * Update an existing organization's information
   * @param updateData - Organization update data including ID
   * @returns Promise resolving to the updated organization object
   * @throws Error if organization is not found or name conflict exists
   */
  public async updateOrganization(
    updateData: UpdateOrganizationInput,
  ): Promise<Organization> {
    const organization = this.findById(updateData.id);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check for name conflicts if name is being updated
    if (
      updateData.name !== undefined &&
      updateData.name !== organization.name
    ) {
      const existingOrg = this.findByName(updateData.name);
      if (existingOrg) {
        throw new Error('Organization name already in use');
      }
    }

    // Update fields if provided
    if (updateData.name !== undefined) {
      organization.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      organization.description = updateData.description;
    }
    if (updateData.rootDepartmentId !== undefined) {
      // Validate department exists and belongs to this organization
      const department = this.db.data.departments.find(
        (dept) =>
          dept.id === updateData.rootDepartmentId &&
          dept.organizationId === organization.id,
      );
      if (updateData.rootDepartmentId && !department) {
        throw new Error(
          'Department not found or does not belong to this organization',
        );
      }
      organization.rootDepartmentId = updateData.rootDepartmentId;
    }
    if (updateData.rootStaffId !== undefined) {
      // Validate staff exists and belongs to this organization
      const staff = this.db.data.staff.find(
        (s) =>
          s.id === updateData.rootStaffId &&
          s.organizationId === organization.id,
      );
      if (updateData.rootStaffId && !staff) {
        throw new Error(
          'Staff member not found or does not belong to this organization',
        );
      }
      organization.rootStaffId = updateData.rootStaffId;
    }

    // Save changes
    await this.db.write();

    return organization;
  }

  /**
   * Delete an organization by ID
   * @param id - ID of the organization to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if organization has dependencies
   */
  public async deleteOrganization(id: string): Promise<boolean> {
    const index = this.db.data.organizations.findIndex((org) => org.id === id);
    if (index === -1) {
      return false;
    }

    // Check for dependencies - departments and staff
    const hasDepartments = this.db.data.departments.some(
      (dept) => dept.organizationId === id,
    );
    const hasStaff = this.db.data.staff.some(
      (staff) => staff.organizationId === id,
    );

    if (hasDepartments || hasStaff) {
      throw new Error(
        'Cannot delete organization with existing departments or staff members',
      );
    }

    // Remove organization from array
    this.db.data.organizations.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Get organizations with their department and staff counts
   * @returns Array of organizations with additional statistics
   */
  public getOrganizationsWithStats(): Array<
    Organization & { departmentCount: number; staffCount: number }
  > {
    return this.db.data.organizations.map((org) => ({
      ...org,
      departmentCount: this.db.data.departments.filter(
        (dept) => dept.organizationId === org.id,
      ).length,
      staffCount: this.db.data.staff.filter(
        (staff) => staff.organizationId === org.id,
      ).length,
    }));
  }
}
