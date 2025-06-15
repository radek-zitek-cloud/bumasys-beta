/**
 * @fileoverview Team service unit tests
 *
 * Tests for team management functionality including CRUD operations
 * and team membership management.
 */

import { TeamService } from '../../../src/services/team.service';
import type { Database, Team, TeamMember } from '../../../src/types';

describe('TeamService', () => {
  let teamService: TeamService;
  let mockDatabase: Database;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDatabase = {
      data: {
        users: [],
        sessions: [],
        organizations: [],
        departments: [],
        staff: [
          {
            id: 'staff-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            role: 'Developer',
            organizationId: 'org-1',
            departmentId: 'dept-1',
          },
          {
            id: 'staff-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@test.com',
            role: 'Manager',
            organizationId: 'org-1',
            departmentId: 'dept-1',
          },
        ],
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

    teamService = new TeamService(mockDatabase);
  });

  describe('createTeam', () => {
    it('should create a team with valid data', async () => {
      const teamData = {
        name: 'Development Team',
        description: 'Main development team',
        leadId: 'staff-1',
      };

      const team = await teamService.createTeam(teamData);

      expect(team).toBeDefined();
      expect(team.name).toBe(teamData.name);
      expect(team.description).toBe(teamData.description);
      expect(team.leadId).toBe(teamData.leadId);
      expect(team.id).toBeDefined();
      expect(mockDatabase.data.teams).toHaveLength(1);
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should throw error for duplicate team name', async () => {
      const teamData = {
        name: 'Development Team',
        description: 'Main development team',
      };

      await teamService.createTeam(teamData);

      await expect(teamService.createTeam(teamData)).rejects.toThrow(
        'Team name already in use',
      );
    });

    it('should throw error for invalid team lead', async () => {
      const teamData = {
        name: 'Development Team',
        description: 'Main development team',
        leadId: 'invalid-staff-id',
      };

      await expect(teamService.createTeam(teamData)).rejects.toThrow(
        'Team lead not found',
      );
    });
  });

  describe('updateTeam', () => {
    it('should update team with valid data', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      const updateData = {
        id: team.id,
        name: 'Updated Development Team',
        description: 'Updated description',
        leadId: 'staff-1',
      };

      const updatedTeam = await teamService.updateTeam(updateData);

      expect(updatedTeam.name).toBe(updateData.name);
      expect(updatedTeam.description).toBe(updateData.description);
      expect(updatedTeam.leadId).toBe(updateData.leadId);
    });

    it('should throw error for non-existent team', async () => {
      const updateData = {
        id: 'non-existent-id',
        name: 'Updated Team',
      };

      await expect(teamService.updateTeam(updateData)).rejects.toThrow(
        'Team not found',
      );
    });
  });

  describe('addTeamMember', () => {
    it('should add staff member to team', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      const memberData = {
        teamId: team.id,
        staffId: 'staff-1',
        memberRole: 'Developer',
      };

      const teamMember = await teamService.addTeamMember(memberData);

      expect(teamMember).toBeDefined();
      expect(teamMember.teamId).toBe(memberData.teamId);
      expect(teamMember.staffId).toBe(memberData.staffId);
      expect(teamMember.memberRole).toBe(memberData.memberRole);
      expect(mockDatabase.data.teamMembers).toHaveLength(1);
    });

    it('should throw error for duplicate team membership', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      const memberData = {
        teamId: team.id,
        staffId: 'staff-1',
        memberRole: 'Developer',
      };

      await teamService.addTeamMember(memberData);

      await expect(teamService.addTeamMember(memberData)).rejects.toThrow(
        'Staff member is already a member of this team',
      );
    });

    it('should throw error for invalid staff member', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      const memberData = {
        teamId: team.id,
        staffId: 'invalid-staff-id',
        memberRole: 'Developer',
      };

      await expect(teamService.addTeamMember(memberData)).rejects.toThrow(
        'Staff member not found',
      );
    });
  });

  describe('deleteTeam', () => {
    it('should delete team without members', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      const result = await teamService.deleteTeam(team.id);

      expect(result).toBe(true);
      expect(mockDatabase.data.teams).toHaveLength(0);
    });

    it('should throw error when team has members', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
      });

      await teamService.addTeamMember({
        teamId: team.id,
        staffId: 'staff-1',
        memberRole: 'Developer',
      });

      await expect(teamService.deleteTeam(team.id)).rejects.toThrow(
        'Cannot delete team that has members',
      );
    });
  });

  describe('getTeamsWithStats', () => {
    it('should return teams with member counts and lead names', async () => {
      const team = await teamService.createTeam({
        name: 'Development Team',
        description: 'Main development team',
        leadId: 'staff-1',
      });

      await teamService.addTeamMember({
        teamId: team.id,
        staffId: 'staff-2',
        memberRole: 'Developer',
      });

      const teamsWithStats = teamService.getTeamsWithStats();

      expect(teamsWithStats).toHaveLength(1);
      expect(teamsWithStats[0].memberCount).toBe(1);
      expect(teamsWithStats[0].leadName).toBe('John Doe');
    });
  });
});