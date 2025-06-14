/**
 * @fileoverview Complexity service module
 *
 * This module contains all business logic related to complexity management,
 * including complexity creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Complexity,
  CreateComplexityInput,
  UpdateComplexityInput,
} from '../types';

/**
 * Service class for complexity management operations
 */
export class ComplexityService {
  constructor(private readonly db: Database) {}

  /**
   * Get all complexities
   * @returns Promise resolving to array of all complexities
   */
  public async getAllComplexities(): Promise<Complexity[]> {
    return this.db.data.complexities;
  }

  /**
   * Find a complexity by ID
   * @param id - Complexity ID to find
   * @returns Promise resolving to the complexity object or null if not found
   */
  public async findById(id: string): Promise<Complexity | null> {
    const complexity = this.db.data.complexities.find((c) => c.id === id);
    return complexity || null;
  }

  /**
   * Create a new complexity
   * @param complexityData - Complexity creation data
   * @returns Promise resolving to the created complexity object
   * @throws Error if name is already in use
   */
  public async createComplexity(
    complexityData: CreateComplexityInput,
  ): Promise<Complexity> {
    // Check if name already exists
    const existingComplexity = this.db.data.complexities.find(
      (complexity) =>
        complexity.name.toLowerCase() === complexityData.name.toLowerCase(),
    );
    if (existingComplexity) {
      throw new Error('Complexity name already exists');
    }

    // Create new complexity object
    const newComplexity: Complexity = {
      id: uuidv4(),
      name: complexityData.name,
    };

    // Add to database
    this.db.data.complexities.push(newComplexity);
    await this.db.write();

    return newComplexity;
  }

  /**
   * Update an existing complexity
   * @param updateData - Complexity update data
   * @returns Promise resolving to the updated complexity object
   * @throws Error if complexity not found or name conflict
   */
  public async updateComplexity(
    updateData: UpdateComplexityInput,
  ): Promise<Complexity> {
    // Find existing complexity
    const existingComplexity = this.db.data.complexities.find(
      (complexity) => complexity.id === updateData.id,
    );
    if (!existingComplexity) {
      throw new Error('Complexity not found');
    }

    // Check if new name conflicts with another complexity
    const conflictingComplexity = this.db.data.complexities.find(
      (complexity) =>
        complexity.id !== updateData.id &&
        complexity.name.toLowerCase() === updateData.name.toLowerCase(),
    );
    if (conflictingComplexity) {
      throw new Error('Complexity name already exists');
    }

    // Update complexity
    existingComplexity.name = updateData.name;
    await this.db.write();

    return existingComplexity;
  }

  /**
   * Delete a complexity by ID
   * @param id - Complexity ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if complexity not found or has dependencies
   */
  public async deleteComplexity(id: string): Promise<boolean> {
    // Check if complexity exists
    const complexityIndex = this.db.data.complexities.findIndex(
      (complexity) => complexity.id === id,
    );
    if (complexityIndex === -1) {
      throw new Error('Complexity not found');
    }

    // Check for dependencies
    const tasksUsingComplexity = this.db.data.tasks.filter(
      (task) => task.complexityId === id,
    );
    if (tasksUsingComplexity.length > 0) {
      throw new Error('Cannot delete complexity: it is being used by tasks');
    }

    // Remove complexity
    this.db.data.complexities.splice(complexityIndex, 1);
    await this.db.write();

    return true;
  }
}
