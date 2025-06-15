<template>
  <v-card width="400">
    <v-card-title class="text-h5">Confirm Delete</v-card-title>
    <v-card-text>
      <v-alert
        color="warning"
        icon="mdi-alert-circle"
        prominent
        variant="tonal"
      >
        <div class="text-h6">Are you sure?</div>
        <div class="mt-2">
          This will permanently delete the team
          <strong>"{{ team?.name || 'Unknown' }}"</strong>.
        </div>
        <div class="mt-2 text-body-2">
          This action cannot be undone. The team must have no members before it can be deleted.
        </div>
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="error" @click="$emit('confirm')">Delete Team</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { Team } from '../services/teams'

  /** Props */
  interface Props {
    team: Team | null
  }

  defineProps<Props>()

  /** Emits */
  defineEmits<{
    cancel: []
    confirm: []
  }>()
</script>
