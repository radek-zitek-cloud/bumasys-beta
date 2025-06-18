<!--
  @fileoverview Teams Management Page

  This page provides a comprehensive interface for managing teams and team members.
  It follows the design patterns established in the user management and organization
  management interfaces, providing CRUD operations for teams and team member assignments.
-->

<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-h4 mb-2">Teams Management</h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Manage teams and team member assignments
      </p>
    </div>

    <!-- Teams Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Teams ({{ filteredTeams.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openCreateDialog"
              >
                Create Team
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="teamSearch"
              clearable
              density="compact"
              hide-details
              label="Search teams..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            class="elevation-0"
            :headers="teamHeaders"
            item-key="id"
            :items="filteredTeams"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="teamsLoading"
            :search="teamSearch"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Description Column -->
            <template #item.description="{ item }">
              <span v-if="item.description" class="text-body-2">
                {{ item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">No description</span>
            </template>

            <!-- Team Lead Column -->
            <template #item.lead="{ item }">
              <div v-if="item.leadId">
                <v-chip
                  color="primary"
                  prepend-icon="mdi-account-star"
                  size="small"
                  variant="tonal"
                >
                  {{ getLeadName(item.leadId) || 'Unknown' }}
                </v-chip>
              </div>
              <span v-else class="text-caption text-medium-emphasis">No lead assigned</span>
            </template>

            <!-- Member Count Column -->
            <template #item.memberCount="{ item }">
              <v-chip
                color="secondary"
                prepend-icon="mdi-account-group"
                size="small"
                variant="tonal"
              >
                {{ getTeamMemberCount(item.id) }}
              </v-chip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="openViewDialog(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Team</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-account-multiple-outline"
                  size="small"
                  variant="text"
                  @click="openMembersDialog(item)"
                >
                  <v-icon>mdi-account-multiple-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Manage Members</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Team</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Team Members Table -->
    <v-row v-if="selectedTeamForMembers">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                Team Members for "{{ selectedTeamForMembers.name }}" ({{ filteredTeamMembers.length }})
              </span>
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-account-plus"
                  size="small"
                  @click="openAddMemberDialog"
                >
                  Add Member
                </v-btn>
                <v-btn
                  prepend-icon="mdi-close"
                  size="small"
                  variant="outlined"
                  @click="selectedTeamForMembers = null"
                >
                  Close
                </v-btn>
              </div>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="memberSearch"
              clearable
              density="compact"
              hide-details
              label="Search team members..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            class="elevation-0"
            :headers="memberHeaders"
            item-key="id"
            :items="filteredTeamMembers"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="membersLoading"
            :search="memberSearch"
          >
            <!-- Staff Member Column -->
            <template #item.staff="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.staff ? `${item.staff.firstName} ${item.staff.lastName}` : 'Unknown' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.staff ? item.staff.email : 'No email' }}
                </div>
              </div>
            </template>

            <!-- Role Column -->
            <template #item.memberRole="{ item }">
              <v-chip
                color="info"
                prepend-icon="mdi-briefcase"
                size="small"
                variant="tonal"
              >
                {{ item.memberRole }}
              </v-chip>
            </template>

            <!-- Staff Role Column -->
            <template #item.staffRole="{ item }">
              <span v-if="item.staff" class="text-body-2">{{ item.staff.role }}</span>
              <span v-else class="text-caption text-medium-emphasis">Unknown</span>
            </template>

            <!-- Member Actions Column -->
            <template #item.memberActions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openEditMemberDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Role</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-account-minus"
                  size="small"
                  variant="text"
                  @click="openRemoveMemberDialog(item)"
                >
                  <v-icon>mdi-account-minus</v-icon>
                  <v-tooltip activator="parent" location="top">Remove from Team</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Team Dialogs -->
    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <TeamCreateDialog
        :staff-members="staffMembers"
        @cancel="showCreateDialog = false"
        @submit="handleCreateTeam"
      />
    </v-dialog>

    <v-dialog v-model="showEditDialog" max-width="600" persistent>
      <TeamEditDialog
        :staff-members="staffMembers"
        :team="selectedTeam"
        @cancel="showEditDialog = false"
        @submit="handleUpdateTeam"
      />
    </v-dialog>

    <v-dialog v-model="showViewDialog" max-width="500" persistent>
      <TeamViewDialog
        :member-count="selectedTeam ? getTeamMemberCount(selectedTeam.id) : 0"
        :team="selectedTeam"
        :team-lead-name="selectedTeam ? getLeadName(selectedTeam.leadId) : undefined"
        @close="showViewDialog = false"
      />
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <TeamDeleteDialog
        :team="selectedTeam"
        @cancel="showDeleteDialog = false"
        @confirm="handleDeleteTeam"
      />
    </v-dialog>

    <!-- Team Member Dialogs -->
    <v-dialog v-model="showAddMemberDialog" max-width="500" persistent>
      <TeamMemberCreateDialog
        :available-staff="availableStaffForTeam"
        :team="selectedTeamForMembers"
        @cancel="showAddMemberDialog = false"
        @submit="handleAddTeamMember"
      />
    </v-dialog>

    <v-dialog v-model="showEditMemberDialog" max-width="500" persistent>
      <TeamMemberEditDialog
        :team-member="selectedTeamMember"
        @cancel="showEditMemberDialog = false"
        @submit="handleUpdateTeamMember"
      />
    </v-dialog>

    <v-dialog v-model="showRemoveMemberDialog" max-width="400" persistent>
      <TeamMemberDeleteDialog
        :team-member="selectedTeamMember"
        @cancel="showRemoveMemberDialog = false"
        @confirm="handleRemoveTeamMember"
      />
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay v-model="processing" class="d-flex align-center justify-center" persistent>
      <v-card class="pa-4">
        <v-progress-circular class="mr-3" indeterminate size="32" />
        Processing...
      </v-card>
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
  import type { VDataTable } from 'vuetify/components'
  import type { Staff } from '../services/staff'
  import type {
    CreateTeamInput,
    CreateTeamMemberInput,
    Team,
    TeamMemberWithStaff,
    UpdateTeamInput,
    UpdateTeamMemberInput,
  } from '../services/teams'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useLogger } from '../composables/useLogger'
  import { useNotifications } from '../composables/useNotifications'
  import * as staffService from '../services/staff'
  import * as teamService from '../services/teams'

  /** Data table configuration */
  type DataTableHeaders = VDataTable['$props']['headers']

  const teamHeaders: DataTableHeaders = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      title: 'Description',
      key: 'description',
      sortable: true,
    },
    {
      title: 'Team Lead',
      key: 'lead',
      sortable: false,
    },
    {
      title: 'Members',
      key: 'memberCount',
      sortable: false,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '200px',
    },
  ]

  const memberHeaders: DataTableHeaders = [
    {
      title: 'Staff Member',
      key: 'staff',
      sortable: true,
    },
    {
      title: 'Team Role',
      key: 'memberRole',
      sortable: true,
    },
    {
      title: 'Staff Role',
      key: 'staffRole',
      sortable: true,
    },
    {
      title: 'Actions',
      key: 'memberActions',
      sortable: false,
      width: '120px',
    },
  ]

  /** Reactive data */
  const teams = ref<Team[]>([])
  const teamMembers = ref<TeamMemberWithStaff[]>([])
  const staffMembers = ref<Staff[]>([])
  const selectedTeam = ref<Team | null>(null)
  const selectedTeamMember = ref<TeamMemberWithStaff | null>(null)
  const selectedTeamForMembers = ref<Team | null>(null)
  const teamSearch = ref('')
  const memberSearch = ref('')
  const teamsLoading = ref(false)
  const membersLoading = ref(false)
  const processing = ref(false)
  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  /** Dialog visibility flags */
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)
  const showViewDialog = ref(false)
  const showDeleteDialog = ref(false)
  const showAddMemberDialog = ref(false)
  const showEditMemberDialog = ref(false)
  const showRemoveMemberDialog = ref(false)

  // Notifications
  const { notifySuccess, notifyError } = useNotifications()
  const { logError } = useLogger()

  /** Computed filtered teams for the table */
  const filteredTeams = computed(() => {
    if (!teamSearch.value) return teams.value

    const searchTerm = teamSearch.value.toLowerCase()
    return teams.value.filter(team =>
      team.name.toLowerCase().includes(searchTerm)
      || team.description?.toLowerCase().includes(searchTerm)
      || getLeadName(team.leadId)?.toLowerCase().includes(searchTerm),
    )
  })

  /** Computed filtered team members for the table */
  const filteredTeamMembers = computed(() => {
    if (!memberSearch.value) return teamMembers.value

    const searchTerm = memberSearch.value.toLowerCase()
    return teamMembers.value.filter(member =>
      member.memberRole.toLowerCase().includes(searchTerm)
      || member.staff?.firstName?.toLowerCase().includes(searchTerm)
      || member.staff?.lastName?.toLowerCase().includes(searchTerm)
      || member.staff?.email?.toLowerCase().includes(searchTerm)
      || member.staff?.role?.toLowerCase().includes(searchTerm),
    )
  })

  /** Computed available staff for team assignment */
  const availableStaffForTeam = computed(() => {
    if (!selectedTeamForMembers.value) return staffMembers.value

    const teamMemberStaffIds = new Set(teamMembers.value.map(member => member.staffId))
    return staffMembers.value.filter(staff => !teamMemberStaffIds.has(staff.id))
  })

  /** Helper function to get team lead name */
  function getLeadName (leadId?: string): string | undefined {
    if (!leadId) return undefined
    const lead = staffMembers.value.find(staff => staff.id === leadId)
    return lead ? `${lead.firstName} ${lead.lastName}` : undefined
  }

  /** Helper function to get team member count */
  function getTeamMemberCount (teamId: string): number {
    return teamMembers.value.filter(member => member.teamId === teamId).length
  }

  /** Load teams from the API */
  async function loadTeams () {
    try {
      teamsLoading.value = true
      const response = await teamService.getTeams()
      teams.value = response.teams
    } catch (error) {
      logError('Failed to load teams:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to load teams',
      )
    } finally {
      teamsLoading.value = false
    }
  }

  /** Load all team members */
  async function loadAllTeamMembers () {
    try {
      membersLoading.value = true
      // For simplicity, we'll load members for all teams
      // In a real implementation, this might be optimized
      const memberPromises = teams.value.map(team =>
        teamService.getTeamMembers(team.id).then(response => response.teamMembers),
      )
      const allMembersArrays = await Promise.all(memberPromises)
      teamMembers.value = allMembersArrays.flat()
    } catch (error) {
      logError('Failed to load team members:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to load team members',
      )
    } finally {
      membersLoading.value = false
    }
  }

  /** Load team members for a specific team */
  async function loadTeamMembers (teamId: string) {
    try {
      membersLoading.value = true
      const response = await teamService.getTeamMembers(teamId)
      teamMembers.value = response.teamMembers
    } catch (error) {
      logError('Failed to load team members:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to load team members',
      )
    } finally {
      membersLoading.value = false
    }
  }

  /** Load staff members */
  async function loadStaffMembers () {
    try {
      const response = await staffService.getStaff()
      staffMembers.value = response.staff
    } catch (error) {
      logError('Failed to load staff members:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to load staff members',
      )
    }
  }

  /** Open create team dialog */
  function openCreateDialog () {
    showCreateDialog.value = true
  }

  /** Open view team dialog */
  function openViewDialog (team: Team) {
    selectedTeam.value = team
    showViewDialog.value = true
  }

  /** Open edit team dialog */
  function openEditDialog (team: Team) {
    selectedTeam.value = team
    showEditDialog.value = true
  }

  /** Open delete confirmation dialog */
  function openDeleteDialog (team: Team) {
    selectedTeam.value = team
    showDeleteDialog.value = true
  }

  /** Open team members management */
  function openMembersDialog (team: Team) {
    selectedTeamForMembers.value = team
    loadTeamMembers(team.id)
  }

  /** Open add member dialog */
  function openAddMemberDialog () {
    showAddMemberDialog.value = true
  }

  /** Open edit member dialog */
  function openEditMemberDialog (member: TeamMemberWithStaff) {
    selectedTeamMember.value = member
    showEditMemberDialog.value = true
  }

  /** Open remove member dialog */
  function openRemoveMemberDialog (member: TeamMemberWithStaff) {
    selectedTeamMember.value = member
    showRemoveMemberDialog.value = true
  }

  /** Handle team creation */
  async function handleCreateTeam (teamData: CreateTeamInput) {
    try {
      processing.value = true
      await teamService.createTeam(teamData)
      notifySuccess('Team created successfully')
      showCreateDialog.value = false
      await loadTeams()
      await loadAllTeamMembers()
    } catch (error) {
      logError('Failed to create team:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to create team',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle team update */
  async function handleUpdateTeam (teamData: UpdateTeamInput) {
    try {
      processing.value = true
      await teamService.updateTeam(teamData)
      notifySuccess('Team updated successfully')
      showEditDialog.value = false
      await loadTeams()
      await loadAllTeamMembers()
    } catch (error) {
      logError('Failed to update team:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update team',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle team deletion */
  async function handleDeleteTeam () {
    if (!selectedTeam.value) return

    try {
      processing.value = true
      await teamService.deleteTeam(selectedTeam.value.id)
      notifySuccess('Team deleted successfully')
      showDeleteDialog.value = false
      await loadTeams()
      await loadAllTeamMembers()
      // Close members view if this team was selected
      if (selectedTeamForMembers.value?.id === selectedTeam.value.id) {
        selectedTeamForMembers.value = null
      }
    } catch (error) {
      logError('Failed to delete team:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to delete team',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle adding team member */
  async function handleAddTeamMember (memberData: CreateTeamMemberInput) {
    try {
      processing.value = true
      await teamService.addTeamMember(memberData)
      notifySuccess('Team member added successfully')
      showAddMemberDialog.value = false
      if (selectedTeamForMembers.value) {
        await loadTeamMembers(selectedTeamForMembers.value.id)
      }
    } catch (error) {
      logError('Failed to add team member:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to add team member',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle updating team member */
  async function handleUpdateTeamMember (memberData: UpdateTeamMemberInput) {
    try {
      processing.value = true
      await teamService.updateTeamMember(memberData)
      notifySuccess('Team member updated successfully')
      showEditMemberDialog.value = false
      if (selectedTeamForMembers.value) {
        await loadTeamMembers(selectedTeamForMembers.value.id)
      }
    } catch (error) {
      logError('Failed to update team member:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to update team member',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle removing team member */
  async function handleRemoveTeamMember () {
    if (!selectedTeamMember.value) return

    try {
      processing.value = true
      await teamService.removeTeamMember(selectedTeamMember.value.id)
      notifySuccess('Team member removed successfully')
      showRemoveMemberDialog.value = false
      if (selectedTeamForMembers.value) {
        await loadTeamMembers(selectedTeamForMembers.value.id)
      }
    } catch (error) {
      logError('Failed to remove team member:', error)
      notifyError(
        error instanceof Error ? error.message : 'Failed to remove team member',
      )
    } finally {
      processing.value = false
    }
  }

  /** Initialize component */
  onMounted(() => {
    Promise.all([
      loadTeams(),
      loadStaffMembers(),
    ]).then(() => {
      loadAllTeamMembers()
    })
  })
</script>
