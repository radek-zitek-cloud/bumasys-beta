import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as priorityService from '../../../src/services/priority'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Priority Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPriorities', () => {
    it('should fetch priorities successfully', async () => {
      const mockPriorities = [
        { id: '1', name: 'High' },
        { id: '2', name: 'Medium' },
        { id: '3', name: 'Low' },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { priorities: mockPriorities },
        }),
      })

      const result = await priorityService.getPriorities()

      expect(result.priorities).toEqual(mockPriorities)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle errors', async () => {
      // Mock error response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Unauthenticated' }],
        }),
      })

      await expect(priorityService.getPriorities()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getPriority', () => {
    it('should fetch a specific priority', async () => {
      const mockPriority = { id: '1', name: 'High' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { priority: mockPriority },
        }),
      })

      const result = await priorityService.getPriority('1')

      expect(result.priority).toEqual(mockPriority)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('createPriority', () => {
    it('should create a new priority', async () => {
      const newPriority = { name: 'Critical' }
      const createdPriority = { id: '4', name: 'Critical' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createPriority: createdPriority },
        }),
      })

      const result = await priorityService.createPriority(newPriority)

      expect(result.createPriority).toEqual(createdPriority)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle creation errors', async () => {
      const newPriority = { name: 'Duplicate' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Priority name already exists' }],
        }),
      })

      await expect(priorityService.createPriority(newPriority)).rejects.toThrow('Priority name already exists')
    })
  })

  describe('updatePriority', () => {
    it('should update an existing priority', async () => {
      const updateData = { id: '1', name: 'Updated Priority' }
      const updatedPriority = { id: '1', name: 'Updated Priority' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updatePriority: updatedPriority },
        }),
      })

      const result = await priorityService.updatePriority(updateData)

      expect(result.updatePriority).toEqual(updatedPriority)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle update errors', async () => {
      const updateData = { id: '999', name: 'Nonexistent' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Priority not found' }],
        }),
      })

      await expect(priorityService.updatePriority(updateData)).rejects.toThrow('Priority not found')
    })
  })

  describe('deletePriority', () => {
    it('should delete a priority', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deletePriority: true },
        }),
      })

      const result = await priorityService.deletePriority('1')

      expect(result.deletePriority).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle deletion errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Cannot delete priority: it is being used by tasks' }],
        }),
      })

      await expect(priorityService.deletePriority('1')).rejects.toThrow('Cannot delete priority: it is being used by tasks')
    })
  })
})
