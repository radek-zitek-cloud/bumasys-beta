import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as complexityService from '../../../src/services/complexity'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Complexity Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getComplexities', () => {
    it('should fetch complexities successfully', async () => {
      const mockComplexities = [
        { id: '1', name: 'Simple' },
        { id: '2', name: 'Medium' },
        { id: '3', name: 'Complex' },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { complexities: mockComplexities },
        }),
      })

      const result = await complexityService.getComplexities()

      expect(result.complexities).toEqual(mockComplexities)
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

      await expect(complexityService.getComplexities()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getComplexity', () => {
    it('should fetch a specific complexity', async () => {
      const mockComplexity = { id: '1', name: 'Simple' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { complexity: mockComplexity },
        }),
      })

      const result = await complexityService.getComplexity('1')

      expect(result.complexity).toEqual(mockComplexity)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('createComplexity', () => {
    it('should create a new complexity', async () => {
      const newComplexity = { name: 'Very Complex' }
      const createdComplexity = { id: '4', name: 'Very Complex' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createComplexity: createdComplexity },
        }),
      })

      const result = await complexityService.createComplexity(newComplexity)

      expect(result.createComplexity).toEqual(createdComplexity)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should handle creation errors', async () => {
      const newComplexity = { name: 'Duplicate' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Complexity name already exists' }],
        }),
      })

      await expect(complexityService.createComplexity(newComplexity)).rejects.toThrow('Complexity name already exists')
    })
  })

  describe('updateComplexity', () => {
    it('should update an existing complexity', async () => {
      const updateData = { id: '1', name: 'Updated Complexity' }
      const updatedComplexity = { id: '1', name: 'Updated Complexity' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateComplexity: updatedComplexity },
        }),
      })

      const result = await complexityService.updateComplexity(updateData)

      expect(result.updateComplexity).toEqual(updatedComplexity)
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
          errors: [{ message: 'Complexity not found' }],
        }),
      })

      await expect(complexityService.updateComplexity(updateData)).rejects.toThrow('Complexity not found')
    })
  })

  describe('deleteComplexity', () => {
    it('should delete a complexity', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteComplexity: true },
        }),
      })

      const result = await complexityService.deleteComplexity('1')

      expect(result.deleteComplexity).toBe(true)
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
          errors: [{ message: 'Cannot delete complexity: it is being used by tasks' }],
        }),
      })

      await expect(complexityService.deleteComplexity('1')).rejects.toThrow('Cannot delete complexity: it is being used by tasks')
    })
  })
})