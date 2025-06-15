/**
 * @fileoverview Team service module
 *
 * This module contains all business logic related to team management,
 * including team creation, updates, deletion, and team membership operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Database,
  Team,
  TeamMember,
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../types';

/**
 * Service class for team management operations
 */
export class TeamService {
  private db: Database;

  /**
   * Initialize the team service with a database instance
   * @param database - The database instance to use for operations
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Find a team by ID
   * @param id - Team ID to search for
   * @returns Team object if found, undefined otherwise
   */
  public findById(id: string): Team | undefined {
    return this.db.data.teams.find((team) => team.id === id);
  }

  /**
   * Find a team by name
   * @param name - Team name to search for
   * @returns Team object if found, undefined otherwise
   */
  public findByName(name: string): Team | undefined {
    return this.db.data.teams.find((team) => team.name === name);
  }

  /**
   * Get all teams
   * @returns Array of all team objects
   */
  public getAllTeams(): Team[] {
    return this.db.data.teams;
  }

  /**
   * Get teams led by a specific staff member
   * @param leadId - Staff ID of the team lead
   * @returns Array of teams led by the staff member
   */
  public getTeamsByLead(leadId: string): Team[] {
    return this.db.data.teams.filter((team) => team.leadId === leadId);
  }

  /**
   * Create a new team with the provided information
   * @param teamData - Team creation data
   * @returns Promise resolving to the created team object
   * @throws Error if team name is already in use or validation fails
   */
  public async createTeam(teamData: CreateTeamInput): Promise<Team> {
    // Check if team name is already in use
    const existingTeam = this.findByName(teamData.name);
    if (existingTeam) {
      throw new Error('Team name already in use');
    }

    // Validate team lead if provided
    if (teamData.leadId) {
      const lead = this.db.data.staff.find(
        (staff) => staff.id === teamData.leadId,
      );
      if (!lead) {
        throw new Error('Team lead not found');
      }
    }

    // Create new team object
    const newTeam: Team = {
      id: uuidv4(),
      name: teamData.name,
      description: teamData.description,
      leadId: teamData.leadId,
    };

    // Add to database
    this.db.data.teams.push(newTeam);
    await this.db.write();

    return newTeam;
  }

  /**
   * Update an existing team's information
   * @param updateData - Team update data including ID
   * @returns Promise resolving to the updated team object
   * @throws Error if team is not found or validation fails
   */
  public async updateTeam(updateData: UpdateTeamInput): Promise<Team> {
    const team = this.findById(updateData.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check for name conflicts if name is being updated
    if (updateData.name !== undefined && updateData.name !== team.name) {
      const existingTeam = this.findByName(updateData.name);
      if (existingTeam) {
        throw new Error('Team name already in use');
      }
    }

    // Update fields if provided
    if (updateData.name !== undefined) {
      team.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      team.description = updateData.description;
    }
    if (updateData.leadId !== undefined) {
      // Validate team lead if provided
      if (updateData.leadId) {
        const lead = this.db.data.staff.find(
          (staff) => staff.id === updateData.leadId,
        );
        if (!lead) {
          throw new Error('Team lead not found');
        }
      }
      team.leadId = updateData.leadId;
    }

    // Save changes
    await this.db.write();

    return team;
  }

  /**
   * Delete a team by ID
   * @param id - ID of the team to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if team has members
   */
  public async deleteTeam(id: string): Promise<boolean> {
    const index = this.db.data.teams.findIndex((team) => team.id === id);
    if (index === -1) {
      return false;
    }

    // Check for team members
    const hasMembers = this.db.data.teamMembers.some(
      (member) => member.teamId === id,
    );
    if (hasMembers) {
      throw new Error('Cannot delete team that has members');
    }

    // Remove team from array
    this.db.data.teams.splice(index, 1);
    await this.db.write();

    return true;
  }

  // Team Member Operations

  /**
   * Find a team member by ID
   * @param id - Team member ID to search for
   * @returns TeamMember object if found, undefined otherwise
   */
  public findTeamMemberById(id: string): TeamMember | undefined {
    return this.db.data.teamMembers.find((member) => member.id === id);
  }

  /**
   * Find team member by team and staff ID
   * @param teamId - Team ID
   * @param staffId - Staff ID
   * @returns TeamMember object if found, undefined otherwise
   */
  public findTeamMemberByTeamAndStaff(
    teamId: string,
    staffId: string,
  ): TeamMember | undefined {
    return this.db.data.teamMembers.find(
      (member) => member.teamId === teamId && member.staffId === staffId,
    );
  }

  /**
   * Get all team members for a specific team
   * @param teamId - Team ID to get members for
   * @returns Array of team member objects
   */
  public getTeamMembers(teamId: string): TeamMember[] {
    return this.db.data.teamMembers.filter(
      (member) => member.teamId === teamId,
    );
  }

  /**
   * Get all teams a staff member belongs to
   * @param staffId - Staff ID to get teams for
   * @returns Array of team member objects
   */
  public getStaffTeams(staffId: string): TeamMember[] {
    return this.db.data.teamMembers.filter(
      (member) => member.staffId === staffId,
    );
  }

  /**
   * Add a staff member to a team
   * @param memberData - Team member creation data
   * @returns Promise resolving to the created team member object
   * @throws Error if validation fails or member already exists
   */
  public async addTeamMember(
    memberData: CreateTeamMemberInput,
  ): Promise<TeamMember> {
    // Validate team exists
    const team = this.findById(memberData.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validate staff exists
    const staff = this.db.data.staff.find(
      (s) => s.id === memberData.staffId,
    );
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Check if member already exists (unique constraint)
    const existingMember = this.findTeamMemberByTeamAndStaff(
      memberData.teamId,
      memberData.staffId,
    );
    if (existingMember) {
      throw new Error('Staff member is already a member of this team');
    }

    // Create new team member object
    const newTeamMember: TeamMember = {
      id: uuidv4(),
      teamId: memberData.teamId,
      staffId: memberData.staffId,
      memberRole: memberData.memberRole,
    };

    // Add to database
    this.db.data.teamMembers.push(newTeamMember);
    await this.db.write();

    return newTeamMember;
  }

  /**
   * Update a team member's information
   * @param updateData - Team member update data including ID
   * @returns Promise resolving to the updated team member object
   * @throws Error if team member is not found
   */
  public async updateTeamMember(
    updateData: UpdateTeamMemberInput,
  ): Promise<TeamMember> {
    const teamMember = this.findTeamMemberById(updateData.id);
    if (!teamMember) {
      throw new Error('Team member not found');
    }

    // Update fields if provided
    if (updateData.memberRole !== undefined) {
      teamMember.memberRole = updateData.memberRole;
    }

    // Save changes
    await this.db.write();

    return teamMember;
  }

  /**
   * Remove a team member by ID
   * @param id - ID of the team member to remove
   * @returns Promise resolving to true if removed, false if not found
   */
  public async removeTeamMember(id: string): Promise<boolean> {
    const index = this.db.data.teamMembers.findIndex(
      (member) => member.id === id,
    );
    if (index === -1) {
      return false;
    }

    // Remove team member from array
    this.db.data.teamMembers.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Remove a staff member from a team by team and staff ID
   * @param teamId - Team ID
   * @param staffId - Staff ID
   * @returns Promise resolving to true if removed, false if not found
   */
  public async removeStaffFromTeam(
    teamId: string,
    staffId: string,
  ): Promise<boolean> {
    const index = this.db.data.teamMembers.findIndex(
      (member) => member.teamId === teamId && member.staffId === staffId,
    );
    if (index === -1) {
      return false;
    }

    // Remove team member from array
    this.db.data.teamMembers.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Get teams with their member counts and lead information
   * @returns Array of teams with additional statistics
   */
  public getTeamsWithStats(): Array<
    Team & { memberCount: number; leadName?: string }
  > {
    return this.db.data.teams.map((team) => {
      const memberCount = this.getTeamMembers(team.id).length;
      let leadName: string | undefined;

      if (team.leadId) {
        const lead = this.db.data.staff.find(
          (staff) => staff.id === team.leadId,
        );
        leadName = lead ? `${lead.firstName} ${lead.lastName}` : undefined;
      }

      return {
        ...team,
        memberCount,
        leadName,
      };
    });
  }
}