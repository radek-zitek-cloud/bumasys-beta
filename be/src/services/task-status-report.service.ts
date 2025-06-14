/**
 * @fileoverview Task Status Report service module
 *
 * This module contains all business logic related to task status report management,
 * including status report creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  TaskStatusReport,
  CreateTaskStatusReportInput,
  UpdateTaskStatusReportInput,
} from '../types';

/**
 * Service class for task status report management operations
 */
export class TaskStatusReportService {
  constructor(private readonly db: Database) {}

  /**
   * Get all task status reports
   * @param taskId - Optional filter by task ID
   * @returns Promise resolving to array of task status reports
   */
  public async getAllTaskStatusReports(
    taskId?: string,
  ): Promise<TaskStatusReport[]> {
    let reports = this.db.data.taskStatusReports;
    if (taskId) {
      reports = reports.filter((report) => report.taskId === taskId);
    }
    return reports;
  }

  /**
   * Find a task status report by ID
   * @param id - Status report ID to find
   * @returns Promise resolving to the status report object or null if not found
   */
  public async findById(id: string): Promise<TaskStatusReport | null> {
    const report = this.db.data.taskStatusReports.find((r) => r.id === id);
    return report || null;
  }

  /**
   * Create a new task status report
   * @param reportData - Status report creation data
   * @returns Promise resolving to the created status report object
   * @throws Error if validation fails
   */
  public async createTaskStatusReport(
    reportData: CreateTaskStatusReportInput,
  ): Promise<TaskStatusReport> {
    // Validate task exists
    const task = this.db.data.tasks.find((t) => t.id === reportData.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Create new status report object
    const newReport: TaskStatusReport = {
      id: uuidv4(),
      taskId: reportData.taskId,
      reportDate: reportData.reportDate,
      statusSummary: reportData.statusSummary,
    };

    // Add to database
    this.db.data.taskStatusReports.push(newReport);
    await this.db.write();

    return newReport;
  }

  /**
   * Update an existing task status report
   * @param updateData - Status report update data
   * @returns Promise resolving to the updated status report object
   * @throws Error if status report not found
   */
  public async updateTaskStatusReport(
    updateData: UpdateTaskStatusReportInput,
  ): Promise<TaskStatusReport> {
    // Find existing status report
    const existingReport = this.db.data.taskStatusReports.find(
      (report) => report.id === updateData.id,
    );
    if (!existingReport) {
      throw new Error('Task status report not found');
    }

    // Update report properties
    if (updateData.reportDate !== undefined) {
      existingReport.reportDate = updateData.reportDate;
    }
    if (updateData.statusSummary !== undefined) {
      existingReport.statusSummary = updateData.statusSummary;
    }

    await this.db.write();
    return existingReport;
  }

  /**
   * Delete a task status report by ID
   * @param id - Status report ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if status report not found
   */
  public async deleteTaskStatusReport(id: string): Promise<boolean> {
    // Check if status report exists
    const reportIndex = this.db.data.taskStatusReports.findIndex(
      (report) => report.id === id,
    );
    if (reportIndex === -1) {
      throw new Error('Task status report not found');
    }

    // Remove status report
    this.db.data.taskStatusReports.splice(reportIndex, 1);
    await this.db.write();

    return true;
  }
}
