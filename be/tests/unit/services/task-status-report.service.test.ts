/**
 * @fileoverview Unit tests for TaskStatusReportService
 */

import { TaskStatusReportService } from '../../../src/services/task-status-report.service';
import type {
  Database,
  TaskStatusReport,
  Task,
  CreateTaskStatusReportInput,
  UpdateTaskStatusReportInput,
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
        description: 'Description 1',
        projectId: 'project-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-10',
        evaluatorId: 'staff-2',
      },
      {
        id: 'task-2',
        name: 'Test Task 2',
        description: 'Description 2',
        projectId: 'project-2',
        statusId: 'status-2',
        priorityId: 'priority-2',
        complexityId: 'complexity-2',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-02-15',
      },
    ] as Task[],
    taskAssignees: [
      { taskId: 'task-1', staffId: 'staff-1' },
      { taskId: 'task-2', staffId: 'staff-3' },
    ],
    taskPredecessors: [],
    taskStatusReports: [
      {
        id: 'report-1',
        taskId: 'task-1',
        reportDate: '2024-01-05',
        statusSummary: 'Initial progress report',
      },
      {
        id: 'report-2',
        taskId: 'task-1',
        reportDate: '2024-01-07',
        statusSummary: 'Mid-progress report',
      },
      {
        id: 'report-3',
        taskId: 'task-2',
        reportDate: '2024-02-05',
        statusSummary: 'Different task report',
      },
    ] as TaskStatusReport[],
    taskProgress: [],
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

describe('TaskStatusReportService', () => {
  let service: TaskStatusReportService;
  let mockDb: Database;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new TaskStatusReportService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTaskStatusReports', () => {
    it('should return all task status reports when no taskId provided', async () => {
      const result = await service.getAllTaskStatusReports();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockDb.data.taskStatusReports);
    });

    it('should return filtered reports by taskId', async () => {
      const result = await service.getAllTaskStatusReports('task-1');

      expect(result).toHaveLength(2);
      expect(result.every((report) => report.taskId === 'task-1')).toBe(true);
      expect(result[0].id).toBe('report-1');
      expect(result[1].id).toBe('report-2');
    });

    it('should return empty array for non-existent taskId', async () => {
      const result = await service.getAllTaskStatusReports('non-existent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return report when found', async () => {
      const result = await service.findById('report-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('report-1');
      expect(result?.taskId).toBe('task-1');
      expect(result?.statusSummary).toBe('Initial progress report');
    });

    it('should return null when report not found', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createTaskStatusReport', () => {
    it('should create a new task status report successfully', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-10',
        statusSummary: 'Final status report',
      };

      const result = await service.createTaskStatusReport(reportData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.taskId).toBe(reportData.taskId);
      expect(result.reportDate).toBe(reportData.reportDate);
      expect(result.statusSummary).toBe(reportData.statusSummary);
      expect(mockDb.data.taskStatusReports).toHaveLength(4);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when task does not exist', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'non-existent-task',
        reportDate: '2024-01-10',
        statusSummary: 'Report for non-existent task',
      };

      await expect(service.createTaskStatusReport(reportData)).rejects.toThrow(
        'Task not found',
      );
      expect(mockDb.data.taskStatusReports).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    // Creator assignment tests
    it('should auto-assign creator when user email matches assigned staff', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status by assigned staff',
      };

      const result = await service.createTaskStatusReport(
        reportData,
        'john.doe@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-1');
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status by assigned staff');
    });

    it('should auto-assign creator when user email matches evaluator', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status by evaluator',
      };

      const result = await service.createTaskStatusReport(
        reportData,
        'jane.smith@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-2');
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status by evaluator');
    });

    it('should not auto-assign creator when user email matches staff not assigned to task', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status by unauthorized staff',
      };

      const result = await service.createTaskStatusReport(
        reportData,
        'bob.wilson@example.com',
      );

      expect(result).toBeDefined();
      expect(result.creatorId).toBeUndefined();
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status by unauthorized staff');
    });

    it('should accept explicit creator when they are assigned to task', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status with explicit creator',
        creatorId: 'staff-1',
      };

      const result = await service.createTaskStatusReport(reportData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-1');
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status with explicit creator');
    });

    it('should accept explicit creator when they are evaluator', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status with evaluator as creator',
        creatorId: 'staff-2',
      };

      const result = await service.createTaskStatusReport(reportData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBe('staff-2');
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status with evaluator as creator');
    });

    it('should throw error when explicit creator is not found', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status with invalid creator',
        creatorId: 'non-existent-staff',
      };

      await expect(service.createTaskStatusReport(reportData)).rejects.toThrow(
        'Creator staff not found',
      );
    });

    it('should throw error when explicit creator is not authorized', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status with unauthorized creator',
        creatorId: 'staff-3',
      };

      await expect(service.createTaskStatusReport(reportData)).rejects.toThrow(
        'Creator must be assigned to the task or be the evaluator',
      );
    });

    it('should create report without creator when no user email provided and no explicit creator', async () => {
      const reportData: CreateTaskStatusReportInput = {
        taskId: 'task-1',
        reportDate: '2024-01-15',
        statusSummary: 'Status without creator',
      };

      const result = await service.createTaskStatusReport(reportData);

      expect(result).toBeDefined();
      expect(result.creatorId).toBeUndefined();
      expect(result.taskId).toBe('task-1');
      expect(result.statusSummary).toBe('Status without creator');
    });
  });

  describe('updateTaskStatusReport', () => {
    it('should update task status report successfully', async () => {
      const updateData: UpdateTaskStatusReportInput = {
        id: 'report-1',
        reportDate: '2024-01-06',
        statusSummary: 'Updated status summary',
      };

      const result = await service.updateTaskStatusReport(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('report-1');
      expect(result.reportDate).toBe('2024-01-06');
      expect(result.statusSummary).toBe('Updated status summary');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should update only provided fields', async () => {
      const originalReport = mockDb.data.taskStatusReports.find(
        (r) => r.id === 'report-1',
      )!;
      const originalDate = originalReport.reportDate;

      const updateData: UpdateTaskStatusReportInput = {
        id: 'report-1',
        statusSummary: 'Only summary updated',
      };

      const result = await service.updateTaskStatusReport(updateData);

      expect(result.reportDate).toBe(originalDate); // Should remain unchanged
      expect(result.statusSummary).toBe('Only summary updated');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when report not found', async () => {
      const updateData: UpdateTaskStatusReportInput = {
        id: 'non-existent',
        statusSummary: 'Updated summary',
      };

      await expect(service.updateTaskStatusReport(updateData)).rejects.toThrow(
        'Task status report not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('deleteTaskStatusReport', () => {
    it('should delete task status report successfully', async () => {
      const initialCount = mockDb.data.taskStatusReports.length;

      const result = await service.deleteTaskStatusReport('report-1');

      expect(result).toBe(true);
      expect(mockDb.data.taskStatusReports).toHaveLength(initialCount - 1);
      expect(
        mockDb.data.taskStatusReports.find((r) => r.id === 'report-1'),
      ).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when report not found', async () => {
      const initialCount = mockDb.data.taskStatusReports.length;

      await expect(
        service.deleteTaskStatusReport('non-existent'),
      ).rejects.toThrow('Task status report not found');
      expect(mockDb.data.taskStatusReports).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });
});
