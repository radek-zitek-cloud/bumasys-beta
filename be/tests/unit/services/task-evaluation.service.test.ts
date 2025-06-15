/**
 * @fileoverview Unit tests for TaskEvaluationService
 * 
 * Tests task evaluation service functionality including evaluation creation,
 * updates, retrieval, and deletion operations.
 */

import { TaskEvaluationService } from '../../../src/services/task-evaluation.service';
import type { Database, Task, Staff, TaskEvaluation, CreateTaskEvaluationInput, UpdateTaskEvaluationInput } from '../../../src/types';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('TaskEvaluationService', () => {
  let taskEvaluationService: TaskEvaluationService;
  let mockDatabase: Database;

  const mockTask: Task = {
    id: 'task-1',
    name: 'Test Task',
    description: 'Test task description',
    projectId: 'project-1',
    statusId: 'status-1',
    priorityId: 'priority-1',
    complexityId: 'complexity-1',
  };

  const mockStaff: Staff = {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    organizationId: 'org-1',
    departmentId: 'dept-1',
  };

  const mockEvaluation: TaskEvaluation = {
    id: 'eval-1',
    taskId: 'task-1',
    evaluatorId: 'staff-1',
    evaluationDate: '2025-06-15',
    evaluationNotes: 'Good performance',
    result: 'Passed',
  };

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDatabase = {
      data: {
        users: [],
        sessions: [],
        organizations: [],
        departments: [],
        staff: [mockStaff],
        teams: [],
        teamMembers: [],
        projects: [],
        tasks: [mockTask],
        taskAssignees: [],
        taskPredecessors: [],
        taskEvaluations: [mockEvaluation],
        taskProgress: [],
        taskStatusReports: [],
        projectStatusReports: [],
        priorities: [],
        statuses: [],
        complexities: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    taskEvaluationService = new TaskEvaluationService(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTaskEvaluations', () => {
    it('should return all task evaluations when no taskId is provided', async () => {
      const result = await taskEvaluationService.getAllTaskEvaluations();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEvaluation);
    });

    it('should return filtered evaluations when taskId is provided', async () => {
      const evaluation2: TaskEvaluation = {
        id: 'eval-2',
        taskId: 'task-2',
        evaluatorId: 'staff-1',
        evaluationDate: '2025-06-16',
        evaluationNotes: 'Needs improvement',
        result: 'Failed',
      };
      mockDatabase.data.taskEvaluations.push(evaluation2);

      const result = await taskEvaluationService.getAllTaskEvaluations('task-1');
      
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe('task-1');
    });

    it('should return empty array when no evaluations match taskId', async () => {
      const result = await taskEvaluationService.getAllTaskEvaluations('nonexistent-task');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return evaluation when found', async () => {
      const result = await taskEvaluationService.findById('eval-1');
      
      expect(result).toEqual(mockEvaluation);
    });

    it('should return null when evaluation not found', async () => {
      const result = await taskEvaluationService.findById('nonexistent-eval');
      
      expect(result).toBeNull();
    });
  });

  describe('findByTaskId', () => {
    it('should return evaluation when found by task ID', async () => {
      const result = await taskEvaluationService.findByTaskId('task-1');
      
      expect(result).toEqual(mockEvaluation);
    });

    it('should return null when no evaluation found for task ID', async () => {
      const result = await taskEvaluationService.findByTaskId('nonexistent-task');
      
      expect(result).toBeNull();
    });
  });

  describe('createTaskEvaluation', () => {
    const validEvaluationData: CreateTaskEvaluationInput = {
      taskId: 'task-1',
      evaluatorId: 'staff-1',
      evaluationDate: '2025-06-20',
      evaluationNotes: 'Excellent work',
      result: 'Passed',
    };

    beforeEach(() => {
      // Remove existing evaluation to test creation
      mockDatabase.data.taskEvaluations = [];
    });

    it('should create a new task evaluation successfully', async () => {
      const result = await taskEvaluationService.createTaskEvaluation(validEvaluationData);
      
      expect(result).toEqual({
        id: 'mock-uuid-1234',
        taskId: 'task-1',
        evaluatorId: 'staff-1',
        evaluationDate: '2025-06-20',
        evaluationNotes: 'Excellent work',
        result: 'Passed',
      });
      expect(mockDatabase.data.taskEvaluations).toHaveLength(1);
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when task does not exist', async () => {
      const invalidData = { ...validEvaluationData, taskId: 'nonexistent-task' };
      
      await expect(taskEvaluationService.createTaskEvaluation(invalidData))
        .rejects.toThrow('Task not found');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });

    it('should throw error when evaluator does not exist', async () => {
      const invalidData = { ...validEvaluationData, evaluatorId: 'nonexistent-staff' };
      
      await expect(taskEvaluationService.createTaskEvaluation(invalidData))
        .rejects.toThrow('Evaluator not found');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });

    it('should throw error when evaluation already exists for task', async () => {
      // Add an existing evaluation back
      mockDatabase.data.taskEvaluations = [mockEvaluation];
      
      await expect(taskEvaluationService.createTaskEvaluation(validEvaluationData))
        .rejects.toThrow('Task evaluation already exists for this task');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });
  });

  describe('updateTaskEvaluation', () => {
    const validUpdateData: UpdateTaskEvaluationInput = {
      id: 'eval-1',
      evaluationNotes: 'Updated notes',
      result: 'Failed',
    };

    it('should update evaluation successfully', async () => {
      const result = await taskEvaluationService.updateTaskEvaluation(validUpdateData);
      
      expect(result.evaluationNotes).toBe('Updated notes');
      expect(result.result).toBe('Failed');
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });

    it('should update evaluator when provided', async () => {
      const updateData = { ...validUpdateData, evaluatorId: 'staff-1' };
      
      const result = await taskEvaluationService.updateTaskEvaluation(updateData);
      
      expect(result.evaluatorId).toBe('staff-1');
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });

    it('should update evaluation date when provided', async () => {
      const updateData = { ...validUpdateData, evaluationDate: '2025-06-25' };
      
      const result = await taskEvaluationService.updateTaskEvaluation(updateData);
      
      expect(result.evaluationDate).toBe('2025-06-25');
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when evaluation not found', async () => {
      const invalidUpdateData = { ...validUpdateData, id: 'nonexistent-eval' };
      
      await expect(taskEvaluationService.updateTaskEvaluation(invalidUpdateData))
        .rejects.toThrow('Task evaluation not found');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });

    it('should throw error when evaluator does not exist', async () => {
      const invalidUpdateData = { ...validUpdateData, evaluatorId: 'nonexistent-staff' };
      
      await expect(taskEvaluationService.updateTaskEvaluation(invalidUpdateData))
        .rejects.toThrow('Evaluator not found');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });

    it('should not update properties when undefined', async () => {
      const originalEvaluation = { ...mockEvaluation };
      const updateData = { id: 'eval-1' }; // No properties to update
      
      const result = await taskEvaluationService.updateTaskEvaluation(updateData);
      
      expect(result).toEqual(originalEvaluation);
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTaskEvaluation', () => {
    it('should delete evaluation successfully', async () => {
      const result = await taskEvaluationService.deleteTaskEvaluation('eval-1');
      
      expect(result).toBe(true);
      expect(mockDatabase.data.taskEvaluations).toHaveLength(0);
      expect(mockDatabase.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when evaluation not found', async () => {
      await expect(taskEvaluationService.deleteTaskEvaluation('nonexistent-eval'))
        .rejects.toThrow('Task evaluation not found');
      expect(mockDatabase.write).not.toHaveBeenCalled();
    });
  });
});
