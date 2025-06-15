<template>
  <v-card width="500">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Team Member Role</v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-if="teamMember" cols="12">
            <div class="text-subtitle-1 mb-2">
              Editing role for:
              <strong>
                {{ teamMember.staff ? `${teamMember.staff.firstName} ${teamMember.staff.lastName}` : 'Unknown' }}
              </strong>
            </div>
            <div class="text-caption text-medium-emphasis mb-4">
              {{ teamMember.staff?.email || 'No email' }}
            </div>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.memberRole"
              label="Role in Team *"
              placeholder="e.g., Developer, Designer, Manager"
              prepend-icon="mdi-briefcase"
              required
              :rules="roleRules"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update Role</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { TeamMemberWithStaff, UpdateTeamMemberInput } from '../services/teams'
  import { computed, reactive, watch } from 'vue'

  /** Props */
  interface Props {
    teamMember: TeamMemberWithStaff | null
  }

  const props = defineProps<Props>()

  /** Emits */
  const emit = defineEmits<{
    cancel: []
    submit: [memberData: UpdateTeamMemberInput]
  }>()

  /** Reactive form data */
  const form = reactive<Omit<UpdateTeamMemberInput, 'id'>>({
    memberRole: '',
  })

  /** Validation rules */
  const roleRules = [
    (v: string) => !!v || 'Role is required',
    (v: string) => (v && v.length >= 2) || 'Role must be at least 2 characters',
    (v: string) => (v && v.length <= 50) || 'Role must be less than 50 characters',
  ]

  /** Computed form validity */
  const isFormValid = computed(() => {
    return form.memberRole
      && form.memberRole.length >= 2
      && form.memberRole.length <= 50
      && props.teamMember
  })

  /** Watch for team member changes to populate form */
  watch(() => props.teamMember, newTeamMember => {
    if (newTeamMember) {
      form.memberRole = newTeamMember.memberRole
    }
  }, { immediate: true })

  /** Handle form submission */
  function onSubmit () {
    if (isFormValid.value && props.teamMember) {
      const submitData: UpdateTeamMemberInput = {
        id: props.teamMember.id,
        memberRole: form.memberRole,
      }
      emit('submit', submitData)
    }
  }
</script>
