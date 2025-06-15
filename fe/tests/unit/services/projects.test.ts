import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as projectService from '../../../src/services/projects'
import type { CreateProjectInput, UpdateProjectInput } from '../../../src/services/projects'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Project Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project 1',
          description: 'A test project',
          leadStaffId: 'staff-1',
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-12-31',
          leadStaff: {
            id: 'staff-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: '2',
          name: 'Test Project 2',
          description: 'Another test project',
          leadStaffId: null,
          plannedStartDate: null,
          plannedEndDate: null,
          leadStaff: null,
        },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { projects: mockProjects },
        }),
      })

      const result = await projectService.getProjects()

      expect(result.projects).toEqual(mockProjects)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
          body: expect.stringContaining('query'),
        })
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(projectService.getProjects()).rejects.toThrow('Network error')
    })
  })

  describe('getProject', () => {
    it('should fetch a specific project successfully', async () => {
      const mockProject = {
        id: '1',
        name: 'Test Project',
        description: 'A test project',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-12-31',
        leadStaff: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        tasks: [
          { id: 'task-1', name: 'Test Task', description: 'A test task' },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { project: mockProject },
        }),
      })

      const result = await projectService.getProject('1')

      expect(result.project).toEqual(mockProject)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('GetProject'),
        })
      )
    })

    it('should return null for non-existent project', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { project: null },
        }),
      })

      const result = await projectService.getProject('non-existent')

      expect(result.project).toBeNull()
    })
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const newProject: CreateProjectInput = {
        name: 'New Project',
        description: 'A new project',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-12-31',
      }

      const mockCreatedProject = {
        id: 'new-project-id',
        ...newProject,
        leadStaff: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createProject: mockCreatedProject },
        }),
      })

      const result = await projectService.createProject(newProject)

      expect(result.createProject).toEqual(mockCreatedProject)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('CreateProject'),
        })
      )
    })

    it('should handle validation errors', async () => {
      const invalidProject: CreateProjectInput = {
        name: '', // Invalid: empty name
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Project name is required' }],
        }),
      })

      await expect(projectService.createProject(invalidProject)).rejects.toThrow()
    })
  })

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const updateData: UpdateProjectInput = {
        id: '1',
        name: 'Updated Project Name',
        description: 'Updated description',
      }

      const mockUpdatedProject = {
        id: '1',
        name: 'Updated Project Name',
        description: 'Updated description',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-12-31',
        leadStaff: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateProject: mockUpdatedProject },
        }),
      })

      const result = await projectService.updateProject(updateData)

      expect(result.updateProject).toEqual(mockUpdatedProject)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('UpdateProject'),
        })
      )
    })

    it('should handle project not found error', async () => {
      const updateData: UpdateProjectInput = {
        id: 'non-existent',
        name: 'Updated Name',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Project not found' }],
        }),
      })

      await expect(projectService.updateProject(updateData)).rejects.toThrow()
    })
  })

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteProject: true },
        }),
      })

      const result = await projectService.deleteProject('1')

      expect(result.deleteProject).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('DeleteProject'),
        })
      )
    })

    it('should handle dependency errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Cannot delete project: it has associated tasks' }],
        }),
      })

      await expect(projectService.deleteProject('1')).rejects.toThrow()
    })

    it('should handle project not found error', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Project not found' }],
        }),
      })

      await expect(projectService.deleteProject('non-existent')).rejects.toThrow()
    })
  })
})