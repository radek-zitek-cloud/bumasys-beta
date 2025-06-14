/**
 * @fileoverview Task Evaluation service module
 *
 * This module contains all business logic related to task evaluation management,
 * including evaluation creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  TaskEvaluation,
  CreateTaskEvaluationInput,
  UpdateTaskEvaluationInput,
} from '../types';

/**
 * Service class for task evaluation management operations
 */
export class TaskEvaluationService {
  constructor(private readonly db: Database) {}

  /**
   * Get all task evaluations
   * @param taskId - Optional filter by task ID
   * @returns Promise resolving to array of task evaluations
   */
  public async getAllTaskEvaluations(
    taskId?: string,
  ): Promise<TaskEvaluation[]> {
    let evaluations = this.db.data.taskEvaluations;
    if (taskId) {
      evaluations = evaluations.filter(
        (evaluation) => evaluation.taskId === taskId,
      );
    }
    return evaluations;
  }

  /**
   * Find a task evaluation by ID
   * @param id - Evaluation ID to find
   * @returns Promise resolving to the evaluation object or null if not found
   */
  public async findById(id: string): Promise<TaskEvaluation | null> {
    const evaluation = this.db.data.taskEvaluations.find((e) => e.id === id);
    return evaluation || null;
  }

  /**
   * Find a task evaluation by task ID
   * @param taskId - Task ID to find evaluation for
   * @returns Promise resolving to the evaluation object or null if not found
   */
  public async findByTaskId(taskId: string): Promise<TaskEvaluation | null> {
    const evaluation = this.db.data.taskEvaluations.find(
      (e) => e.taskId === taskId,
    );
    return evaluation || null;
  }

  /**
   * Create a new task evaluation
   * @param evaluationData - Evaluation creation data
   * @returns Promise resolving to the created evaluation object
   * @throws Error if validation fails
   */
  public async createTaskEvaluation(
    evaluationData: CreateTaskEvaluationInput,
  ): Promise<TaskEvaluation> {
    // Validate task exists
    const task = this.db.data.tasks.find((t) => t.id === evaluationData.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Validate evaluator exists
    const evaluator = this.db.data.staff.find(
      (s) => s.id === evaluationData.evaluatorId,
    );
    if (!evaluator) {
      throw new Error('Evaluator not found');
    }

    // Check if evaluation already exists for this task
    const existingEvaluation = this.db.data.taskEvaluations.find(
      (e) => e.taskId === evaluationData.taskId,
    );
    if (existingEvaluation) {
      throw new Error('Task evaluation already exists for this task');
    }

    // Create new evaluation object
    const newEvaluation: TaskEvaluation = {
      id: uuidv4(),
      taskId: evaluationData.taskId,
      evaluatorId: evaluationData.evaluatorId,
      evaluationDate: evaluationData.evaluationDate,
      evaluationNotes: evaluationData.evaluationNotes,
      result: evaluationData.result,
    };

    // Add to database
    this.db.data.taskEvaluations.push(newEvaluation);
    await this.db.write();

    return newEvaluation;
  }

  /**
   * Update an existing task evaluation
   * @param updateData - Evaluation update data
   * @returns Promise resolving to the updated evaluation object
   * @throws Error if evaluation not found or validation fails
   */
  public async updateTaskEvaluation(
    updateData: UpdateTaskEvaluationInput,
  ): Promise<TaskEvaluation> {
    // Find existing evaluation
    const existingEvaluation = this.db.data.taskEvaluations.find(
      (evaluation) => evaluation.id === updateData.id,
    );
    if (!existingEvaluation) {
      throw new Error('Task evaluation not found');
    }

    // Validate evaluator if provided
    if (updateData.evaluatorId) {
      const evaluator = this.db.data.staff.find(
        (s) => s.id === updateData.evaluatorId,
      );
      if (!evaluator) {
        throw new Error('Evaluator not found');
      }
    }

    // Update evaluation properties
    if (updateData.evaluatorId !== undefined) {
      existingEvaluation.evaluatorId = updateData.evaluatorId;
    }
    if (updateData.evaluationDate !== undefined) {
      existingEvaluation.evaluationDate = updateData.evaluationDate;
    }
    if (updateData.evaluationNotes !== undefined) {
      existingEvaluation.evaluationNotes = updateData.evaluationNotes;
    }
    if (updateData.result !== undefined) {
      existingEvaluation.result = updateData.result;
    }

    await this.db.write();
    return existingEvaluation;
  }

  /**
   * Delete a task evaluation by ID
   * @param id - Evaluation ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if evaluation not found
   */
  public async deleteTaskEvaluation(id: string): Promise<boolean> {
    // Check if evaluation exists
    const evaluationIndex = this.db.data.taskEvaluations.findIndex(
      (evaluation) => evaluation.id === id,
    );
    if (evaluationIndex === -1) {
      throw new Error('Task evaluation not found');
    }

    // Remove evaluation
    this.db.data.taskEvaluations.splice(evaluationIndex, 1);
    await this.db.write();

    return true;
  }
}
