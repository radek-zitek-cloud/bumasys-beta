/**
 * @fileoverview Project service module
 *
 * This module contains all business logic related to project management,
 * including project creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import type {
  Database,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

/**
 * Service class for project management operations
 */
export class ProjectService {
  constructor(private readonly db: Database) {}

  /**
   * Get all projects
   * @returns Promise resolving to array of all projects
   */
  public async getAllProjects(): Promise<Project[]> {
    logger.debug({ operation: 'getAllProjects' }, 'Retrieving all projects');
    const projects = this.db.data.projects;
    logger.info({ operation: 'getAllProjects', projectCount: projects.length }, 'All projects retrieved successfully');
    return projects;
  }

  /**
   * Find a project by ID
   * @param id - Project ID to find
   * @returns Promise resolving to the project object or null if not found
   */
  public async findById(id: string): Promise<Project | null> {
    logger.debug({ operation: 'findById', projectId: id }, 'Searching for project by ID');
    const project = this.db.data.projects.find((p) => p.id === id);
    logger.debug({ operation: 'findById', projectId: id, found: !!project }, 'Project search by ID completed');
    return project || null;
  }

  /**
   * Create a new project
   * @param projectData - Project creation data
   * @returns Promise resolving to the created project object
   * @throws Error if validation fails
   */
  public async createProject(
    projectData: CreateProjectInput,
  ): Promise<Project> {
    // Validate lead staff if provided
    if (projectData.leadStaffId) {
      const leadStaff = this.db.data.staff.find(
        (staff) => staff.id === projectData.leadStaffId,
      );
      if (!leadStaff) {
        throw new Error('Lead staff member not found');
      }
    }

    // Validate date logic if provided
    if (projectData.plannedStartDate && projectData.plannedEndDate) {
      const startDate = new Date(projectData.plannedStartDate);
      const endDate = new Date(projectData.plannedEndDate);
      if (startDate >= endDate) {
        throw new Error('Planned start date must be before planned end date');
      }
    }

    if (projectData.actualStartDate && projectData.actualEndDate) {
      const startDate = new Date(projectData.actualStartDate);
      const endDate = new Date(projectData.actualEndDate);
      if (startDate >= endDate) {
        throw new Error('Actual start date must be before actual end date');
      }
    }

    // Create new project object
    const newProject: Project = {
      id: uuidv4(),
      name: projectData.name,
      description: projectData.description,
      leadStaffId: projectData.leadStaffId,
      plannedStartDate: projectData.plannedStartDate,
      plannedEndDate: projectData.plannedEndDate,
      actualStartDate: projectData.actualStartDate,
      actualEndDate: projectData.actualEndDate,
    };

    // Add to database
    this.db.data.projects.push(newProject);
    await this.db.write();

    return newProject;
  }

  /**
   * Update an existing project
   * @param updateData - Project update data
   * @returns Promise resolving to the updated project object
   * @throws Error if project not found or validation fails
   */
  public async updateProject(updateData: UpdateProjectInput): Promise<Project> {
    // Find existing project
    const existingProject = this.db.data.projects.find(
      (project) => project.id === updateData.id,
    );
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Validate lead staff if provided
    if (updateData.leadStaffId) {
      const leadStaff = this.db.data.staff.find(
        (staff) => staff.id === updateData.leadStaffId,
      );
      if (!leadStaff) {
        throw new Error('Lead staff member not found');
      }
    }

    // Get final dates for validation
    const plannedStartDate =
      updateData.plannedStartDate ?? existingProject.plannedStartDate;
    const plannedEndDate =
      updateData.plannedEndDate ?? existingProject.plannedEndDate;
    const actualStartDate =
      updateData.actualStartDate ?? existingProject.actualStartDate;
    const actualEndDate =
      updateData.actualEndDate ?? existingProject.actualEndDate;

    // Validate date logic if both dates are provided
    if (plannedStartDate && plannedEndDate) {
      const startDate = new Date(plannedStartDate);
      const endDate = new Date(plannedEndDate);
      if (startDate >= endDate) {
        throw new Error('Planned start date must be before planned end date');
      }
    }

    if (actualStartDate && actualEndDate) {
      const startDate = new Date(actualStartDate);
      const endDate = new Date(actualEndDate);
      if (startDate >= endDate) {
        throw new Error('Actual start date must be before actual end date');
      }
    }

    // Update project properties
    if (updateData.name !== undefined) {
      existingProject.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      existingProject.description = updateData.description;
    }
    if (updateData.leadStaffId !== undefined) {
      existingProject.leadStaffId = updateData.leadStaffId;
    }
    if (updateData.plannedStartDate !== undefined) {
      existingProject.plannedStartDate = updateData.plannedStartDate;
    }
    if (updateData.plannedEndDate !== undefined) {
      existingProject.plannedEndDate = updateData.plannedEndDate;
    }
    if (updateData.actualStartDate !== undefined) {
      existingProject.actualStartDate = updateData.actualStartDate;
    }
    if (updateData.actualEndDate !== undefined) {
      existingProject.actualEndDate = updateData.actualEndDate;
    }

    await this.db.write();
    return existingProject;
  }

  /**
   * Delete a project by ID
   * @param id - Project ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if project not found or has dependencies
   */
  public async deleteProject(id: string): Promise<boolean> {
    // Check if project exists
    const projectIndex = this.db.data.projects.findIndex(
      (project) => project.id === id,
    );
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    // Check for dependencies
    const tasksUsingProject = this.db.data.tasks.filter(
      (task) => task.projectId === id,
    );
    if (tasksUsingProject.length > 0) {
      throw new Error('Cannot delete project: it has associated tasks');
    }

    const projectStatusReports = this.db.data.projectStatusReports.filter(
      (report) => report.projectId === id,
    );
    if (projectStatusReports.length > 0) {
      throw new Error('Cannot delete project: it has status reports');
    }

    // Remove project
    this.db.data.projects.splice(projectIndex, 1);
    await this.db.write();

    return true;
  }

  /**
   * Get all tasks for a project
   * @param projectId - Project ID
   * @returns Promise resolving to array of tasks
   */
  public async getProjectTasks(projectId: string): Promise<any[]> {
    return this.db.data.tasks.filter((task) => task.projectId === projectId);
  }

  /**
   * Get all status reports for a project
   * @param projectId - Project ID
   * @returns Promise resolving to array of status reports
   */
  public async getProjectStatusReports(projectId: string): Promise<any[]> {
    return this.db.data.projectStatusReports.filter(
      (report) => report.projectId === projectId,
    );
  }
}
