/**
 * @fileoverview Task Progress service module
 *
 * This module contains all business logic related to task progress management,
 * including progress report creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  TaskProgress,
  CreateTaskProgressInput,
  UpdateTaskProgressInput,
} from '../types';

/**
 * Service class for task progress management operations
 */
export class TaskProgressService {
  constructor(private readonly db: Database) {}

  /**
   * Get all task progress reports
   * @param taskId - Optional filter by task ID
   * @returns Promise resolving to array of task progress reports
   */
  public async getAllTaskProgress(taskId?: string): Promise<TaskProgress[]> {
    let reports = this.db.data.taskProgress;
    if (taskId) {
      reports = reports.filter((report) => report.taskId === taskId);
    }
    return reports;
  }

  /**
   * Find a task progress report by ID
   * @param id - Progress report ID to find
   * @returns Promise resolving to the progress report object or null if not found
   */
  public async findById(id: string): Promise<TaskProgress | null> {
    const report = this.db.data.taskProgress.find((r) => r.id === id);
    return report || null;
  }

  /**
   * Create a new task progress report
   * @param progressData - Progress report creation data
   * @returns Promise resolving to the created progress report object
   * @throws Error if validation fails
   */
  public async createTaskProgress(
    progressData: CreateTaskProgressInput,
  ): Promise<TaskProgress> {
    // Validate task exists
    const task = this.db.data.tasks.find((t) => t.id === progressData.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Validate progress percentage
    if (
      progressData.progressPercent < 0 ||
      progressData.progressPercent > 100
    ) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Create new progress report object
    const newProgress: TaskProgress = {
      id: uuidv4(),
      taskId: progressData.taskId,
      reportDate: progressData.reportDate,
      progressPercent: progressData.progressPercent,
      notes: progressData.notes,
    };

    // Add to database
    this.db.data.taskProgress.push(newProgress);
    await this.db.write();

    return newProgress;
  }

  /**
   * Update an existing task progress report
   * @param updateData - Progress report update data
   * @returns Promise resolving to the updated progress report object
   * @throws Error if progress report not found or validation fails
   */
  public async updateTaskProgress(
    updateData: UpdateTaskProgressInput,
  ): Promise<TaskProgress> {
    // Find existing progress report
    const existingProgress = this.db.data.taskProgress.find(
      (progress) => progress.id === updateData.id,
    );
    if (!existingProgress) {
      throw new Error('Task progress report not found');
    }

    // Validate progress percentage if provided
    if (updateData.progressPercent !== undefined) {
      if (updateData.progressPercent < 0 || updateData.progressPercent > 100) {
        throw new Error('Progress percentage must be between 0 and 100');
      }
    }

    // Update progress report properties
    if (updateData.reportDate !== undefined) {
      existingProgress.reportDate = updateData.reportDate;
    }
    if (updateData.progressPercent !== undefined) {
      existingProgress.progressPercent = updateData.progressPercent;
    }
    if (updateData.notes !== undefined) {
      existingProgress.notes = updateData.notes;
    }

    await this.db.write();
    return existingProgress;
  }

  /**
   * Delete a task progress report by ID
   * @param id - Progress report ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if progress report not found
   */
  public async deleteTaskProgress(id: string): Promise<boolean> {
    // Check if progress report exists
    const progressIndex = this.db.data.taskProgress.findIndex(
      (progress) => progress.id === id,
    );
    if (progressIndex === -1) {
      throw new Error('Task progress report not found');
    }

    // Remove progress report
    this.db.data.taskProgress.splice(progressIndex, 1);
    await this.db.write();

    return true;
  }
}
