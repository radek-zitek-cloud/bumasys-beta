/**
 * @fileoverview Teams service for frontend GraphQL operations
 *
 * This service provides all team-related API calls following the same
 * patterns as the users service. It handles team and team member CRUD operations
 * through GraphQL queries and mutations.
 */

import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** Team interface matching the backend schema */
export interface Team {
  id: string
  name: string
  description?: string
  leadId?: string
}

/** Team member interface matching the backend schema */
export interface TeamMember {
  id: string
  teamId: string
  staffId: string
  memberRole: string
}

/** Enhanced team interface with additional display information */
export interface TeamWithStats extends Team {
  memberCount: number
  leadName?: string
}

/** Enhanced team member interface with staff information */
export interface TeamMemberWithStaff extends TeamMember {
  staff: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

/** Interface for creating a new team */
export interface CreateTeamInput {
  name: string
  description?: string
  leadId?: string
}

/** Interface for updating an existing team */
export interface UpdateTeamInput {
  id: string
  name?: string
  description?: string
  leadId?: string
}

/** Interface for creating a new team member */
export interface CreateTeamMemberInput {
  teamId: string
  staffId: string
  memberRole: string
}

/** Interface for updating an existing team member */
export interface UpdateTeamMemberInput {
  id: string
  memberRole?: string
}

/**
 * Fetch all teams from the system.
 * Requires authentication.
 */
export function getTeams (): Promise<{ teams: Team[] }> {
  const store = useAuthStore()
  return graphqlClient<{ teams: Team[] }>(
    `
      query {
        teams {
          id
          name
          description
          leadId
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific team by ID.
 * Requires authentication.
 */
export function getTeam (id: string): Promise<{ team: Team | null }> {
  const store = useAuthStore()
  return graphqlClient<{ team: Team | null }>(
    `
      query($id: ID!) {
        team(id: $id) {
          id
          name
          description
          leadId
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Fetch all team members for a specific team.
 * Requires authentication.
 */
export function getTeamMembers (teamId: string): Promise<{ teamMembers: TeamMemberWithStaff[] }> {
  const store = useAuthStore()
  return graphqlClient<{ teamMembers: TeamMemberWithStaff[] }>(
    `
      query($teamId: ID!) {
        teamMembers(teamId: $teamId) {
          id
          teamId
          staffId
          memberRole
          staff {
            id
            firstName
            lastName
            email
            role
          }
        }
      }
    `,
    { teamId },
    store.token,
  )
}

/**
 * Create a new team.
 * Requires authentication.
 */
export function createTeam (input: CreateTeamInput): Promise<{ createTeam: Team }> {
  const store = useAuthStore()
  return graphqlClient<{ createTeam: Team }>(
    `
      mutation($name: String!, $description: String, $leadId: ID) {
        createTeam(name: $name, description: $description, leadId: $leadId) {
          id
          name
          description
          leadId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update an existing team.
 * Requires authentication.
 */
export function updateTeam (input: UpdateTeamInput): Promise<{ updateTeam: Team }> {
  const store = useAuthStore()
  return graphqlClient<{ updateTeam: Team }>(
    `
      mutation($id: ID!, $name: String, $description: String, $leadId: ID) {
        updateTeam(id: $id, name: $name, description: $description, leadId: $leadId) {
          id
          name
          description
          leadId
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Delete a team by ID.
 * Requires authentication.
 */
export function deleteTeam (id: string): Promise<{ deleteTeam: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ deleteTeam: boolean }>(
    `
      mutation($id: ID!) {
        deleteTeam(id: $id)
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Add a staff member to a team.
 * Requires authentication.
 */
export function addTeamMember (input: CreateTeamMemberInput): Promise<{ addTeamMember: TeamMember }> {
  const store = useAuthStore()
  return graphqlClient<{ addTeamMember: TeamMember }>(
    `
      mutation($teamId: ID!, $staffId: ID!, $memberRole: String!) {
        addTeamMember(teamId: $teamId, staffId: $staffId, memberRole: $memberRole) {
          id
          teamId
          staffId
          memberRole
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Update a team member's role.
 * Requires authentication.
 */
export function updateTeamMember (input: UpdateTeamMemberInput): Promise<{ updateTeamMember: TeamMember }> {
  const store = useAuthStore()
  return graphqlClient<{ updateTeamMember: TeamMember }>(
    `
      mutation($id: ID!, $memberRole: String) {
        updateTeamMember(id: $id, memberRole: $memberRole) {
          id
          teamId
          staffId
          memberRole
        }
      }
    `,
    { ...input },
    store.token,
  )
}

/**
 * Remove a team member by ID.
 * Requires authentication.
 */
export function removeTeamMember (id: string): Promise<{ removeTeamMember: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ removeTeamMember: boolean }>(
    `
      mutation($id: ID!) {
        removeTeamMember(id: $id)
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Remove a staff member from a team by team and staff ID.
 * Requires authentication.
 */
export function removeStaffFromTeam (teamId: string, staffId: string): Promise<{ removeStaffFromTeam: boolean }> {
  const store = useAuthStore()
  return graphqlClient<{ removeStaffFromTeam: boolean }>(
    `
      mutation($teamId: ID!, $staffId: ID!) {
        removeStaffFromTeam(teamId: $teamId, staffId: $staffId)
      }
    `,
    { teamId, staffId },
    store.token,
  )
}
