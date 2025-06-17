<!--
  @fileoverview Staff Dialogs Component

  Wraps all staff-related dialogs to reduce template complexity
  in the main people management page.
-->

<template>
  <!-- Staff Create Dialog -->
  <v-dialog
    v-model="staffManagement.showStaffCreateDialog.value"
    max-width="700"
    persistent
  >
    <StaffCreateDialog
      :departments="departments"
      :organizations="organizations"
      :staff="staff"
      @cancel="staffManagement.showStaffCreateDialog.value = false"
      @created="$emit('created', $event)"
    />
  </v-dialog>

  <!-- Staff Edit Dialog -->
  <v-dialog
    v-model="staffManagement.showStaffEditDialog.value"
    max-width="700"
    persistent
  >
    <StaffEditDialog
      v-if="staffManagement.selectedStaff.value"
      :all-staff="staff"
      :departments="departments"
      :organizations="organizations"
      :staff="staffManagement.selectedStaff.value"
      @cancel="staffManagement.showStaffEditDialog.value = false"
      @updated="$emit('updated', $event)"
    />
  </v-dialog>

  <!-- Staff View Dialog -->
  <v-dialog
    v-model="staffManagement.showStaffViewDialog.value"
    max-width="600"
    persistent
  >
    <StaffViewDialog
      v-if="staffManagement.selectedStaff.value"
      :all-staff="staff"
      :departments="departments"
      :organizations="organizations"
      :staff="staffManagement.selectedStaff.value"
      @close="staffManagement.showStaffViewDialog.value = false"
    />
  </v-dialog>

  <!-- Staff Delete Dialog -->
  <v-dialog
    v-model="staffManagement.showStaffDeleteDialog.value"
    max-width="500"
    persistent
  >
    <StaffDeleteDialog
      v-if="staffManagement.selectedStaff.value"
      :staff="staffManagement.selectedStaff.value"
      @cancel="staffManagement.showStaffDeleteDialog.value = false"
      @deleted="$emit('deleted', $event)"
    />
  </v-dialog>

  <!-- Staff Tree Dialog -->
  <v-dialog
    v-model="staffManagement.showStaffTreeDialog.value"
    persistent
  >
    <StaffTreeDialog
      v-if="staffManagement.selectedStaff.value"
      :staff="staffManagement.selectedStaff.value"
      @close="staffManagement.showStaffTreeDialog.value = false"
    />
  </v-dialog>

  <!-- Create User from Staff Dialog -->
  <v-dialog
    v-model="staffManagement.showCreateUserFromStaffDialog.value"
    max-width="600"
    persistent
  >
    <CreateUserFromStaffDialog
      v-if="staffManagement.userCreationData.value"
      :initial-data="staffManagement.userCreationData.value"
      :staff-member="staffManagement.selectedStaff.value"
      @cancel="staffManagement.showCreateUserFromStaffDialog.value = false"
      @created="$emit('user-created', $event)"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
  import type { Department } from '../../services/departments'
  import type { Organization } from '../../services/organizations'
  import type { CreateStaffInput, Staff, UpdateStaffInput } from '../../services/staff'
  import type { CreateUserInput } from '../../services/users'
  import StaffCreateDialog from '../organization/StaffCreateDialog.vue'
  import StaffDeleteDialog from '../organization/StaffDeleteDialog.vue'
  import StaffEditDialog from '../organization/StaffEditDialog.vue'
  import StaffTreeDialog from '../organization/StaffTreeDialog.vue'
  import StaffViewDialog from '../organization/StaffViewDialog.vue'
  import CreateUserFromStaffDialog from '../users/CreateUserFromStaffDialog.vue'

  /**
   * Component props
   */
  interface Props {
    staffManagement: ReturnType<typeof import('../../composables/staff/useStaffManagement').useStaffManagement>
    departments: Department[]
    organizations: Organization[]
    staff: Staff[]
  }

  /**
   * Component events
   */
  interface Emits {
    (e: 'created', data: CreateStaffInput): void
    (e: 'updated', data: UpdateStaffInput): void
    (e: 'deleted', id: string): void
    (e: 'user-created', data: CreateUserInput): void
  }

  defineProps<Props>()
  defineEmits<Emits>()
</script>
