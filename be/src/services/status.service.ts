/**
 * @fileoverview Status service module
 *
 * This module contains all business logic related to status management,
 * including status creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Status,
  CreateStatusInput,
  UpdateStatusInput,
} from '../types';

/**
 * Service class for status management operations
 */
export class StatusService {
  constructor(private readonly db: Database) {}

  /**
   * Get all statuses
   * @returns Promise resolving to array of all statuses
   */
  public async getAllStatuses(): Promise<Status[]> {
    return this.db.data.statuses;
  }

  /**
   * Find a status by ID
   * @param id - Status ID to find
   * @returns Promise resolving to the status object or null if not found
   */
  public async findById(id: string): Promise<Status | null> {
    const status = this.db.data.statuses.find((s) => s.id === id);
    return status || null;
  }

  /**
   * Create a new status
   * @param statusData - Status creation data
   * @returns Promise resolving to the created status object
   * @throws Error if name is already in use
   */
  public async createStatus(statusData: CreateStatusInput): Promise<Status> {
    // Check if name already exists
    const existingStatus = this.db.data.statuses.find(
      (status) => status.name.toLowerCase() === statusData.name.toLowerCase(),
    );
    if (existingStatus) {
      throw new Error('Status name already exists');
    }

    // Create new status object
    const newStatus: Status = {
      id: uuidv4(),
      name: statusData.name,
    };

    // Add to database
    this.db.data.statuses.push(newStatus);
    await this.db.write();

    return newStatus;
  }

  /**
   * Update an existing status
   * @param updateData - Status update data
   * @returns Promise resolving to the updated status object
   * @throws Error if status not found or name conflict
   */
  public async updateStatus(updateData: UpdateStatusInput): Promise<Status> {
    // Find existing status
    const existingStatus = this.db.data.statuses.find(
      (status) => status.id === updateData.id,
    );
    if (!existingStatus) {
      throw new Error('Status not found');
    }

    // Check if new name conflicts with another status
    const conflictingStatus = this.db.data.statuses.find(
      (status) =>
        status.id !== updateData.id &&
        status.name.toLowerCase() === updateData.name.toLowerCase(),
    );
    if (conflictingStatus) {
      throw new Error('Status name already exists');
    }

    // Update status
    existingStatus.name = updateData.name;
    await this.db.write();

    return existingStatus;
  }

  /**
   * Delete a status by ID
   * @param id - Status ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if status not found or has dependencies
   */
  public async deleteStatus(id: string): Promise<boolean> {
    // Check if status exists
    const statusIndex = this.db.data.statuses.findIndex(
      (status) => status.id === id,
    );
    if (statusIndex === -1) {
      throw new Error('Status not found');
    }

    // Check for dependencies
    const tasksUsingStatus = this.db.data.tasks.filter(
      (task) => task.statusId === id,
    );
    if (tasksUsingStatus.length > 0) {
      throw new Error('Cannot delete status: it is being used by tasks');
    }

    // Remove status
    this.db.data.statuses.splice(statusIndex, 1);
    await this.db.write();

    return true;
  }
}