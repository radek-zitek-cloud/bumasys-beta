import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as teamService from '../../../src/services/teams'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Team Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTeams', () => {
    it('should fetch teams successfully', async () => {
      const mockTeams = [
        { id: '1', name: 'Development Team', description: 'Main dev team', leadId: 'staff-1' },
        { id: '2', name: 'Design Team', description: 'UI/UX team', leadId: null },
      ]

      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { teams: mockTeams },
        }),
      })

      const result = await teamService.getTeams()

      expect(result.teams).toEqual(mockTeams)
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

      await expect(teamService.getTeams()).rejects.toThrow('Unauthenticated')
    })
  })

  describe('getTeam', () => {
    it('should fetch a specific team', async () => {
      const mockTeam = { id: '1', name: 'Development Team', description: 'Main dev team', leadId: 'staff-1' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { team: mockTeam },
        }),
      })

      const result = await teamService.getTeam('1')

      expect(result.team).toEqual(mockTeam)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('getTeamMembers', () => {
    it('should fetch team members with staff information', async () => {
      const mockTeamMembers = [
        {
          id: 'member-1',
          teamId: 'team-1',
          staffId: 'staff-1',
          memberRole: 'Developer',
          staff: {
            id: 'staff-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Senior Developer',
          },
        },
        {
          id: 'member-2',
          teamId: 'team-1',
          staffId: 'staff-2',
          memberRole: 'Designer',
          staff: {
            id: 'staff-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'UI Designer',
          },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { teamMembers: mockTeamMembers },
        }),
      })

      const result = await teamService.getTeamMembers('team-1')

      expect(result.teamMembers).toEqual(mockTeamMembers)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const newTeam = {
        name: 'QA Team',
        description: 'Quality Assurance team',
        leadId: 'staff-3',
      }
      const createdTeam = { id: '3', ...newTeam }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createTeam: createdTeam },
        }),
      })

      const result = await teamService.createTeam(newTeam)

      expect(result.createTeam).toEqual(createdTeam)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })

    it('should create a team without optional fields', async () => {
      const newTeam = {
        name: 'Simple Team',
      }
      const createdTeam = { id: '4', name: 'Simple Team', description: null, leadId: null }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { createTeam: createdTeam },
        }),
      })

      const result = await teamService.createTeam(newTeam)

      expect(result.createTeam).toEqual(createdTeam)
    })
  })

  describe('updateTeam', () => {
    it('should update an existing team', async () => {
      const updateData = {
        id: '1',
        name: 'Updated Development Team',
        description: 'Updated description',
        leadId: 'staff-2',
      }
      const updatedTeam = { id: '1', name: 'Updated Development Team', description: 'Updated description', leadId: 'staff-2' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateTeam: updatedTeam },
        }),
      })

      const result = await teamService.updateTeam(updateData)

      expect(result.updateTeam).toEqual(updatedTeam)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { deleteTeam: true },
        }),
      })

      const result = await teamService.deleteTeam('1')

      expect(result.deleteTeam).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('addTeamMember', () => {
    it('should add a team member', async () => {
      const memberData = {
        teamId: 'team-1',
        staffId: 'staff-3',
        memberRole: 'Tester',
      }
      const createdMember = { id: 'member-3', ...memberData }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { addTeamMember: createdMember },
        }),
      })

      const result = await teamService.addTeamMember(memberData)

      expect(result.addTeamMember).toEqual(createdMember)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('updateTeamMember', () => {
    it('should update a team member role', async () => {
      const updateData = {
        id: 'member-1',
        memberRole: 'Senior Developer',
      }
      const updatedMember = { id: 'member-1', teamId: 'team-1', staffId: 'staff-1', memberRole: 'Senior Developer' }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { updateTeamMember: updatedMember },
        }),
      })

      const result = await teamService.updateTeamMember(updateData)

      expect(result.updateTeamMember).toEqual(updatedMember)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('removeTeamMember', () => {
    it('should remove a team member', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { removeTeamMember: true },
        }),
      })

      const result = await teamService.removeTeamMember('member-1')

      expect(result.removeTeamMember).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      }))
    })
  })

  describe('removeStaffFromTeam', () => {
    it('should remove staff from team by team and staff ID', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: { removeStaffFromTeam: true },
        }),
      })

      const result = await teamService.removeStaffFromTeam('team-1', 'staff-1')

      expect(result.removeStaffFromTeam).toBe(true)
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