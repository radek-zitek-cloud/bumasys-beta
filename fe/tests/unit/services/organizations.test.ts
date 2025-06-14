/**
 * @fileoverview Unit tests for the organizations service
 * 
 * These tests verify the GraphQL integration and API calls for organization
 * management functionality, following the same patterns as existing service tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as organizationService from '../../../src/services/organizations'
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '../../../src/services/organizations'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Organization Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOrganization: Organization = {
    id: '1',
    name: 'Test Organization',
    description: 'A test organization',
    rootDepartmentId: 'dept-1',
    rootStaffId: 'staff-1',
  }

  describe('getOrganizations', () => {
    it('should fetch organizations successfully', async () => {
      const mockOrganizations = [mockOrganization]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { organizations: mockOrganizations },
        }),
      })

      const result = await organizationService.getOrganizations()

      expect(result.organizations).toEqual(mockOrganizations)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: expect.stringContaining('organizations'),
      }))
    })

    it('should handle errors', async () => {
      // Mock error response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Unauthenticated' }],
        }),
      })

      await expect(organizationService.getOrganizations()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getOrganization', () => {
    it('should fetch a specific organization successfully', async () => {
      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { organization: mockOrganization },
        }),
      })

      const result = await organizationService.getOrganization('1')

      expect(result.organization).toEqual(mockOrganization)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('organization(id: $id)'),
      }))
    })

    it('should return null for non-existent organization', async () => {
      // Mock null response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { organization: null },
        }),
      })

      const result = await organizationService.getOrganization('non-existent')

      expect(result.organization).toBeNull()
    })
  })

  describe('createOrganization', () => {
    it('should create organization successfully', async () => {
      const createInput: CreateOrganizationInput = {
        name: 'New Organization',
        description: 'A new organization',
      }

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createOrganization: { ...mockOrganization, ...createInput } },
        }),
      })

      const result = await organizationService.createOrganization(createInput)

      expect(result.createOrganization.name).toBe(createInput.name)
      expect(result.createOrganization.description).toBe(createInput.description)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('createOrganization'),
      }))
    })

    it('should handle creation errors', async () => {
      const createInput: CreateOrganizationInput = {
        name: 'Duplicate Organization',
      }

      // Mock error response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Organization name already in use' }],
        }),
      })

      await expect(organizationService.createOrganization(createInput)).rejects.toThrow('Organization name already in use')
    })
  })

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      const updateInput: UpdateOrganizationInput = {
        id: '1',
        name: 'Updated Organization',
        description: 'Updated description',
      }

      const updatedOrganization = { ...mockOrganization, ...updateInput }

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateOrganization: updatedOrganization },
        }),
      })

      const result = await organizationService.updateOrganization(updateInput)

      expect(result.updateOrganization.name).toBe(updateInput.name)
      expect(result.updateOrganization.description).toBe(updateInput.description)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('updateOrganization'),
      }))
    })

    it('should handle update errors', async () => {
      const updateInput: UpdateOrganizationInput = {
        id: 'non-existent',
        name: 'Non-existent Organization',
      }

      // Mock error response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Organization not found' }],
        }),
      })

      await expect(organizationService.updateOrganization(updateInput)).rejects.toThrow('Organization not found')
    })
  })

  describe('deleteOrganization', () => {
    it('should delete organization successfully', async () => {
      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteOrganization: true },
        }),
      })

      const result = await organizationService.deleteOrganization('1')

      expect(result.deleteOrganization).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('deleteOrganization'),
      }))
    })

    it('should handle deletion errors', async () => {
      // Mock error response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          errors: [{ message: 'Cannot delete organization with existing departments or staff members' }],
        }),
      })

      await expect(organizationService.deleteOrganization('1')).rejects.toThrow('Cannot delete organization with existing departments or staff members')
    })
  })
})