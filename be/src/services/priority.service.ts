/**
 * @fileoverview Priority service module
 *
 * This module contains all business logic related to priority management,
 * including priority creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Priority,
  CreatePriorityInput,
  UpdatePriorityInput,
} from '../types';

/**
 * Service class for priority management operations
 */
export class PriorityService {
  constructor(private readonly db: Database) {}

  /**
   * Get all priorities
   * @returns Promise resolving to array of all priorities
   */
  public async getAllPriorities(): Promise<Priority[]> {
    return this.db.data.priorities;
  }

  /**
   * Find a priority by ID
   * @param id - Priority ID to find
   * @returns Promise resolving to the priority object or null if not found
   */
  public async findById(id: string): Promise<Priority | null> {
    const priority = this.db.data.priorities.find((p) => p.id === id);
    return priority || null;
  }

  /**
   * Create a new priority
   * @param priorityData - Priority creation data
   * @returns Promise resolving to the created priority object
   * @throws Error if name is already in use
   */
  public async createPriority(priorityData: CreatePriorityInput): Promise<Priority> {
    // Check if name already exists
    const existingPriority = this.db.data.priorities.find(
      (priority) => priority.name.toLowerCase() === priorityData.name.toLowerCase(),
    );
    if (existingPriority) {
      throw new Error('Priority name already exists');
    }

    // Create new priority object
    const newPriority: Priority = {
      id: uuidv4(),
      name: priorityData.name,
    };

    // Add to database
    this.db.data.priorities.push(newPriority);
    await this.db.write();

    return newPriority;
  }

  /**
   * Update an existing priority
   * @param updateData - Priority update data
   * @returns Promise resolving to the updated priority object
   * @throws Error if priority not found or name conflict
   */
  public async updatePriority(updateData: UpdatePriorityInput): Promise<Priority> {
    // Find existing priority
    const existingPriority = this.db.data.priorities.find(
      (priority) => priority.id === updateData.id,
    );
    if (!existingPriority) {
      throw new Error('Priority not found');
    }

    // Check if new name conflicts with another priority
    const conflictingPriority = this.db.data.priorities.find(
      (priority) =>
        priority.id !== updateData.id &&
        priority.name.toLowerCase() === updateData.name.toLowerCase(),
    );
    if (conflictingPriority) {
      throw new Error('Priority name already exists');
    }

    // Update priority
    existingPriority.name = updateData.name;
    await this.db.write();

    return existingPriority;
  }

  /**
   * Delete a priority by ID
   * @param id - Priority ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if priority not found or has dependencies
   */
  public async deletePriority(id: string): Promise<boolean> {
    // Check if priority exists
    const priorityIndex = this.db.data.priorities.findIndex(
      (priority) => priority.id === id,
    );
    if (priorityIndex === -1) {
      throw new Error('Priority not found');
    }

    // Check for dependencies
    const tasksUsingPriority = this.db.data.tasks.filter(
      (task) => task.priorityId === id,
    );
    if (tasksUsingPriority.length > 0) {
      throw new Error('Cannot delete priority: it is being used by tasks');
    }

    // Remove priority
    this.db.data.priorities.splice(priorityIndex, 1);
    await this.db.write();

    return true;
  }
}