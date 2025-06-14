/**
 * @fileoverview Department service module
 *
 * This module contains all business logic related to department management,
 * including department creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import type {
  Database,
  Department,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../types';

/**
 * Service class for department management operations
 */
export class DepartmentService {
  private db: Database;

  /**
   * Initialize the department service with a database instance
   * @param database - The database instance to use for operations
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Find a department by ID
   * @param id - Department ID to search for
   * @returns Department object if found, undefined otherwise
   */
  public findById(id: string): Department | undefined {
    logger.debug({ operation: 'findById', departmentId: id }, 'Searching for department by ID');
    const department = this.db.data.departments.find((dept) => dept.id === id);
    logger.debug({ operation: 'findById', departmentId: id, found: !!department }, 'Department search by ID completed');
    return department;
  }

  /**
   * Get all departments
   * @returns Array of all department objects
   */
  public getAllDepartments(): Department[] {
    return this.db.data.departments;
  }

  /**
   * Get departments for a specific organization
   * @param organizationId - Organization ID to filter by
   * @returns Array of department objects belonging to the organization
   */
  public getDepartmentsByOrganization(organizationId: string): Department[] {
    return this.db.data.departments.filter(
      (dept) => dept.organizationId === organizationId,
    );
  }

  /**
   * Get child departments of a parent department
   * @param parentDepartmentId - Parent department ID
   * @returns Array of child department objects
   */
  public getChildDepartments(parentDepartmentId: string): Department[] {
    return this.db.data.departments.filter(
      (dept) => dept.parentDepartmentId === parentDepartmentId,
    );
  }

  /**
   * Create a new department with the provided information
   * @param deptData - Department creation data
   * @returns Promise resolving to the created department object
   * @throws Error if organization doesn't exist or parent department is invalid
   */
  public async createDepartment(
    deptData: CreateDepartmentInput,
  ): Promise<Department> {
    logger.debug({ operation: 'createDepartment', name: deptData.name, organizationId: deptData.organizationId }, 'Creating new department');
    
    // Validate organization exists
    const organization = this.db.data.organizations.find(
      (org) => org.id === deptData.organizationId,
    );
    if (!organization) {
      logger.warn({ operation: 'createDepartment', organizationId: deptData.organizationId }, 'Attempted to create department for non-existent organization');
      throw new Error('Organization not found');
    }

    // Validate parent department if provided
    if (deptData.parentDepartmentId) {
      const parentDept = this.findById(deptData.parentDepartmentId);
      if (!parentDept) {
        logger.warn({ operation: 'createDepartment', parentDepartmentId: deptData.parentDepartmentId }, 'Attempted to create department with non-existent parent department');
        throw new Error('Parent department not found');
      }
      if (parentDept.organizationId !== deptData.organizationId) {
        logger.warn({ 
          operation: 'createDepartment', 
          parentDepartmentId: deptData.parentDepartmentId,
          parentOrgId: parentDept.organizationId,
          targetOrgId: deptData.organizationId
        }, 'Attempted to create department with parent from different organization');
        throw new Error(
          'Parent department must belong to the same organization',
        );
      }
    }

    try {
      // Create new department object
      const newDepartment: Department = {
        id: uuidv4(),
        name: deptData.name,
        description: deptData.description,
        organizationId: deptData.organizationId,
        parentDepartmentId: deptData.parentDepartmentId,
      };

      // Add to database
      this.db.data.departments.push(newDepartment);
      await this.db.write();

      logger.info({ operation: 'createDepartment', departmentId: newDepartment.id, name: deptData.name, organizationId: deptData.organizationId }, 'Department created successfully');
      return newDepartment;
    } catch (error) {
      logger.warn({ operation: 'createDepartment', name: deptData.name, organizationId: deptData.organizationId, error: error instanceof Error ? error.message : String(error) }, 'Department creation failed');
      throw error;
    }
  }

  /**
   * Update an existing department's information
   * @param updateData - Department update data including ID
   * @returns Promise resolving to the updated department object
   * @throws Error if department is not found or validation fails
   */
  public async updateDepartment(
    updateData: UpdateDepartmentInput,
  ): Promise<Department> {
    const department = this.findById(updateData.id);
    if (!department) {
      throw new Error('Department not found');
    }

    // Update fields if provided
    if (updateData.name !== undefined) {
      department.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      department.description = updateData.description;
    }
    if (updateData.parentDepartmentId !== undefined) {
      // Validate parent department if provided
      if (updateData.parentDepartmentId) {
        const parentDept = this.findById(updateData.parentDepartmentId);
        if (!parentDept) {
          throw new Error('Parent department not found');
        }
        if (parentDept.organizationId !== department.organizationId) {
          throw new Error(
            'Parent department must belong to the same organization',
          );
        }
        // Prevent circular references
        if (updateData.parentDepartmentId === department.id) {
          throw new Error('Department cannot be its own parent');
        }
        // Check for circular reference through hierarchy
        if (
          this.wouldCreateCircularReference(
            department.id,
            updateData.parentDepartmentId,
          )
        ) {
          throw new Error(
            'Update would create circular reference in department hierarchy',
          );
        }
      }
      department.parentDepartmentId = updateData.parentDepartmentId;
    }
    if (updateData.managerId !== undefined) {
      // Validate manager exists and belongs to this organization
      if (updateData.managerId) {
        const manager = this.db.data.staff.find(
          (staff) =>
            staff.id === updateData.managerId &&
            staff.organizationId === department.organizationId,
        );
        if (!manager) {
          throw new Error(
            'Manager not found or does not belong to this organization',
          );
        }
      }
      department.managerId = updateData.managerId;
    }

    // Save changes
    await this.db.write();

    return department;
  }

  /**
   * Delete a department by ID
   * @param id - ID of the department to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if department has dependencies
   */
  public async deleteDepartment(id: string): Promise<boolean> {
    const index = this.db.data.departments.findIndex((dept) => dept.id === id);
    if (index === -1) {
      return false;
    }

    // Check for dependencies - child departments and staff
    const hasChildDepartments = this.db.data.departments.some(
      (dept) => dept.parentDepartmentId === id,
    );
    const hasStaff = this.db.data.staff.some(
      (staff) => staff.departmentId === id,
    );

    if (hasChildDepartments || hasStaff) {
      throw new Error(
        'Cannot delete department with existing child departments or staff members',
      );
    }

    // Check if this department is referenced as root department in organization
    const organization = this.db.data.organizations.find(
      (org) => org.rootDepartmentId === id,
    );
    if (organization) {
      // Clear the root department reference
      organization.rootDepartmentId = undefined;
    }

    // Remove department from array
    this.db.data.departments.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Check if setting a parent would create a circular reference
   * @param deptId - Department ID that would get a new parent
   * @param newParentId - Proposed parent ID
   * @returns true if it would create a circular reference
   */
  private wouldCreateCircularReference(
    deptId: string,
    newParentId: string,
  ): boolean {
    let currentParentId: string | undefined = newParentId;

    while (currentParentId) {
      if (currentParentId === deptId) {
        return true;
      }
      const parentDept = this.findById(currentParentId);
      currentParentId = parentDept?.parentDepartmentId;
    }

    return false;
  }

  /**
   * Get departments with their staff counts
   * @param organizationId - Optional organization ID to filter by
   * @returns Array of departments with additional statistics
   */
  public getDepartmentsWithStats(
    organizationId?: string,
  ): Array<Department & { staffCount: number; childDepartmentCount: number }> {
    const departments = organizationId
      ? this.getDepartmentsByOrganization(organizationId)
      : this.getAllDepartments();

    return departments.map((dept) => ({
      ...dept,
      staffCount: this.db.data.staff.filter(
        (staff) => staff.departmentId === dept.id,
      ).length,
      childDepartmentCount: this.getChildDepartments(dept.id).length,
    }));
  }
}
