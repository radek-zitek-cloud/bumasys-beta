/**
 * @fileoverview Team resolvers
 *
 * This module contains all GraphQL resolvers related to team management,
 * including queries, mutations, and field resolvers.
 */

import type { GraphQLContext } from '../types';
import logger from '../utils/logger';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../types';
import type {
  StaffService,
  TeamService,
} from '../services';

/**
 * Service instances - will be set during application initialization
 */
let staffService: StaffService;
let teamService: TeamService;

/**
 * Team query resolvers
 */
export const teamQueryResolvers = {
  /**
   * Get all teams (requires authentication)
   * @param _ - Parent object (unused)
   * @param __ - Query arguments (unused)
   * @param context - GraphQL context containing user info
   * @returns Array of all teams
   * @throws Error if user is not authenticated
   */
  teams: (_: unknown, __: unknown, { user }: GraphQLContext) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.getAllTeams();
  },

  /**
   * Get a specific team by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing team ID
   * @param context - GraphQL context containing user info
   * @returns Team object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  team: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.findById(id);
  },

  /**
   * Get all team members for a specific team (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing team ID
   * @param context - GraphQL context containing user info
   * @returns Array of team members
   * @throws Error if user is not authenticated
   */
  teamMembers: (
    _: unknown,
    { teamId }: { teamId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.getTeamMembers(teamId);
  },

  /**
   * Get a specific team member by ID (requires authentication)
   * @param _ - Parent object (unused)
   * @param args - Query arguments containing team member ID
   * @param context - GraphQL context containing user info
   * @returns TeamMember object if found, null otherwise
   * @throws Error if user is not authenticated
   */
  teamMember: (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.findTeamMemberById(id);
  },
};

/**
 * Team mutation resolvers
 */
export const teamMutationResolvers = {
  /**
   * Create a new team
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created team
   * @throws Error if user is not authenticated
   */
  createTeam: async (
    _: unknown,
    args: CreateTeamInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.createTeam(args);
  },

  /**
   * Update an existing team
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated team
   * @throws Error if user is not authenticated
   */
  updateTeam: async (
    _: unknown,
    args: UpdateTeamInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.updateTeam(args);
  },

  /**
   * Delete a team
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if deleted successfully
   * @throws Error if user is not authenticated
   */
  deleteTeam: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.deleteTeam(id);
  },

  /**
   * Add a team member
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team member data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the created team member
   * @throws Error if user is not authenticated
   */
  addTeamMember: async (
    _: unknown,
    args: CreateTeamMemberInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.addTeamMember(args);
  },

  /**
   * Update a team member
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team member update data
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to the updated team member
   * @throws Error if user is not authenticated
   */
  updateTeamMember: async (
    _: unknown,
    args: UpdateTeamMemberInput,
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.updateTeamMember(args);
  },

  /**
   * Remove a team member
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team member ID
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if removed successfully
   * @throws Error if user is not authenticated
   */
  removeTeamMember: async (
    _: unknown,
    { id }: { id: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.removeTeamMember(id);
  },

  /**
   * Remove staff from a team
   * @param _ - Parent object (unused)
   * @param args - Arguments containing team and staff IDs
   * @param context - GraphQL context containing user info
   * @returns Promise resolving to true if removed successfully
   * @throws Error if user is not authenticated
   */
  removeStaffFromTeam: async (
    _: unknown,
    { teamId, staffId }: { teamId: string; staffId: string },
    { user }: GraphQLContext,
  ) => {
    if (!user) {
      throw new Error('Unauthenticated');
    }
    return teamService.removeStaffFromTeam(teamId, staffId);
  },
};

/**
 * Team field resolvers for nested data
 */
export const teamFieldResolvers = {
  lead: (parent: { leadId?: string }) => {
    return parent.leadId ? staffService.findById(parent.leadId) : null;
  },
  members: (parent: { id: string }) => {
    return teamService.getTeamMembers(parent.id);
  },
};

/**
 * TeamMember field resolvers for nested data
 */
export const teamMemberFieldResolvers = {
  team: (parent: { teamId: string }) => {
    return teamService.findById(parent.teamId);
  },
  staff: (parent: { staffId: string }) => {
    return staffService.findById(parent.staffId);
  },
};

/**
 * Initialize team resolvers with service dependencies
 * @param services - Object containing service instances
 */
export function initializeTeamResolvers(services: {
  staff: StaffService;
  team: TeamService;
}): void {
  staffService = services.staff;
  teamService = services.team;
}
