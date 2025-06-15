<template>
  <v-card width="500">
    <form @submit.prevent="onSubmit">
      <v-card-title>Add Team Member</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-1 mb-2">
              Adding member to team: <strong>{{ team?.name || 'Unknown' }}</strong>
            </div>
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="form.staffId"
              item-title="displayName"
              item-value="id"
              :items="staffItems"
              label="Staff Member *"
              prepend-icon="mdi-account"
              required
              :rules="staffRules"
            />
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
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Add Member</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { Staff } from '../services/staff'
  import type { CreateTeamMemberInput, Team } from '../services/teams'
  import { computed, reactive } from 'vue'

  /** Props */
  interface Props {
    team: Team | null
    availableStaff: Staff[]
  }

  const props = defineProps<Props>()

  /** Emits */
  const emit = defineEmits<{
    cancel: []
    submit: [memberData: CreateTeamMemberInput]
  }>()

  /** Reactive form data */
  const form = reactive<Omit<CreateTeamMemberInput, 'teamId'>>({
    staffId: '',
    memberRole: '',
  })

  /** Computed staff items for dropdown */
  const staffItems = computed(() => {
    return props.availableStaff.map(staff => ({
      id: staff.id,
      displayName: `${staff.firstName} ${staff.lastName} (${staff.role})`,
    }))
  })

  /** Validation rules */
  const staffRules = [
    (v: string) => !!v || 'Staff member is required',
  ]

  const roleRules = [
    (v: string) => !!v || 'Role is required',
    (v: string) => (v && v.length >= 2) || 'Role must be at least 2 characters',
    (v: string) => (v && v.length <= 50) || 'Role must be less than 50 characters',
  ]

  /** Computed form validity */
  const isFormValid = computed(() => {
    return form.staffId
      && form.memberRole
      && form.memberRole.length >= 2
      && form.memberRole.length <= 50
      && props.team
  })

  /** Handle form submission */
  function onSubmit () {
    if (isFormValid.value && props.team) {
      const submitData: CreateTeamMemberInput = {
        teamId: props.team.id,
        staffId: form.staffId,
        memberRole: form.memberRole,
      }
      emit('submit', submitData)
    }
  }
</script>
