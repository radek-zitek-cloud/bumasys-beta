<!--
  @fileoverview Organization Dialogs Component

  Wraps all organization-related dialogs to reduce template complexity
  in the main people management page.
-->

<template>
  <!-- Organization Create Dialog -->
  <v-dialog
    v-model="showCreateDialog"
    max-width="600"
    persistent
  >
    <OrganizationCreateDialog
      @cancel="closeCreateDialog"
      @created="$emit('created', $event)"
    />
  </v-dialog>

  <!-- Organization Edit Dialog -->
  <v-dialog
    v-model="showEditDialog"
    max-width="600"
    persistent
  >
    <OrganizationEditDialog
      v-if="organizationManagement.selectedOrganization.value"
      :organization="organizationManagement.selectedOrganization.value"
      @cancel="closeEditDialog"
      @updated="$emit('updated', $event)"
    />
  </v-dialog>

  <!-- Organization View Dialog -->
  <v-dialog
    v-model="showViewDialog"
    max-width="600"
    persistent
  >
    <OrganizationViewDialog
      v-if="organizationManagement.selectedOrganization.value"
      :organization="organizationManagement.selectedOrganization.value"
      @close="closeViewDialog"
    />
  </v-dialog>

  <!-- Organization Delete Dialog -->
  <v-dialog
    v-model="showDeleteDialog"
    max-width="500"
    persistent
  >
    <OrganizationDeleteDialog
      v-if="organizationManagement.selectedOrganization.value"
      :organization="organizationManagement.selectedOrganization.value"
      @cancel="closeDeleteDialog"
      @deleted="$emit('deleted', $event)"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CreateOrganizationInput, UpdateOrganizationInput } from '../../services/organizations'
import OrganizationCreateDialog from './OrganizationCreateDialog.vue'
import OrganizationDeleteDialog from './OrganizationDeleteDialog.vue'
import OrganizationEditDialog from './OrganizationEditDialog.vue'
import OrganizationViewDialog from './OrganizationViewDialog.vue'

/**
 * Component props
 */
interface Props {
  organizationManagement: ReturnType<typeof import('../../composables/organization/useOrganizationManagement').useOrganizationManagement>
}

/**
 * Component events
 */
interface Emits {
  (e: 'created', data: CreateOrganizationInput): void
  (e: 'updated', data: UpdateOrganizationInput): void
  (e: 'deleted', id: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Computed properties for dialog visibility
const showCreateDialog = computed({
  get: () => props.organizationManagement.showOrganizationCreateDialog.value,
  set: (value: boolean) => {
    props.organizationManagement.showOrganizationCreateDialog.value = value
  }
})

const showEditDialog = computed({
  get: () => props.organizationManagement.showOrganizationEditDialog.value,
  set: (value: boolean) => {
    props.organizationManagement.showOrganizationEditDialog.value = value
  }
})

const showViewDialog = computed({
  get: () => props.organizationManagement.showOrganizationViewDialog.value,
  set: (value: boolean) => {
    props.organizationManagement.showOrganizationViewDialog.value = value
  }
})

const showDeleteDialog = computed({
  get: () => props.organizationManagement.showOrganizationDeleteDialog.value,
  set: (value: boolean) => {
    props.organizationManagement.showOrganizationDeleteDialog.value = value
  }
})

// Methods for closing dialogs
function closeCreateDialog() {
  showCreateDialog.value = false
}

function closeEditDialog() {
  showEditDialog.value = false
}

function closeViewDialog() {
  showViewDialog.value = false
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
}
</script>
