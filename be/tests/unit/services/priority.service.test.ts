/**
 * @fileoverview Unit tests for PriorityService
 */

import { PriorityService } from '../../../src/services/priority.service';
import type {
  Database,
  Priority,
  Task,
  CreatePriorityInput,
  UpdatePriorityInput,
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
        priorityId: 'priority-1',
      },
      {
        id: 'task-2',
        name: 'Test Task 2',
        projectId: 'project-2',
        priorityId: 'priority-2',
      },
    ] as Task[],
    taskAssignees: [],
    taskPredecessors: [],
    taskStatusReports: [],
    taskProgress: [],
    taskEvaluations: [],
    projectStatusReports: [],
    priorities: [
      {
        id: 'priority-1',
        name: 'High',
      },
      {
        id: 'priority-2',
        name: 'Medium',
      },
      {
        id: 'priority-3',
        name: 'Low',
      },
    ] as Priority[],
    statuses: [],
    complexities: [],
    teams: [],
    teamMembers: [],
  },
  write: jest.fn().mockResolvedValue(undefined),
});

describe('PriorityService', () => {
  let service: PriorityService;
  let mockDb: Database;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new PriorityService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPriorities', () => {
    it('should return all priorities', async () => {
      const result = await service.getAllPriorities();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockDb.data.priorities);
    });

    it('should return empty array when no priorities exist', async () => {
      mockDb.data.priorities = [];

      const result = await service.getAllPriorities();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return priority when found', async () => {
      const result = await service.findById('priority-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('priority-1');
      expect(result?.name).toBe('High');
    });

    it('should return null when priority not found', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createPriority', () => {
    it('should create a new priority successfully', async () => {
      const priorityData: CreatePriorityInput = {
        name: 'Critical',
      };

      const result = await service.createPriority(priorityData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(priorityData.name);
      expect(mockDb.data.priorities).toHaveLength(4);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when priority name already exists (case insensitive)', async () => {
      const priorityData: CreatePriorityInput = {
        name: 'HIGH', // Different case
      };

      await expect(service.createPriority(priorityData)).rejects.toThrow(
        'Priority name already exists'
      );
      expect(mockDb.data.priorities).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when priority name already exists (exact match)', async () => {
      const priorityData: CreatePriorityInput = {
        name: 'High',
      };

      await expect(service.createPriority(priorityData)).rejects.toThrow(
        'Priority name already exists'
      );
      expect(mockDb.data.priorities).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('updatePriority', () => {
    it('should update priority successfully', async () => {
      const updateData: UpdatePriorityInput = {
        id: 'priority-1',
        name: 'Very High',
      };

      const result = await service.updatePriority(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('priority-1');
      expect(result.name).toBe('Very High');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when priority not found', async () => {
      const updateData: UpdatePriorityInput = {
        id: 'non-existent',
        name: 'Updated Name',
      };

      await expect(service.updatePriority(updateData)).rejects.toThrow(
        'Priority not found'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when new name conflicts with another priority', async () => {
      const updateData: UpdatePriorityInput = {
        id: 'priority-1',
        name: 'Medium', // Conflicts with priority-2
      };

      await expect(service.updatePriority(updateData)).rejects.toThrow(
        'Priority name already exists'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow updating priority with same name (case insensitive)', async () => {
      const updateData: UpdatePriorityInput = {
        id: 'priority-1',
        name: 'HIGH', // Same name but different case
      };

      const result = await service.updatePriority(updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('HIGH');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePriority', () => {
    it('should delete priority successfully when no dependencies', async () => {
      const initialCount = mockDb.data.priorities.length;

      const result = await service.deletePriority('priority-3'); // Not used by any task

      expect(result).toBe(true);
      expect(mockDb.data.priorities).toHaveLength(initialCount - 1);
      expect(mockDb.data.priorities.find(p => p.id === 'priority-3')).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when priority not found', async () => {
      const initialCount = mockDb.data.priorities.length;

      await expect(service.deletePriority('non-existent')).rejects.toThrow(
        'Priority not found'
      );
      expect(mockDb.data.priorities).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when priority is being used by tasks', async () => {
      const initialCount = mockDb.data.priorities.length;

      await expect(service.deletePriority('priority-1')).rejects.toThrow(
        'Cannot delete priority: it is being used by tasks'
      );
      expect(mockDb.data.priorities).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });
});
