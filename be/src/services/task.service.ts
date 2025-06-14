/**
 * @fileoverview Task service module
 *
 * This module contains all business logic related to task management,
 * including task creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskAssignee,
  TaskPredecessor,
} from '../types';

/**
 * Service class for task management operations
 */
export class TaskService {
  constructor(private readonly db: Database) {}

  /**
   * Get all tasks
   * @param projectId - Optional filter by project ID
   * @returns Promise resolving to array of tasks
   */
  public async getAllTasks(projectId?: string): Promise<Task[]> {
    let tasks = this.db.data.tasks;
    if (projectId) {
      tasks = tasks.filter((task) => task.projectId === projectId);
    }
    return tasks;
  }

  /**
   * Find a task by ID
   * @param id - Task ID to find
   * @returns Promise resolving to the task object or null if not found
   */
  public async findById(id: string): Promise<Task | null> {
    const task = this.db.data.tasks.find((t) => t.id === id);
    return task || null;
  }

  /**
   * Create a new task
   * @param taskData - Task creation data
   * @returns Promise resolving to the created task object
   * @throws Error if validation fails
   */
  public async createTask(taskData: CreateTaskInput): Promise<Task> {
    // Validate project exists
    const project = this.db.data.projects.find(
      (p) => p.id === taskData.projectId,
    );
    if (!project) {
      throw new Error('Project not found');
    }

    // Validate parent task if provided
    if (taskData.parentTaskId) {
      const parentTask = this.db.data.tasks.find(
        (task) => task.id === taskData.parentTaskId,
      );
      if (!parentTask) {
        throw new Error('Parent task not found');
      }
      if (parentTask.projectId !== taskData.projectId) {
        throw new Error('Parent task must belong to the same project');
      }
    }

    // Validate evaluator if provided
    if (taskData.evaluatorId) {
      const evaluator = this.db.data.staff.find(
        (staff) => staff.id === taskData.evaluatorId,
      );
      if (!evaluator) {
        throw new Error('Evaluator not found');
      }
    }

    // Validate reference data if provided
    if (taskData.statusId) {
      const status = this.db.data.statuses.find(
        (s) => s.id === taskData.statusId,
      );
      if (!status) {
        throw new Error('Status not found');
      }
    }

    if (taskData.priorityId) {
      const priority = this.db.data.priorities.find(
        (p) => p.id === taskData.priorityId,
      );
      if (!priority) {
        throw new Error('Priority not found');
      }
    }

    if (taskData.complexityId) {
      const complexity = this.db.data.complexities.find(
        (c) => c.id === taskData.complexityId,
      );
      if (!complexity) {
        throw new Error('Complexity not found');
      }
    }

    // Validate date logic if provided
    if (taskData.plannedStartDate && taskData.plannedEndDate) {
      const startDate = new Date(taskData.plannedStartDate);
      const endDate = new Date(taskData.plannedEndDate);
      if (startDate >= endDate) {
        throw new Error('Planned start date must be before planned end date');
      }
    }

    if (taskData.actualStartDate && taskData.actualEndDate) {
      const startDate = new Date(taskData.actualStartDate);
      const endDate = new Date(taskData.actualEndDate);
      if (startDate >= endDate) {
        throw new Error('Actual start date must be before actual end date');
      }
    }

    // Create new task object
    const newTask: Task = {
      id: uuidv4(),
      name: taskData.name,
      description: taskData.description,
      projectId: taskData.projectId,
      parentTaskId: taskData.parentTaskId,
      evaluatorId: taskData.evaluatorId,
      statusId: taskData.statusId,
      priorityId: taskData.priorityId,
      complexityId: taskData.complexityId,
      plannedStartDate: taskData.plannedStartDate,
      plannedEndDate: taskData.plannedEndDate,
      actualStartDate: taskData.actualStartDate,
      actualEndDate: taskData.actualEndDate,
    };

    // Add to database
    this.db.data.tasks.push(newTask);
    await this.db.write();

    return newTask;
  }

  /**
   * Update an existing task
   * @param updateData - Task update data
   * @returns Promise resolving to the updated task object
   * @throws Error if task not found or validation fails
   */
  public async updateTask(updateData: UpdateTaskInput): Promise<Task> {
    // Find existing task
    const existingTask = this.db.data.tasks.find(
      (task) => task.id === updateData.id,
    );
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Validate parent task if provided
    if (updateData.parentTaskId) {
      const parentTask = this.db.data.tasks.find(
        (task) => task.id === updateData.parentTaskId,
      );
      if (!parentTask) {
        throw new Error('Parent task not found');
      }
      if (parentTask.projectId !== existingTask.projectId) {
        throw new Error('Parent task must belong to the same project');
      }
      // Prevent circular dependencies
      if (updateData.parentTaskId === updateData.id) {
        throw new Error('Task cannot be its own parent');
      }
    }

    // Validate evaluator if provided
    if (updateData.evaluatorId) {
      const evaluator = this.db.data.staff.find(
        (staff) => staff.id === updateData.evaluatorId,
      );
      if (!evaluator) {
        throw new Error('Evaluator not found');
      }
    }

    // Validate reference data if provided
    if (updateData.statusId) {
      const status = this.db.data.statuses.find(
        (s) => s.id === updateData.statusId,
      );
      if (!status) {
        throw new Error('Status not found');
      }
    }

    if (updateData.priorityId) {
      const priority = this.db.data.priorities.find(
        (p) => p.id === updateData.priorityId,
      );
      if (!priority) {
        throw new Error('Priority not found');
      }
    }

    if (updateData.complexityId) {
      const complexity = this.db.data.complexities.find(
        (c) => c.id === updateData.complexityId,
      );
      if (!complexity) {
        throw new Error('Complexity not found');
      }
    }

    // Get final dates for validation
    const plannedStartDate = updateData.plannedStartDate ?? existingTask.plannedStartDate;
    const plannedEndDate = updateData.plannedEndDate ?? existingTask.plannedEndDate;
    const actualStartDate = updateData.actualStartDate ?? existingTask.actualStartDate;
    const actualEndDate = updateData.actualEndDate ?? existingTask.actualEndDate;

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

    // Update task properties
    if (updateData.name !== undefined) {
      existingTask.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      existingTask.description = updateData.description;
    }
    if (updateData.parentTaskId !== undefined) {
      existingTask.parentTaskId = updateData.parentTaskId;
    }
    if (updateData.evaluatorId !== undefined) {
      existingTask.evaluatorId = updateData.evaluatorId;
    }
    if (updateData.statusId !== undefined) {
      existingTask.statusId = updateData.statusId;
    }
    if (updateData.priorityId !== undefined) {
      existingTask.priorityId = updateData.priorityId;
    }
    if (updateData.complexityId !== undefined) {
      existingTask.complexityId = updateData.complexityId;
    }
    if (updateData.plannedStartDate !== undefined) {
      existingTask.plannedStartDate = updateData.plannedStartDate;
    }
    if (updateData.plannedEndDate !== undefined) {
      existingTask.plannedEndDate = updateData.plannedEndDate;
    }
    if (updateData.actualStartDate !== undefined) {
      existingTask.actualStartDate = updateData.actualStartDate;
    }
    if (updateData.actualEndDate !== undefined) {
      existingTask.actualEndDate = updateData.actualEndDate;
    }

    await this.db.write();
    return existingTask;
  }

  /**
   * Delete a task by ID
   * @param id - Task ID to delete
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if task not found or has dependencies
   */
  public async deleteTask(id: string): Promise<boolean> {
    // Check if task exists
    const taskIndex = this.db.data.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    // Check for child tasks
    const childTasks = this.db.data.tasks.filter(
      (task) => task.parentTaskId === id,
    );
    if (childTasks.length > 0) {
      throw new Error('Cannot delete task: it has child tasks');
    }

    // Remove related data
    // Remove task assignees
    this.db.data.taskAssignees = this.db.data.taskAssignees.filter(
      (assignee) => assignee.taskId !== id,
    );

    // Remove task predecessors (both directions)
    this.db.data.taskPredecessors = this.db.data.taskPredecessors.filter(
      (predecessor) => predecessor.taskId !== id && predecessor.predecessorTaskId !== id,
    );

    // Remove task progress reports
    this.db.data.taskProgress = this.db.data.taskProgress.filter(
      (progress) => progress.taskId !== id,
    );

    // Remove task evaluations
    this.db.data.taskEvaluations = this.db.data.taskEvaluations.filter(
      (evaluation) => evaluation.taskId !== id,
    );

    // Remove task status reports
    this.db.data.taskStatusReports = this.db.data.taskStatusReports.filter(
      (report) => report.taskId !== id,
    );

    // Remove task
    this.db.data.tasks.splice(taskIndex, 1);
    await this.db.write();

    return true;
  }

  /**
   * Assign a staff member to a task
   * @param taskId - Task ID
   * @param staffId - Staff ID
   * @returns Promise resolving to true if assigned successfully
   * @throws Error if task or staff not found, or already assigned
   */
  public async assignStaffToTask(taskId: string, staffId: string): Promise<boolean> {
    // Validate task exists
    const task = this.db.data.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Validate staff exists
    const staff = this.db.data.staff.find((s) => s.id === staffId);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Check if already assigned
    const existingAssignment = this.db.data.taskAssignees.find(
      (assignee) => assignee.taskId === taskId && assignee.staffId === staffId,
    );
    if (existingAssignment) {
      throw new Error('Staff member already assigned to this task');
    }

    // Create assignment
    const assignment: TaskAssignee = {
      taskId,
      staffId,
    };

    this.db.data.taskAssignees.push(assignment);
    await this.db.write();

    return true;
  }

  /**
   * Remove a staff member from a task
   * @param taskId - Task ID
   * @param staffId - Staff ID
   * @returns Promise resolving to true if removed successfully
   * @throws Error if assignment not found
   */
  public async removeStaffFromTask(taskId: string, staffId: string): Promise<boolean> {
    const assignmentIndex = this.db.data.taskAssignees.findIndex(
      (assignee) => assignee.taskId === taskId && assignee.staffId === staffId,
    );

    if (assignmentIndex === -1) {
      throw new Error('Assignment not found');
    }

    this.db.data.taskAssignees.splice(assignmentIndex, 1);
    await this.db.write();

    return true;
  }

  /**
   * Add a predecessor relationship to a task
   * @param taskId - Task ID
   * @param predecessorTaskId - Predecessor task ID
   * @returns Promise resolving to true if added successfully
   * @throws Error if tasks not found, same task, or circular dependency
   */
  public async addTaskPredecessor(taskId: string, predecessorTaskId: string): Promise<boolean> {
    // Validate tasks exist
    const task = this.db.data.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const predecessorTask = this.db.data.tasks.find((t) => t.id === predecessorTaskId);
    if (!predecessorTask) {
      throw new Error('Predecessor task not found');
    }

    // Prevent self-reference
    if (taskId === predecessorTaskId) {
      throw new Error('Task cannot be its own predecessor');
    }

    // Check if already exists
    const existingPredecessor = this.db.data.taskPredecessors.find(
      (pred) => pred.taskId === taskId && pred.predecessorTaskId === predecessorTaskId,
    );
    if (existingPredecessor) {
      throw new Error('Predecessor relationship already exists');
    }

    // Create predecessor relationship
    const predecessor: TaskPredecessor = {
      taskId,
      predecessorTaskId,
    };

    this.db.data.taskPredecessors.push(predecessor);
    await this.db.write();

    return true;
  }

  /**
   * Remove a predecessor relationship from a task
   * @param taskId - Task ID
   * @param predecessorTaskId - Predecessor task ID
   * @returns Promise resolving to true if removed successfully
   * @throws Error if relationship not found
   */
  public async removeTaskPredecessor(taskId: string, predecessorTaskId: string): Promise<boolean> {
    const predecessorIndex = this.db.data.taskPredecessors.findIndex(
      (pred) => pred.taskId === taskId && pred.predecessorTaskId === predecessorTaskId,
    );

    if (predecessorIndex === -1) {
      throw new Error('Predecessor relationship not found');
    }

    this.db.data.taskPredecessors.splice(predecessorIndex, 1);
    await this.db.write();

    return true;
  }

  /**
   * Get all assignees for a task
   * @param taskId - Task ID
   * @returns Promise resolving to array of staff members
   */
  public async getTaskAssignees(taskId: string): Promise<any[]> {
    const assigneeIds = this.db.data.taskAssignees
      .filter((assignee) => assignee.taskId === taskId)
      .map((assignee) => assignee.staffId);

    return this.db.data.staff.filter((staff) => assigneeIds.includes(staff.id));
  }

  /**
   * Get all predecessors for a task
   * @param taskId - Task ID
   * @returns Promise resolving to array of tasks
   */
  public async getTaskPredecessors(taskId: string): Promise<Task[]> {
    const predecessorIds = this.db.data.taskPredecessors
      .filter((pred) => pred.taskId === taskId)
      .map((pred) => pred.predecessorTaskId);

    return this.db.data.tasks.filter((task) => predecessorIds.includes(task.id));
  }

  /**
   * Get all child tasks for a task
   * @param taskId - Task ID
   * @returns Promise resolving to array of tasks
   */
  public async getChildTasks(taskId: string): Promise<Task[]> {
    return this.db.data.tasks.filter((task) => task.parentTaskId === taskId);
  }
}