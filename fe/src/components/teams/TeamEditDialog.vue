<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Team</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Team Name *"
              prepend-icon="mdi-account-group"
              required
              :rules="nameRules"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              prepend-icon="mdi-text"
              rows="3"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.leadId"
              clearable
              item-title="displayName"
              item-value="id"
              :items="staffItems"
              label="Team Lead"
              prepend-icon="mdi-account-star"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update Team</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { Staff } from '../../services/staff'
  import type { Team, UpdateTeamInput } from '../../services/teams'
  import { computed, reactive, watch } from 'vue'

  /** Props */
  interface Props {
    team: Team | null
    staffMembers: Staff[]
  }

  const props = defineProps<Props>()

  /** Emits */
  const emit = defineEmits<{
    cancel: []
    submit: [teamData: UpdateTeamInput]
  }>()

  /** Reactive form data */
  const form = reactive<Omit<UpdateTeamInput, 'id'>>({
    name: '',
    description: '',
    leadId: undefined,
  })

  /** Computed staff items for dropdown */
  const staffItems = computed(() => {
    return props.staffMembers.map(staff => ({
      id: staff.id,
      displayName: `${staff.firstName} ${staff.lastName} (${staff.role})`,
    }))
  })

  /** Validation rules */
  const nameRules = [
    (v: string) => !!v || 'Team name is required',
    (v: string) => (v && v.length >= 2) || 'Team name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Team name must be less than 100 characters',
  ]

  /** Computed form validity */
  const isFormValid = computed(() => {
    return form.name
      && form.name.length >= 2
      && form.name.length <= 100
  })

  /** Watch for team changes to populate form */
  watch(() => props.team, newTeam => {
    if (newTeam) {
      form.name = newTeam.name
      form.description = newTeam.description || ''
      form.leadId = newTeam.leadId || undefined
    }
  }, { immediate: true })

  /** Handle form submission */
  function onSubmit () {
    if (isFormValid.value && props.team) {
      const submitData: UpdateTeamInput = {
        id: props.team.id,
        name: form.name,
        description: form.description || undefined,
        leadId: form.leadId || undefined,
      }
      emit('submit', submitData)
    }
  }
</script>
