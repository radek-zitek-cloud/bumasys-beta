<!--
  @fileoverview Status deletion confirmation dialog component

  This component provides a confirmation dialog for deleting status entries.
  It follows the design patterns used in the user management interface.
-->

<template>
  <v-card width="400">
    <v-card-title class="text-h5">Confirm Deletion</v-card-title>
    <v-card-text>
      <v-icon class="mr-3" color="warning" size="large">mdi-alert-circle</v-icon>
      Are you sure you want to delete this status?
      <div class="mt-3 text-body-2">
        <strong>{{ status?.name }}</strong>
      </div>
      <v-alert class="mt-3" type="warning" variant="tonal">
        This action cannot be undone. The status will be permanently removed from the system.
        Any tasks using this status may be affected.
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="error" @click="$emit('confirm')">Delete Status</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { Status } from '../../services/status'

  /** Define component props */
  defineProps<{
    /** Status object to be deleted */
    status: Status | null
  }>()

  /** Define component events */
  defineEmits<{
    /** Emitted when deletion is confirmed or cancelled */
    (e: 'confirm' | 'cancel'): void
  }>()
</script>
