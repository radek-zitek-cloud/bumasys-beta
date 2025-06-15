import type { CreateTaskInput, UpdateTaskInput } from '../../../src/services/tasks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as taskService from '../../../src/services/tasks'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Task Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('should fetch all tasks successfully', async () => {
      const mockTasks = [
        {
          id: '1',
          name: 'Test Task 1',
          description: 'A test task',
          projectId: 'project-1',
          parentTaskId: null,
          evaluatorId: 'staff-1',
          statusId: 'status-1',
          priorityId: 'priority-1',
          complexityId: 'complexity-1',
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-01-31',
          project: { id: 'project-1', name: 'Test Project' },
          evaluator: {
            id: 'staff-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          status: { id: 'status-1', name: 'In Progress' },
          priority: { id: 'priority-1', name: 'High' },
          complexity: { id: 'complexity-1', name: 'Medium' },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { tasks: mockTasks },
        }),
      })

      const result = await taskService.getTasks()

      expect(result.tasks).toEqual(mockTasks)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
          body: expect.stringContaining('GetTasks'),
        }),
      )
    })

    it('should fetch tasks filtered by project', async () => {
      const mockTasks = [
        {
          id: '1',
          name: 'Project Task 1',
          projectId: 'project-1',
          project: { id: 'project-1', name: 'Test Project' },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { tasks: mockTasks },
        }),
      })

      const result = await taskService.getTasks('project-1')

      expect(result.tasks).toEqual(mockTasks)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('project-1'),
        }),
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(taskService.getTasks()).rejects.toThrow('Network error')
    })
  })

  describe('getTask', () => {
    it('should fetch a specific task successfully', async () => {
      const mockTask = {
        id: '1',
        name: 'Test Task',
        description: 'A test task',
        projectId: 'project-1',
        parentTaskId: null,
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
        project: { id: 'project-1', name: 'Test Project' },
        parentTask: null,
        childTasks: [
          { id: 'child-1', name: 'Child Task', description: 'A child task' },
        ],
        evaluator: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        status: { id: 'status-1', name: 'In Progress' },
        priority: { id: 'priority-1', name: 'High' },
        complexity: { id: 'complexity-1', name: 'Medium' },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { task: mockTask },
        }),
      })

      const result = await taskService.getTask('1')

      expect(result.task).toEqual(mockTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('GetTask'),
        }),
      )
    })

    it('should return null for non-existent task', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { task: null },
        }),
      })

      const result = await taskService.getTask('non-existent')

      expect(result.task).toBeNull()
    })
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask: CreateTaskInput = {
        name: 'New Task',
        description: 'A new task',
        projectId: 'project-1',
        parentTaskId: null,
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
      }

      const mockCreatedTask = {
        id: 'new-task-id',
        ...newTask,
        project: { id: 'project-1', name: 'Test Project' },
        evaluator: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        status: { id: 'status-1', name: 'In Progress' },
        priority: { id: 'priority-1', name: 'High' },
        complexity: { id: 'complexity-1', name: 'Medium' },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createTask: mockCreatedTask },
        }),
      })

      const result = await taskService.createTask(newTask)

      expect(result.createTask).toEqual(mockCreatedTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('CreateTask'),
        }),
      )
    })

    it('should handle validation errors', async () => {
      const invalidTask: CreateTaskInput = {
        name: '', // Invalid: empty name
        projectId: 'project-1',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Task name is required' }],
        }),
      })

      await expect(taskService.createTask(invalidTask)).rejects.toThrow()
    })

    it('should handle project not found error', async () => {
      const taskWithInvalidProject: CreateTaskInput = {
        name: 'Valid Task Name',
        projectId: 'non-existent-project',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Project not found' }],
        }),
      })

      await expect(taskService.createTask(taskWithInvalidProject)).rejects.toThrow()
    })
  })

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData: UpdateTaskInput = {
        id: '1',
        name: 'Updated Task Name',
        description: 'Updated description',
        statusId: 'status-2',
      }

      const mockUpdatedTask = {
        id: '1',
        name: 'Updated Task Name',
        description: 'Updated description',
        projectId: 'project-1',
        statusId: 'status-2',
        project: { id: 'project-1', name: 'Test Project' },
        status: { id: 'status-2', name: 'Completed' },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateTask: mockUpdatedTask },
        }),
      })

      const result = await taskService.updateTask(updateData)

      expect(result.updateTask).toEqual(mockUpdatedTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('UpdateTask'),
        }),
      )
    })

    it('should handle task not found error', async () => {
      const updateData: UpdateTaskInput = {
        id: 'non-existent',
        name: 'Updated Name',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Task not found' }],
        }),
      })

      await expect(taskService.updateTask(updateData)).rejects.toThrow()
    })
  })

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteTask: true },
        }),
      })

      const result = await taskService.deleteTask('1')

      expect(result.deleteTask).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('DeleteTask'),
        }),
      )
    })

    it('should handle dependency errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Cannot delete task: it has child tasks' }],
        }),
      })

      await expect(taskService.deleteTask('1')).rejects.toThrow()
    })

    it('should handle task not found error', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Task not found' }],
        }),
      })

      await expect(taskService.deleteTask('non-existent')).rejects.toThrow()
    })
  })
})
