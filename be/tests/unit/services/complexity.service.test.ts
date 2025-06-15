/**
 * @fileoverview Unit tests for ComplexityService
 * 
 * Tests complexity management functionality including creation, updates,
 * deletion, and retrieval of complexity reference data.
 */

import { ComplexityService } from '../../../src/services/complexity.service';
import type { Database, Complexity, CreateComplexityInput } from '../../../src/types';

describe('ComplexityService', () => {
  let complexityService: ComplexityService;
  let mockDatabase: Database;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDatabase = {
      data: {
        users: [],
        sessions: [],
        organizations: [],
        departments: [],
        staff: [],
        statuses: [],
        priorities: [],
        complexities: [],
        projects: [],
        tasks: [],
        taskAssignees: [],
        taskPredecessors: [],
        taskProgress: [],
        taskEvaluations: [],
        taskStatusReports: [],
        projectStatusReports: [],
        teams: [],
        teamMembers: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    complexityService = new ComplexityService(mockDatabase);
  });

  describe('getAllComplexities', () => {
    it('should return all complexities', async () => {
      // Add test data
      mockDatabase.data.complexities.push(
        { id: 'comp1', name: 'Low' },
        { id: 'comp2', name: 'Medium' },
        { id: 'comp3', name: 'High' }
      );

      const complexities = await complexityService.getAllComplexities();

      expect(complexities).toHaveLength(3);
      expect(complexities[0].name).toBe('Low');
      expect(complexities[1].name).toBe('Medium');
      expect(complexities[2].name).toBe('High');
    });

    it('should return empty array when no complexities exist', async () => {
      const complexities = await complexityService.getAllComplexities();

      expect(complexities).toHaveLength(0);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockDatabase.data.complexities.push(
        { id: 'comp1', name: 'Low' },
        { id: 'comp2', name: 'Medium' }
      );
    });

    it('should find complexity by ID', async () => {
      const complexity = await complexityService.findById('comp1');

      expect(complexity).toBeDefined();
      expect(complexity?.id).toBe('comp1');
      expect(complexity?.name).toBe('Low');
    });

    it('should return null for non-existent ID', async () => {
      const complexity = await complexityService.findById('nonexistent');

      expect(complexity).toBeNull();
    });
  });

  describe('createComplexity', () => {
    it('should create a new complexity', async () => {
      const inputData: CreateComplexityInput = {
        name: 'Very High',
      };

      const complexity = await complexityService.createComplexity(inputData);

      expect(complexity).toBeDefined();
      expect(complexity.name).toBe('Very High');
      expect(complexity.id).toBeDefined();
      expect(typeof complexity.id).toBe('string');

      // Verify complexity was added to database
      expect(mockDatabase.data.complexities).toHaveLength(1);
      expect(mockDatabase.data.complexities[0]).toEqual(complexity);
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should throw error if name already exists', async () => {
      // Add existing complexity
      mockDatabase.data.complexities.push({ id: 'comp1', name: 'Low' });

      const inputData: CreateComplexityInput = {
        name: 'Low',
      };

      await expect(complexityService.createComplexity(inputData)).rejects.toThrow(
        'Complexity name already exists'
      );
    });

    it('should handle case-insensitive name uniqueness', async () => {
      // Add existing complexity with lowercase name
      mockDatabase.data.complexities.push({ id: 'comp1', name: 'low' });

      const inputData: CreateComplexityInput = {
        name: 'LOW',
      };

      await expect(complexityService.createComplexity(inputData)).rejects.toThrow(
        'Complexity name already exists'
      );
    });

    it('should generate unique IDs for different complexities', async () => {
      const inputData1: CreateComplexityInput = { name: 'Low' };
      const inputData2: CreateComplexityInput = { name: 'High' };

      const complexity1 = await complexityService.createComplexity(inputData1);
      const complexity2 = await complexityService.createComplexity(inputData2);

      expect(complexity1.id).not.toBe(complexity2.id);
      expect(mockDatabase.data.complexities).toHaveLength(2);
    });
  });

  describe('updateComplexity', () => {
    beforeEach(() => {
      mockDatabase.data.complexities.push(
        { id: 'comp1', name: 'Low' },
        { id: 'comp2', name: 'Medium' }
      );
    });

    it('should update complexity name', async () => {
      const updateData = {
        id: 'comp1',
        name: 'Very Low',
      };

      const updatedComplexity = await complexityService.updateComplexity(updateData);

      expect(updatedComplexity.id).toBe('comp1');
      expect(updatedComplexity.name).toBe('Very Low');

      // Verify database was updated
      const dbComplexity = mockDatabase.data.complexities.find(c => c.id === 'comp1');
      expect(dbComplexity?.name).toBe('Very Low');
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should throw error if complexity not found', async () => {
      const updateData = {
        id: 'nonexistent',
        name: 'Updated Name',
      };

      await expect(complexityService.updateComplexity(updateData)).rejects.toThrow(
        'Complexity not found'
      );
    });

    it('should throw error if new name conflicts with another complexity', async () => {
      const updateData = {
        id: 'comp1',
        name: 'Medium', // This name already exists for comp2
      };

      await expect(complexityService.updateComplexity(updateData)).rejects.toThrow(
        'Complexity name already exists'
      );
    });

    it('should allow updating complexity with same name (no change)', async () => {
      const updateData = {
        id: 'comp1',
        name: 'Low', // Same name as current
      };

      const updatedComplexity = await complexityService.updateComplexity(updateData);

      expect(updatedComplexity.name).toBe('Low');
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should handle case-insensitive name conflict checking', async () => {
      const updateData = {
        id: 'comp1',
        name: 'MEDIUM', // Conflicts with existing 'Medium'
      };

      await expect(complexityService.updateComplexity(updateData)).rejects.toThrow(
        'Complexity name already exists'
      );
    });
  });

  describe('deleteComplexity', () => {
    beforeEach(() => {
      mockDatabase.data.complexities.push(
        { id: 'comp1', name: 'Low' },
        { id: 'comp2', name: 'Medium' }
      );
    });

    it('should delete complexity when no dependencies exist', async () => {
      const result = await complexityService.deleteComplexity('comp1');

      expect(result).toBe(true);
      expect(mockDatabase.data.complexities).toHaveLength(1);
      expect(mockDatabase.data.complexities[0].id).toBe('comp2');
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should throw error if complexity not found', async () => {
      await expect(complexityService.deleteComplexity('nonexistent')).rejects.toThrow(
        'Complexity not found'
      );
    });

    it('should throw error if complexity is being used by tasks', async () => {
      // Add task that uses the complexity
      mockDatabase.data.tasks.push({
        id: 'task1',
        name: 'Test Task',
        description: 'Test Description',
        projectId: 'project1',
        statusId: 'status1',
        priorityId: 'priority1',
        complexityId: 'comp1', // Uses the complexity we're trying to delete
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
      });

      await expect(complexityService.deleteComplexity('comp1')).rejects.toThrow(
        'Cannot delete complexity: it is being used by tasks'
      );
    });

    it('should allow deletion if complexity is used by other tasks but not the one being deleted', async () => {
      // Add task that uses a different complexity
      mockDatabase.data.tasks.push({
        id: 'task1',
        name: 'Test Task',
        description: 'Test Description',
        projectId: 'project1',
        statusId: 'status1',
        priorityId: 'priority1',
        complexityId: 'comp2', // Uses different complexity
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
      });

      const result = await complexityService.deleteComplexity('comp1');

      expect(result).toBe(true);
      expect(mockDatabase.data.complexities).toHaveLength(1);
      expect(mockDatabase.data.complexities[0].id).toBe('comp2');
    });
  });
});