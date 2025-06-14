/**
 * @fileoverview Project Status Report service module
 *
 * This module contains all business logic related to project status report management,
 * including status report creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  ProjectStatusReport,
  CreateProjectStatusReportInput,
  UpdateProjectStatusReportInput,
} from '../types';

/**
 * Service class for project status report management operations
 */
export class ProjectStatusReportService {
  constructor(private readonly db: Database) {}

  /**
   * Get all project status reports
   * @param projectId - Optional filter by project ID
   * @returns Promise resolving to array of project status reports
   */
  public async getAllProjectStatusReports(
    projectId?: string,
  ): Promise<ProjectStatusReport[]> {
    let reports = this.db.data.projectStatusReports;
    if (projectId) {
      reports = reports.filter((report) => report.projectId === projectId);
    }
    return reports;
  }

  /**
   * Find a project status report by ID
   * @param id - Status report ID to find
   * @returns Promise resolving to the status report object or null if not found
   */
  public async findById(id: string): Promise<ProjectStatusReport | null> {
    const report = this.db.data.projectStatusReports.find((r) => r.id === id);
    return report || null;
  }

  /**
   * Create a new project status report
   * @param reportData - Status report creation data
   * @returns Promise resolving to the created status report object
   * @throws Error if validation fails
   */
  public async createProjectStatusReport(
    reportData: CreateProjectStatusReportInput,
  ): Promise<ProjectStatusReport> {
    // Validate project exists
    const project = this.db.data.projects.find(
      (p) => p.id === reportData.projectId,
    );
    if (!project) {
      throw new Error('Project not found');
    }

    // Create new status report object
    const newReport: ProjectStatusReport = {
      id: uuidv4(),
      projectId: reportData.projectId,
      reportDate: reportData.reportDate,
      statusSummary: reportData.statusSummary,
    };

    // Add to database
    this.db.data.projectStatusReports.push(newReport);
    await this.db.write();

    return newReport;
  }

  /**
   * Update an existing project status report
   * @param updateData - Status report update data
   * @returns Promise resolving to the updated status report object
   * @throws Error if status report not found
   */
  public async updateProjectStatusReport(
    updateData: UpdateProjectStatusReportInput,
  ): Promise<ProjectStatusReport> {
    // Find existing status report
    const existingReport = this.db.data.projectStatusReports.find(
      (report) => report.id === updateData.id,
    );
    if (!existingReport) {
      throw new Error('Project status report not found');
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
   * Delete a project status report by ID
   * @param id - Status report ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if status report not found
   */
  public async deleteProjectStatusReport(id: string): Promise<boolean> {
    // Check if status report exists
    const reportIndex = this.db.data.projectStatusReports.findIndex(
      (report) => report.id === id,
    );
    if (reportIndex === -1) {
      throw new Error('Project status report not found');
    }

    // Remove status report
    this.db.data.projectStatusReports.splice(reportIndex, 1);
    await this.db.write();

    return true;
  }
}
