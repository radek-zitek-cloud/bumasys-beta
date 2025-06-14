import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as userService from '../../../src/services/users'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe' },
        { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith' },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { users: mockUsers },
        }),
      })

      const result = await userService.getUsers()

      expect(result.users).toEqual(mockUsers)
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

      await expect(userService.getUsers()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getUser', () => {
    it('should fetch a specific user', async () => {
      const mockUser = { id: '1', email: 'user@example.com', firstName: 'John' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { user: mockUser },
        }),
      })

      const result = await userService.getUser('1')

      expect(result.user).toEqual(mockUser)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      }
      const createdUser = { id: '3', ...newUser }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createUser: createdUser },
        }),
      })

      const result = await userService.createUser(newUser)

      expect(result.createUser).toEqual(createdUser)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updateData = {
        id: '1',
        firstName: 'Updated',
        lastName: 'Name',
      }
      const updatedUser = { id: '1', email: 'user@example.com', firstName: 'Updated', lastName: 'Name' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateUser: updatedUser },
        }),
      })

      const result = await userService.updateUser(updateData)

      expect(result.updateUser).toEqual(updatedUser)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteUser: true },
        }),
      })

      const result = await userService.deleteUser('1')

      expect(result.deleteUser).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })
})
