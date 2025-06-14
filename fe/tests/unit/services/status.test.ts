import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as statusService from '../../../src/services/status'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Status Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStatuses', () => {
    it('should fetch statuses successfully', async () => {
      const mockStatuses = [
        { id: '1', name: 'In Progress' },
        { id: '2', name: 'Completed' },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { statuses: mockStatuses },
        }),
      })

      const result = await statusService.getStatuses()

      expect(result.statuses).toEqual(mockStatuses)
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

      await expect(statusService.getStatuses()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getStatus', () => {
    it('should fetch a specific status', async () => {
      const mockStatus = { id: '1', name: 'In Progress' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { status: mockStatus },
        }),
      })

      const result = await statusService.getStatus('1')

      expect(result.status).toEqual(mockStatus)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('createStatus', () => {
    it('should create a new status', async () => {
      const newStatus = { name: 'Draft' }
      const createdStatus = { id: '3', name: 'Draft' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createStatus: createdStatus },
        }),
      })

      const result = await statusService.createStatus(newStatus)

      expect(result.createStatus).toEqual(createdStatus)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle creation errors', async () => {
      const newStatus = { name: 'Duplicate' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Status name already exists' }],
        }),
      })

      await expect(statusService.createStatus(newStatus)).rejects.toThrow('Status name already exists')
    })
  })

  describe('updateStatus', () => {
    it('should update an existing status', async () => {
      const updateData = { id: '1', name: 'Updated Status' }
      const updatedStatus = { id: '1', name: 'Updated Status' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateStatus: updatedStatus },
        }),
      })

      const result = await statusService.updateStatus(updateData)

      expect(result.updateStatus).toEqual(updatedStatus)
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
          errors: [{ message: 'Status not found' }],
        }),
      })

      await expect(statusService.updateStatus(updateData)).rejects.toThrow('Status not found')
    })
  })

  describe('deleteStatus', () => {
    it('should delete a status', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteStatus: true },
        }),
      })

      const result = await statusService.deleteStatus('1')

      expect(result.deleteStatus).toBe(true)
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
          errors: [{ message: 'Cannot delete status: it is being used by tasks' }],
        }),
      })

      await expect(statusService.deleteStatus('1')).rejects.toThrow('Cannot delete status: it is being used by tasks')
    })
  })
})
