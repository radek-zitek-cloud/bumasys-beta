/**
 * @fileoverview Unit tests for TaskProgressService
 */

import { TaskProgressService } from '../../../src/services/task-progress.service';
import type {
  Database,
  TaskProgress,
  Task,
  CreateTaskProgressInput,
  UpdateTaskProgressInput,
} from '../../../src/types';

// Mock database
const createMockDatabase = (): Database => ({
  data: {
    users: [],
    sessions: [],
    organizations: [],
    departments: [],
    staff: [
      {
        id: 'staff-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
      },
      {
        id: 'staff-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'Evaluator',
        organizationId: 'org-1',
        departmentId: 'dept-1',
      },
      {
        id: 'staff-3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
      },
    ],
    projects: [],
    tasks: [
      {
        id: 'task-1',
        name: 'Test Task 1',
        projectId: 'project-1',
        evaluatorId: 'staff-2',
      },
      {
        id: 'task-2',
        name: 'Test Task 2',
        projectId: 'project-2',
      },
    ] as Task[],
    taskAssignees: [
      { taskId: 'task-1', staffId: 'staff-1' },
      { taskId: 'task-2', staffId: 'staff-3' },
    ],
    taskPredecessors: [],
    taskStatusReports: [],
    taskProgress: [
      {
        id: 'progress-1',
        taskId: 'task-1',
        reportDate: '2024-01-05',
        progressPercent: 25,
        notes: 'Initial progress',
      },
      {
        id: 'progress-2',
        taskId: 'task-1',
        reportDate: '2024-01-10',
        progressPercent: 50,
        notes: 'Halfway done',
      },
      {
        id: 'progress-3',
        taskId: 'task-2',
        reportDate: '2024-02-05',
        progressPercent: 75,
        notes: 'Almost complete',
      },
    ] as TaskProgress[],
    taskEvaluations: [],
    projectStatusReports: [],
    priorities: [],
    statuses: [],
    complexities: [],
    teams: [],
    teamMembers: [],
  },
  write: jest.fn().mockResolvedValue(undefined),
});

describe('TaskProgressService', () => {
  let service: TaskProgressService;
  let mockDb: Database;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new TaskProgressService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTaskProgress', () => {
    it('should return all task progress reports when no taskId provided', async () => {
      const result = await service.getAllTaskProgress();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockDb.data.taskProgress);
    });

    it('should return filtered progress reports by taskId', async () => {
      const result = await service.getAllTaskProgress('task-1');

      expect(result).toHaveLength(2);
      expect(result.every((progress) => progress.taskId === 'task-1')).toBe(
        true,
      );
      expect(result[0].id).toBe('progress-1');
      expect(result[1].id).toBe('progress-2');
    });

    it('should return empty array for non-existent taskId', async () => {
      const result = await service.getAllTaskProgress('non-existent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return progress report when found', async () => {
      const result = await service.findById('progress-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('progress-1');
      expect(result?.taskId).toBe('task-1');
      expect(result?.progressPercent).toBe(25);
      expect(result?.notes).toBe('Initial progress');
    });

    it('should return null when progress report not found', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createTaskProgress', () => {
    it('should create a new task progress report successfully', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 100,
        notes: 'Task completed',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.taskId).toBe(progressData.taskId);
      expect(result.reportDate).toBe(progressData.reportDate);
      expect(result.progressPercent).toBe(progressData.progressPercent);
      expect(result.notes).toBe(progressData.notes);
      expect(mockDb.data.taskProgress).toHaveLength(4);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when task does not exist', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'non-existent-task',
        reportDate: '2024-01-15',
        progressPercent: 50,
        notes: 'Progress for non-existent task',
      };

      await expect(service.createTaskProgress(progressData)).rejects.toThrow(
        'Task not found',
      );
      expect(mockDb.data.taskProgress).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when progress percentage is below 0', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: -10,
        notes: 'Invalid progress',
      };

      await expect(service.createTaskProgress(progressData)).rejects.toThrow(
        'Progress percentage must be between 0 and 100',
      );
      expect(mockDb.data.taskProgress).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when progress percentage is above 100', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 110,
        notes: 'Invalid progress',
      };

      await expect(service.createTaskProgress(progressData)).rejects.toThrow(
        'Progress percentage must be between 0 and 100',
      );
      expect(mockDb.data.taskProgress).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow progress percentage of 0', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 0,
        notes: 'Just started',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result.progressPercent).toBe(0);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should allow progress percentage of 100', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 100,
        notes: 'Completed',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result.progressPercent).toBe(100);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    // Creator assignment tests
    it('should auto-assign creator when user email matches assigned staff', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress by assigned staff',
      };

      const result = await service.createTaskProgress(
        progressData,
        'john.doe@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-1');
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });

    it('should auto-assign creator when user email matches evaluator', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress by evaluator',
      };

      const result = await service.createTaskProgress(
        progressData,
        'jane.smith@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-2');
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });

    it('should not auto-assign creator when user email matches staff not assigned to task', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress by unauthorized staff',
      };

      const result = await service.createTaskProgress(
        progressData,
        'bob.wilson@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBeUndefined();
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });

    it('should accept explicit creator when they are assigned to task', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress with explicit creator',
        creatorId: 'staff-1',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-1');
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });

    it('should accept explicit creator when they are evaluator', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress with evaluator as creator',
        creatorId: 'staff-2',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-2');
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });

    it('should throw error when explicit creator is not found', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress with invalid creator',
        creatorId: 'non-existent-staff',
      };

      await expect(service.createTaskProgress(progressData)).rejects.toThrow(
        'Creator staff not found',
      );
    });

    it('should throw error when explicit creator is not authorized', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress with unauthorized creator',
        creatorId: 'staff-3',
      };

      await expect(service.createTaskProgress(progressData)).rejects.toThrow(
        'Creator must be assigned to the task or be the evaluator',
      );
    });

    it('should create report without creator when no user email provided and no explicit creator', async () => {
      const progressData: CreateTaskProgressInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        progressPercent: 75,
        notes: 'Progress without creator',
      };

      const result = await service.createTaskProgress(progressData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBeUndefined();
      expect(result.taskId).toBe('task-1');
      expect(result.progressPercent).toBe(75);
    });
  });

  describe('updateTaskProgress', () => {
    it('should update task progress report successfully', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        reportDate: '2024-01-06',
        progressPercent: 30,
        notes: 'Updated progress notes',
      };

      const result = await service.updateTaskProgress(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('progress-1');
      expect(result.reportDate).toBe('2024-01-06');
      expect(result.progressPercent).toBe(30);
      expect(result.notes).toBe('Updated progress notes');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should update only provided fields', async () => {
      const originalProgress = mockDb.data.taskProgress.find(
        (p) => p.id === 'progress-1',
      )!;
      const originalDate = originalProgress.reportDate;
      const originalPercent = originalProgress.progressPercent;

      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        notes: 'Only notes updated',
      };

      const result = await service.updateTaskProgress(updateData);

      expect(result.reportDate).toBe(originalDate); // Should remain unchanged
      expect(result.progressPercent).toBe(originalPercent); // Should remain unchanged
      expect(result.notes).toBe('Only notes updated');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when progress report not found', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'non-existent',
        notes: 'Updated notes',
      };

      await expect(service.updateTaskProgress(updateData)).rejects.toThrow(
        'Task progress report not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when updated progress percentage is below 0', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        progressPercent: -5,
      };

      await expect(service.updateTaskProgress(updateData)).rejects.toThrow(
        'Progress percentage must be between 0 and 100',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when updated progress percentage is above 100', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        progressPercent: 105,
      };

      await expect(service.updateTaskProgress(updateData)).rejects.toThrow(
        'Progress percentage must be between 0 and 100',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow updating progress percentage to 0', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        progressPercent: 0,
      };

      const result = await service.updateTaskProgress(updateData);

      expect(result.progressPercent).toBe(0);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should allow updating progress percentage to 100', async () => {
      const updateData: UpdateTaskProgressInput = {
        id: 'progress-1',
        progressPercent: 100,
      };

      const result = await service.updateTaskProgress(updateData);

      expect(result.progressPercent).toBe(100);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTaskProgress', () => {
    it('should delete task progress report successfully', async () => {
      const initialCount = mockDb.data.taskProgress.length;

      const result = await service.deleteTaskProgress('progress-1');

      expect(result).toBe(true);
      expect(mockDb.data.taskProgress).toHaveLength(initialCount - 1);
      expect(
        mockDb.data.taskProgress.find((p) => p.id === 'progress-1'),
      ).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when progress report not found', async () => {
      const initialCount = mockDb.data.taskProgress.length;

      await expect(service.deleteTaskProgress('non-existent')).rejects.toThrow(
        'Task progress report not found',
      );
      expect(mockDb.data.taskProgress).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });
});
