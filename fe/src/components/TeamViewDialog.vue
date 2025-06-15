<template>
  <v-card width="500">
    <v-card-title>Team Details</v-card-title>
    <v-card-text>
      <v-row v-if="team">
        <v-col cols="12">
          <div class="text-h6 mb-2">{{ team.name }}</div>
          <v-chip prepend-icon="mdi-identifier" size="small" variant="tonal">
            ID: {{ team.id }}
          </v-chip>
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-1 mb-1">Description</div>
          <div v-if="team.description" class="text-body-2">
            {{ team.description }}
          </div>
          <div v-else class="text-caption text-medium-emphasis">
            No description provided
          </div>
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-1 mb-1">Team Lead</div>
          <div v-if="teamLeadName">
            <v-chip color="primary" prepend-icon="mdi-account-star" size="small" variant="tonal">
              {{ teamLeadName }}
            </v-chip>
          </div>
          <div v-else class="text-caption text-medium-emphasis">
            No team lead assigned
          </div>
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-1 mb-1">Team Members</div>
          <v-chip color="secondary" prepend-icon="mdi-account-group" size="small" variant="tonal">
            {{ memberCount }} {{ memberCount === 1 ? 'member' : 'members' }}
          </v-chip>
        </v-col>
      </v-row>
      <div v-else class="text-center text-medium-emphasis">
        No team selected
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { Team } from '../services/teams'

  /** Props */
  interface Props {
    team: Team | null
    teamLeadName?: string
    memberCount: number
  }

  defineProps<Props>()

  /** Emits */
  defineEmits<{
    close: []
  }>()
</script>
