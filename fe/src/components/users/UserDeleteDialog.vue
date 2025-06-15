<template>
  <v-card width="400">
    <v-card-title class="text-h5">Confirm Deletion</v-card-title>
    <v-card-text>
      <v-icon class="mr-3" color="warning" size="large">mdi-alert-circle</v-icon>
      Are you sure you want to delete this user?
      <div class="mt-3 text-body-2">
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong>
        <br>
        <span class="text-medium-emphasis">{{ user?.email }}</span>
      </div>
      <v-alert class="mt-3" type="warning" variant="tonal">
        This action cannot be undone. The user will be permanently removed from the system.
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="error" @click="$emit('confirm')">Delete User</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { User } from '../../services/users'

  /** Define component props */
  defineProps<{
    /** User object to be deleted */
    user: User | null
  }>()

  /** Define component events */
  defineEmits<{
    /** Emitted when deletion is confirmed or cancelled */
    (e: 'confirm' | 'cancel'): void
  }>()
</script>
