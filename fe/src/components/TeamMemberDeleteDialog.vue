<template>
  <v-card width="400">
    <v-card-title class="text-h5">Confirm Remove Member</v-card-title>
    <v-card-text>
      <v-alert
        color="warning"
        icon="mdi-alert-circle"
        prominent
        variant="tonal"
      >
        <div class="text-h6">Are you sure?</div>
        <div v-if="teamMember" class="mt-2">
          This will remove
          <strong>
            {{ teamMember.staff ? `${teamMember.staff.firstName} ${teamMember.staff.lastName}` : 'Unknown' }}
          </strong>
          from the team.
        </div>
        <div class="mt-2 text-body-2">
          Their role was: <strong>{{ teamMember?.memberRole || 'Unknown' }}</strong>
        </div>
        <div class="mt-2 text-body-2">
          This action cannot be undone, but they can be re-added to the team later.
        </div>
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="error" @click="$emit('confirm')">Remove Member</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { TeamMemberWithStaff } from '../services/teams'

  /** Props */
  interface Props {
    teamMember: TeamMemberWithStaff | null
  }

  defineProps<Props>()

  /** Emits */
  defineEmits<{
    cancel: []
    confirm: []
  }>()
</script>
