/**
 * @fileoverview Staff service module
 *
 * This module contains all business logic related to staff management,
 * including staff creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Staff,
  CreateStaffInput,
  UpdateStaffInput,
} from '../types';

/**
 * Service class for staff management operations
 */
export class StaffService {
  private db: Database;

  /**
   * Initialize the staff service with a database instance
   * @param database - The database instance to use for operations
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Find a staff member by ID
   * @param id - Staff ID to search for
   * @returns Staff object if found, undefined otherwise
   */
  public findById(id: string): Staff | undefined {
    return this.db.data.staff.find((staff) => staff.id === id);
  }

  /**
   * Find a staff member by email
   * @param email - Email address to search for
   * @returns Staff object if found, undefined otherwise
   */
  public findByEmail(email: string): Staff | undefined {
    return this.db.data.staff.find((staff) => staff.email === email);
  }

  /**
   * Get all staff members
   * @returns Array of all staff objects
   */
  public getAllStaff(): Staff[] {
    return this.db.data.staff;
  }

  /**
   * Get staff members for a specific organization
   * @param organizationId - Organization ID to filter by
   * @returns Array of staff objects belonging to the organization
   */
  public getStaffByOrganization(organizationId: string): Staff[] {
    return this.db.data.staff.filter(
      (staff) => staff.organizationId === organizationId,
    );
  }

  /**
   * Get staff members for a specific department
   * @param departmentId - Department ID to filter by
   * @returns Array of staff objects belonging to the department
   */
  public getStaffByDepartment(departmentId: string): Staff[] {
    return this.db.data.staff.filter(
      (staff) => staff.departmentId === departmentId,
    );
  }

  /**
   * Get subordinates of a supervisor
   * @param supervisorId - Supervisor's staff ID
   * @returns Array of staff objects who report to the supervisor
   */
  public getSubordinates(supervisorId: string): Staff[] {
    return this.db.data.staff.filter(
      (staff) => staff.supervisorId === supervisorId,
    );
  }

  /**
   * Create a new staff member with the provided information
   * @param staffData - Staff creation data
   * @returns Promise resolving to the created staff object
   * @throws Error if email is already in use or validation fails
   */
  public async createStaff(staffData: CreateStaffInput): Promise<Staff> {
    // Check if email is already in use
    const existingStaff = this.findByEmail(staffData.email);
    if (existingStaff) {
      throw new Error('Email already in use');
    }

    // Validate organization exists
    const organization = this.db.data.organizations.find(
      (org) => org.id === staffData.organizationId,
    );
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Validate department exists and belongs to the organization
    const department = this.db.data.departments.find(
      (dept) =>
        dept.id === staffData.departmentId &&
        dept.organizationId === staffData.organizationId,
    );
    if (!department) {
      throw new Error(
        'Department not found or does not belong to the specified organization',
      );
    }

    // Validate supervisor if provided
    if (staffData.supervisorId) {
      const supervisor = this.db.data.staff.find(
        (staff) =>
          staff.id === staffData.supervisorId &&
          staff.organizationId === staffData.organizationId,
      );
      if (!supervisor) {
        throw new Error(
          'Supervisor not found or does not belong to the same organization',
        );
      }
    }

    // Create new staff object
    const newStaff: Staff = {
      id: uuidv4(),
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role,
      organizationId: staffData.organizationId,
      departmentId: staffData.departmentId,
      supervisorId: staffData.supervisorId,
    };

    // Add to database
    this.db.data.staff.push(newStaff);
    await this.db.write();

    return newStaff;
  }

  /**
   * Update an existing staff member's information
   * @param updateData - Staff update data including ID
   * @returns Promise resolving to the updated staff object
   * @throws Error if staff is not found or validation fails
   */
  public async updateStaff(updateData: UpdateStaffInput): Promise<Staff> {
    const staff = this.findById(updateData.id);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Check for email conflicts if email is being updated
    if (updateData.email !== undefined && updateData.email !== staff.email) {
      const existingStaff = this.findByEmail(updateData.email);
      if (existingStaff) {
        throw new Error('Email already in use');
      }
    }

    // Update fields if provided
    if (updateData.firstName !== undefined) {
      staff.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      staff.lastName = updateData.lastName;
    }
    if (updateData.email !== undefined) {
      staff.email = updateData.email;
    }
    if (updateData.phone !== undefined) {
      staff.phone = updateData.phone;
    }
    if (updateData.role !== undefined) {
      staff.role = updateData.role;
    }
    if (updateData.departmentId !== undefined) {
      // Validate department exists and belongs to the same organization
      const department = this.db.data.departments.find(
        (dept) =>
          dept.id === updateData.departmentId &&
          dept.organizationId === staff.organizationId,
      );
      if (!department) {
        throw new Error(
          'Department not found or does not belong to the same organization',
        );
      }
      staff.departmentId = updateData.departmentId;
    }
    if (updateData.supervisorId !== undefined) {
      // Validate supervisor if provided
      if (updateData.supervisorId) {
        const supervisor = this.db.data.staff.find(
          (s) =>
            s.id === updateData.supervisorId &&
            s.organizationId === staff.organizationId,
        );
        if (!supervisor) {
          throw new Error(
            'Supervisor not found or does not belong to the same organization',
          );
        }
        // Prevent self-supervision
        if (updateData.supervisorId === staff.id) {
          throw new Error('Staff member cannot supervise themselves');
        }
        // Check for circular supervision
        if (
          this.wouldCreateCircularSupervision(staff.id, updateData.supervisorId)
        ) {
          throw new Error('Update would create circular supervision hierarchy');
        }
      }
      staff.supervisorId = updateData.supervisorId;
    }

    // Save changes
    await this.db.write();

    return staff;
  }

  /**
   * Delete a staff member by ID
   * @param id - ID of the staff member to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if staff member has dependencies
   */
  public async deleteStaff(id: string): Promise<boolean> {
    const index = this.db.data.staff.findIndex((staff) => staff.id === id);
    if (index === -1) {
      return false;
    }

    const staff = this.db.data.staff[index];

    // Check for dependencies - subordinates or department management
    const hasSubordinates = this.db.data.staff.some(
      (s) => s.supervisorId === id,
    );
    const managesDepartments = this.db.data.departments.some(
      (dept) => dept.managerId === id,
    );

    if (hasSubordinates || managesDepartments) {
      throw new Error(
        'Cannot delete staff member who has subordinates or manages departments',
      );
    }

    // Check if this staff is referenced as root staff in organization
    const organization = this.db.data.organizations.find(
      (org) => org.rootStaffId === id,
    );
    if (organization) {
      // Clear the root staff reference
      organization.rootStaffId = undefined;
    }

    // Remove staff from array
    this.db.data.staff.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Check if setting a supervisor would create a circular reference
   * @param staffId - Staff ID that would get a new supervisor
   * @param newSupervisorId - Proposed supervisor ID
   * @returns true if it would create a circular reference
   */
  private wouldCreateCircularSupervision(
    staffId: string,
    newSupervisorId: string,
  ): boolean {
    let currentSupervisorId: string | undefined = newSupervisorId;

    while (currentSupervisorId) {
      if (currentSupervisorId === staffId) {
        return true;
      }
      const supervisor = this.findById(currentSupervisorId);
      currentSupervisorId = supervisor?.supervisorId;
    }

    return false;
  }

  /**
   * Get staff members with their subordinate counts
   * @param organizationId - Optional organization ID to filter by
   * @param departmentId - Optional department ID to filter by
   * @returns Array of staff with additional statistics
   */
  public getStaffWithStats(
    organizationId?: string,
    departmentId?: string,
  ): Array<Staff & { subordinateCount: number }> {
    let staff = this.getAllStaff();

    if (organizationId) {
      staff = staff.filter((s) => s.organizationId === organizationId);
    }

    if (departmentId) {
      staff = staff.filter((s) => s.departmentId === departmentId);
    }

    return staff.map((s) => ({
      ...s,
      subordinateCount: this.getSubordinates(s.id).length,
    }));
  }
}
