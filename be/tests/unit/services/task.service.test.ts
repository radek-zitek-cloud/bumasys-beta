/**
 * @fileoverview Unit tests for task service
 */

import { TaskService } from '../../../src/services/task.service';
import type {
  Database,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Project,
  Staff,
  Status,
  Priority,
  Complexity,
  TaskAssignee,
  TaskPredecessor,
  TaskEvaluation,
  TaskProgress,
  TaskStatusReport,
} from '../../../src/types';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockDb: Database;

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project',
    leadStaffId: 'staff-1',
    plannedStartDate: '2024-01-01',
    plannedEndDate: '2024-12-31',
    actualStartDate: undefined,
    actualEndDate: undefined,
  };

  const mockStaff: Staff = {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    role: 'Developer',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    supervisorId: undefined,
  };

  const mockStatus: Status = {
    id: 'status-1',
    name: 'In Progress',
  };

  const mockPriority: Priority = {
    id: 'priority-1',
    name: 'High',
  };

  const mockComplexity: Complexity = {
    id: 'complexity-1',
    name: 'Medium',
  };

  const mockTask: Task = {
    id: 'task-1',
    name: 'Test Task',
    description: 'A test task',
    projectId: 'project-1',
    parentTaskId: undefined,
    evaluatorId: 'staff-1',
    statusId: 'status-1',
    priorityId: 'priority-1',
    complexityId: 'complexity-1',
    plannedStartDate: '2024-01-01',
    plannedEndDate: '2024-01-31',
    actualStartDate: undefined,
    actualEndDate: undefined,
  };

  const mockParentTask: Task = {
    id: 'task-parent',
    name: 'Parent Task',
    description: 'A parent task',
    projectId: 'project-1',
    parentTaskId: undefined,
    evaluatorId: 'staff-1',
    statusId: 'status-1',
    priorityId: 'priority-1',
    complexityId: 'complexity-1',
    plannedStartDate: '2024-01-01',
    plannedEndDate: '2024-02-28',
    actualStartDate: undefined,
    actualEndDate: undefined,
  };

  beforeEach(() => {
    mockDb = {
      data: {
        users: [],
        sessions: [],
        organizations: [],
        departments: [],
        staff: [mockStaff],
        projects: [mockProject],
        tasks: [mockTask, mockParentTask],
        taskAssignees: [],
        taskPredecessors: [],
        priorities: [mockPriority],
        statuses: [mockStatus],
        complexities: [mockComplexity],
        taskEvaluations: [],
        taskProgress: [],
        taskStatusReports: [],
        projectStatusReports: [],
        teams: [],
        teamMembers: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    taskService = new TaskService(mockDb);
  });

  describe('getAllTasks', () => {
    it('should return all tasks when no filter is provided', async () => {
      const result = await taskService.getAllTasks();

      expect(result).toHaveLength(2);
      expect(result).toContain(mockTask);
      expect(result).toContain(mockParentTask);
    });

    it('should filter tasks by project ID', async () => {
      // Add task from different project
      const otherProjectTask: Task = {
        ...mockTask,
        id: 'task-2',
        projectId: 'project-2',
      };
      mockDb.data.tasks.push(otherProjectTask);

      const result = await taskService.getAllTasks('project-1');

      expect(result).toHaveLength(2);
      expect(result.every((task) => task.projectId === 'project-1')).toBe(true);
    });

    it('should return empty array when no tasks match project filter', async () => {
      const result = await taskService.getAllTasks('project-nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return task when found by ID', async () => {
      const result = await taskService.findById('task-1');

      expect(result).toEqual(mockTask);
    });

    it('should return null when task not found by ID', async () => {
      const result = await taskService.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createTask', () => {
    const createTaskInput: CreateTaskInput = {
      name: 'New Task',
      description: 'A new task',
      projectId: 'project-1',
      parentTaskId: 'task-parent',
      evaluatorId: 'staff-1',
      statusId: 'status-1',
      priorityId: 'priority-1',
      complexityId: 'complexity-1',
      plannedStartDate: '2024-02-01',
      plannedEndDate: '2024-02-15',
      actualStartDate: undefined,
      actualEndDate: undefined,
    };

    it('should create new task successfully', async () => {
      const result = await taskService.createTask(createTaskInput);

      expect(result).toMatchObject({
        name: 'New Task',
        description: 'A new task',
        projectId: 'project-1',
        parentTaskId: 'task-parent',
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-02-15',
        actualStartDate: undefined,
        actualEndDate: undefined,
      });
      expect(result.id).toBeDefined();
      expect(mockDb.data.tasks).toHaveLength(3);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when project not found', async () => {
      const invalidInput = { ...createTaskInput, projectId: 'project-invalid' };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Project not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent task not found', async () => {
      const invalidInput = { ...createTaskInput, parentTaskId: 'task-invalid' };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Parent task not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent task belongs to different project', async () => {
      // Add parent task from different project
      const otherProjectParent: Task = {
        ...mockParentTask,
        id: 'task-other-parent',
        projectId: 'project-2',
      };
      mockDb.data.tasks.push(otherProjectParent);

      const invalidInput = {
        ...createTaskInput,
        parentTaskId: 'task-other-parent',
      };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Parent task must belong to the same project',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when evaluator not found', async () => {
      const invalidInput = { ...createTaskInput, evaluatorId: 'staff-invalid' };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Evaluator not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when status not found', async () => {
      const invalidInput = { ...createTaskInput, statusId: 'status-invalid' };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Status not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when priority not found', async () => {
      const invalidInput = {
        ...createTaskInput,
        priorityId: 'priority-invalid',
      };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Priority not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when complexity not found', async () => {
      const invalidInput = {
        ...createTaskInput,
        complexityId: 'complexity-invalid',
      };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Complexity not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when planned start date is after planned end date', async () => {
      const invalidInput = {
        ...createTaskInput,
        plannedStartDate: '2024-02-15',
        plannedEndDate: '2024-02-01',
      };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Planned start date must be before planned end date',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when actual start date is after actual end date', async () => {
      const invalidInput = {
        ...createTaskInput,
        actualStartDate: '2024-02-15',
        actualEndDate: '2024-02-01',
      };

      await expect(taskService.createTask(invalidInput)).rejects.toThrow(
        'Actual start date must be before actual end date',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should create task with minimal required fields', async () => {
      const minimalInput: CreateTaskInput = {
        name: 'Minimal Task',
        description: 'A minimal task',
        projectId: 'project-1',
        parentTaskId: undefined,
        evaluatorId: undefined,
        statusId: undefined,
        priorityId: undefined,
        complexityId: undefined,
        plannedStartDate: undefined,
        plannedEndDate: undefined,
        actualStartDate: undefined,
        actualEndDate: undefined,
      };

      const result = await taskService.createTask(minimalInput);

      expect(result.name).toBe('Minimal Task');
      expect(result.projectId).toBe('project-1');
      expect(result.parentTaskId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    const updateTaskInput: UpdateTaskInput = {
      id: 'task-1',
      name: 'Updated Task',
      description: 'An updated task',
    };

    it('should update task successfully', async () => {
      const result = await taskService.updateTask(updateTaskInput);

      expect(result.name).toBe('Updated Task');
      expect(result.description).toBe('An updated task');
      expect(result.projectId).toBe('project-1'); // Unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when task not found', async () => {
      const invalidUpdate = { ...updateTaskInput, id: 'task-invalid' };

      await expect(taskService.updateTask(invalidUpdate)).rejects.toThrow(
        'Task not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent task not found', async () => {
      const invalidUpdate = {
        ...updateTaskInput,
        parentTaskId: 'task-invalid',
      };

      await expect(taskService.updateTask(invalidUpdate)).rejects.toThrow(
        'Parent task not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent task belongs to different project', async () => {
      // Add task from different project
      const otherProjectTask: Task = {
        ...mockTask,
        id: 'task-other',
        projectId: 'project-2',
      };
      mockDb.data.tasks.push(otherProjectTask);

      const invalidUpdate = { ...updateTaskInput, parentTaskId: 'task-other' };

      await expect(taskService.updateTask(invalidUpdate)).rejects.toThrow(
        'Parent task must belong to the same project',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when task tries to be its own parent', async () => {
      const invalidUpdate = { ...updateTaskInput, parentTaskId: 'task-1' };

      await expect(taskService.updateTask(invalidUpdate)).rejects.toThrow(
        'Task cannot be its own parent',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when evaluator not found', async () => {
      const invalidUpdate = {
        ...updateTaskInput,
        evaluatorId: 'staff-invalid',
      };

      await expect(taskService.updateTask(invalidUpdate)).rejects.toThrow(
        'Evaluator not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should validate dates using existing values when only one date is updated', async () => {
      // Update only planned end date to be before existing start date
      const invalidDateUpdate = {
        ...updateTaskInput,
        plannedEndDate: '2023-12-31', // Before existing start date of 2024-01-01
      };

      await expect(taskService.updateTask(invalidDateUpdate)).rejects.toThrow(
        'Planned start date must be before planned end date',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should update all task fields correctly', async () => {
      const fullUpdate: UpdateTaskInput = {
        id: 'task-1',
        name: 'Fully Updated Task',
        description: 'Fully updated description',
        parentTaskId: 'task-parent',
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-02-15',
        actualStartDate: '2024-02-01',
        actualEndDate: '2024-02-10',
      };

      const result = await taskService.updateTask(fullUpdate);

      expect(result).toMatchObject(fullUpdate);
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      // Add some related data to test cleanup
      const taskAssignee: TaskAssignee = {
        taskId: 'task-1',
        staffId: 'staff-1',
      };
      const taskPredecessor: TaskPredecessor = {
        taskId: 'task-1',
        predecessorTaskId: 'task-parent',
      };
      const taskEvaluation: TaskEvaluation = {
        id: 'eval-1',
        taskId: 'task-1',
        evaluatorId: 'staff-1',
        evaluationDate: '2024-01-15',
        evaluationNotes: 'Good work',
        result: 'Passed',
      };
      const taskProgress: TaskProgress = {
        id: 'progress-1',
        taskId: 'task-1',
        reportDate: '2024-01-10',
        progressPercent: 50,
        notes: 'Progress update',
      };
      const taskStatusReport: TaskStatusReport = {
        id: 'status-report-1',
        taskId: 'task-1',
        reportDate: '2024-01-10',
        statusSummary: 'Task is progressing well',
      };

      mockDb.data.taskAssignees.push(taskAssignee);
      mockDb.data.taskPredecessors.push(taskPredecessor);
      mockDb.data.taskEvaluations.push(taskEvaluation);
      mockDb.data.taskProgress.push(taskProgress);
      mockDb.data.taskStatusReports.push(taskStatusReport);
    });

    it('should delete task and all related data successfully', async () => {
      const result = await taskService.deleteTask('task-1');

      expect(result).toBe(true);
      expect(mockDb.data.tasks).toHaveLength(1);
      expect(mockDb.data.tasks[0]).toEqual(mockParentTask);

      // Check that related data was cleaned up
      expect(mockDb.data.taskAssignees).toHaveLength(0);
      expect(mockDb.data.taskPredecessors).toHaveLength(0);
      expect(mockDb.data.taskEvaluations).toHaveLength(0);
      expect(mockDb.data.taskProgress).toHaveLength(0);
      expect(mockDb.data.taskStatusReports).toHaveLength(0);

      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when task not found', async () => {
      await expect(taskService.deleteTask('task-invalid')).rejects.toThrow(
        'Task not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when task has child tasks', async () => {
      // Make task-1 a parent of task-parent
      mockDb.data.tasks[1].parentTaskId = 'task-1';

      await expect(taskService.deleteTask('task-1')).rejects.toThrow(
        'Cannot delete task: it has child tasks',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('assignStaffToTask', () => {
    it('should assign staff to task successfully', async () => {
      const result = await taskService.assignStaffToTask('task-1', 'staff-1');

      expect(result).toBe(true);
      expect(mockDb.data.taskAssignees).toHaveLength(1);
      expect(mockDb.data.taskAssignees[0]).toEqual({
        taskId: 'task-1',
        staffId: 'staff-1',
      });
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when task not found', async () => {
      await expect(
        taskService.assignStaffToTask('task-invalid', 'staff-1'),
      ).rejects.toThrow('Task not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when staff not found', async () => {
      await expect(
        taskService.assignStaffToTask('task-1', 'staff-invalid'),
      ).rejects.toThrow('Staff member not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when staff already assigned', async () => {
      // First assignment
      await taskService.assignStaffToTask('task-1', 'staff-1');

      // Try to assign again
      await expect(
        taskService.assignStaffToTask('task-1', 'staff-1'),
      ).rejects.toThrow('Staff member already assigned to this task');
    });
  });

  describe('removeStaffFromTask', () => {
    beforeEach(async () => {
      // Assign staff to task first
      await taskService.assignStaffToTask('task-1', 'staff-1');
    });

    it('should remove staff from task successfully', async () => {
      const result = await taskService.removeStaffFromTask('task-1', 'staff-1');

      expect(result).toBe(true);
      expect(mockDb.data.taskAssignees).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when assignment not found', async () => {
      await expect(
        taskService.removeStaffFromTask('task-1', 'staff-invalid'),
      ).rejects.toThrow('Assignment not found');
    });
  });

  describe('addTaskPredecessor', () => {
    it('should add task predecessor successfully', async () => {
      const result = await taskService.addTaskPredecessor(
        'task-1',
        'task-parent',
      );

      expect(result).toBe(true);
      expect(mockDb.data.taskPredecessors).toHaveLength(1);
      expect(mockDb.data.taskPredecessors[0]).toEqual({
        taskId: 'task-1',
        predecessorTaskId: 'task-parent',
      });
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when task not found', async () => {
      await expect(
        taskService.addTaskPredecessor('task-invalid', 'task-parent'),
      ).rejects.toThrow('Task not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when predecessor task not found', async () => {
      await expect(
        taskService.addTaskPredecessor('task-1', 'task-invalid'),
      ).rejects.toThrow('Predecessor task not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when task tries to be its own predecessor', async () => {
      await expect(
        taskService.addTaskPredecessor('task-1', 'task-1'),
      ).rejects.toThrow('Task cannot be its own predecessor');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when predecessor relationship already exists', async () => {
      // First addition
      await taskService.addTaskPredecessor('task-1', 'task-parent');

      // Try to add again
      await expect(
        taskService.addTaskPredecessor('task-1', 'task-parent'),
      ).rejects.toThrow('Predecessor relationship already exists');
    });
  });

  describe('removeTaskPredecessor', () => {
    beforeEach(async () => {
      // Add predecessor first
      await taskService.addTaskPredecessor('task-1', 'task-parent');
    });

    it('should remove task predecessor successfully', async () => {
      const result = await taskService.removeTaskPredecessor(
        'task-1',
        'task-parent',
      );

      expect(result).toBe(true);
      expect(mockDb.data.taskPredecessors).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when predecessor relationship not found', async () => {
      await expect(
        taskService.removeTaskPredecessor('task-1', 'task-invalid'),
      ).rejects.toThrow('Predecessor relationship not found');
    });
  });

  describe('getTaskAssignees', () => {
    beforeEach(async () => {
      // Add multiple staff and assignments
      const staff2: Staff = {
        ...mockStaff,
        id: 'staff-2',
        email: 'jane@test.com',
      };
      mockDb.data.staff.push(staff2);

      await taskService.assignStaffToTask('task-1', 'staff-1');
      await taskService.assignStaffToTask('task-1', 'staff-2');
    });

    it('should return all assignees for a task', async () => {
      const result = await taskService.getTaskAssignees('task-1');

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toContain('staff-1');
      expect(result.map((s) => s.id)).toContain('staff-2');
    });

    it('should return empty array for task with no assignees', async () => {
      const result = await taskService.getTaskAssignees('task-parent');

      expect(result).toHaveLength(0);
    });
  });

  describe('getTaskPredecessors', () => {
    beforeEach(async () => {
      // Add multiple predecessors
      await taskService.addTaskPredecessor('task-1', 'task-parent');
    });

    it('should return all predecessor tasks', async () => {
      const result = await taskService.getTaskPredecessors('task-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockParentTask);
    });

    it('should return empty array for task with no predecessors', async () => {
      const result = await taskService.getTaskPredecessors('task-parent');

      expect(result).toHaveLength(0);
    });
  });

  describe('getChildTasks', () => {
    beforeEach(() => {
      // Reset tasks to ensure clean state with fresh objects
      mockDb.data.tasks = [
        {
          id: 'task-1',
          name: 'Test Task',
          description: 'A test task',
          projectId: 'project-1',
          parentTaskId: undefined,
          evaluatorId: 'staff-1',
          statusId: 'status-1',
          priorityId: 'priority-1',
          complexityId: 'complexity-1',
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-01-31',
          actualStartDate: undefined,
          actualEndDate: undefined,
        },
        {
          id: 'task-parent',
          name: 'Parent Task',
          description: 'A parent task',
          projectId: 'project-1',
          parentTaskId: undefined,
          evaluatorId: 'staff-1',
          statusId: 'status-1',
          priorityId: 'priority-1',
          complexityId: 'complexity-1',
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-02-28',
          actualStartDate: undefined,
          actualEndDate: undefined,
        },
      ];

      // Make task-1 a child of task-parent
      mockDb.data.tasks[0].parentTaskId = 'task-parent';
    });

    it('should return all child tasks', async () => {
      const result = await taskService.getChildTasks('task-parent');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'task-1',
        name: 'Test Task',
        description: 'A test task',
        projectId: 'project-1',
        parentTaskId: 'task-parent',
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
        actualStartDate: undefined,
        actualEndDate: undefined,
      });
    });

    it('should return empty array for task with no children', async () => {
      const result = await taskService.getChildTasks('task-1');

      expect(result).toHaveLength(0);
    });
  });
});
