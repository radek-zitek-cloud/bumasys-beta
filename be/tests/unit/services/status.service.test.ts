/**
 * @fileoverview Unit tests for StatusService
 */

import { StatusService } from '../../../src/services/status.service';
import type {
  Database,
  Status,
  Task,
  CreateStatusInput,
  UpdateStatusInput,
} from '../../../src/types';

// Mock database
const createMockDatabase = (): Database => ({
  data: {
    users: [],
    sessions: [],
    organizations: [],
    departments: [],
    staff: [],
    projects: [],
    tasks: [
      {
        id: 'task-1',
        name: 'Test Task 1',
        projectId: 'project-1',
        statusId: 'status-1',
      },
      {
        id: 'task-2',
        name: 'Test Task 2',
        projectId: 'project-2',
        statusId: 'status-2',
      },
    ] as Task[],
    taskAssignees: [],
    taskPredecessors: [],
    taskStatusReports: [],
    taskProgress: [],
    taskEvaluations: [],
    projectStatusReports: [],
    priorities: [],
    statuses: [
      {
        id: 'status-1',
        name: 'To Do',
      },
      {
        id: 'status-2',
        name: 'In Progress',
      },
      {
        id: 'status-3',
        name: 'Done',
      },
    ] as Status[],
    complexities: [],
    teams: [],
    teamMembers: [],
  },
  write: jest.fn().mockResolvedValue(undefined),
});

describe('StatusService', () => {
  let service: StatusService;
  let mockDb: Database;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new StatusService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStatuses', () => {
    it('should return all statuses', async () => {
      const result = await service.getAllStatuses();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockDb.data.statuses);
    });

    it('should return empty array when no statuses exist', async () => {
      mockDb.data.statuses = [];

      const result = await service.getAllStatuses();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return status when found', async () => {
      const result = await service.findById('status-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('status-1');
      expect(result?.name).toBe('To Do');
    });

    it('should return null when status not found', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createStatus', () => {
    it('should create a new status successfully', async () => {
      const statusData: CreateStatusInput = {
        name: 'On Hold',
      };

      const result = await service.createStatus(statusData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(statusData.name);
      expect(mockDb.data.statuses).toHaveLength(4);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when status name already exists (case insensitive)', async () => {
      const statusData: CreateStatusInput = {
        name: 'TO DO', // Different case
      };

      await expect(service.createStatus(statusData)).rejects.toThrow(
        'Status name already exists'
      );
      expect(mockDb.data.statuses).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when status name already exists (exact match)', async () => {
      const statusData: CreateStatusInput = {
        name: 'To Do',
      };

      await expect(service.createStatus(statusData)).rejects.toThrow(
        'Status name already exists'
      );
      expect(mockDb.data.statuses).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const updateData: UpdateStatusInput = {
        id: 'status-1',
        name: 'Backlog',
      };

      const result = await service.updateStatus(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('status-1');
      expect(result.name).toBe('Backlog');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when status not found', async () => {
      const updateData: UpdateStatusInput = {
        id: 'non-existent',
        name: 'Updated Name',
      };

      await expect(service.updateStatus(updateData)).rejects.toThrow(
        'Status not found'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when new name conflicts with another status', async () => {
      const updateData: UpdateStatusInput = {
        id: 'status-1',
        name: 'In Progress', // Conflicts with status-2
      };

      await expect(service.updateStatus(updateData)).rejects.toThrow(
        'Status name already exists'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow updating status with same name (case insensitive)', async () => {
      const updateData: UpdateStatusInput = {
        id: 'status-1',
        name: 'TO DO', // Same name but different case
      };

      const result = await service.updateStatus(updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('TO DO');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteStatus', () => {
    it('should delete status successfully when no dependencies', async () => {
      const initialCount = mockDb.data.statuses.length;

      const result = await service.deleteStatus('status-3'); // Not used by any task

      expect(result).toBe(true);
      expect(mockDb.data.statuses).toHaveLength(initialCount - 1);
      expect(mockDb.data.statuses.find(s => s.id === 'status-3')).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when status not found', async () => {
      const initialCount = mockDb.data.statuses.length;

      await expect(service.deleteStatus('non-existent')).rejects.toThrow(
        'Status not found'
      );
      expect(mockDb.data.statuses).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when status is being used by tasks', async () => {
      const initialCount = mockDb.data.statuses.length;

      await expect(service.deleteStatus('status-1')).rejects.toThrow(
        'Cannot delete status: it is being used by tasks'
      );
      expect(mockDb.data.statuses).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });
});
