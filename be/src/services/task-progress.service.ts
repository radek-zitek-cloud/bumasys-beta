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
   * @param userEmail - Email of the logged-in user (for creator auto-assignment)
   * @returns Promise resolving to the created progress report object
   * @throws Error if validation fails
   */
  public async createTaskProgress(
    progressData: CreateTaskProgressInput,
    userEmail?: string,
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

    // Determine creator
    let creatorId = progressData.creatorId;

    // If no explicit creator provided, try to auto-assign based on user email
    if (!creatorId && userEmail) {
      const staff = this.db.data.staff.find((s) => s.email === userEmail);
      if (staff) {
        // Check if this staff member is assigned to the task or is the evaluator
        const isAssigned = this.db.data.taskAssignees.some(
          (assignee) =>
            assignee.taskId === progressData.taskId &&
            assignee.staffId === staff.id,
        );
        const isEvaluator = task.evaluatorId === staff.id;

        if (isAssigned || isEvaluator) {
          creatorId = staff.id;
        }
      }
    }

    // If explicit creator provided, validate they are authorized
    if (creatorId) {
      const staff = this.db.data.staff.find((s) => s.id === creatorId);
      if (!staff) {
        throw new Error('Creator staff not found');
      }

      const isAssigned = this.db.data.taskAssignees.some(
        (assignee) =>
          assignee.taskId === progressData.taskId &&
          assignee.staffId === creatorId,
      );
      const isEvaluator = task.evaluatorId === creatorId;

      if (!isAssigned && !isEvaluator) {
        throw new Error(
          'Creator must be assigned to the task or be the evaluator',
        );
      }
    }

    // Create new progress report object
    const newProgress: TaskProgress = {
      id: uuidv4(),
      taskId: progressData.taskId,
      reportDate: progressData.reportDate,
      progressPercent: progressData.progressPercent,
      notes: progressData.notes,
      creatorId,
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
