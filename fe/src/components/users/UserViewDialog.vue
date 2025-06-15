<template>
  <v-card width="500">
    <v-card-title>User Details</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Email"
            :model-value="user?.email"
            prepend-icon="mdi-email"
            readonly
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="First Name"
            :model-value="user?.firstName || 'Not specified'"
            prepend-icon="mdi-account"
            readonly
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Last Name"
            :model-value="user?.lastName || 'Not specified'"
            prepend-icon="mdi-account"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Note"
            :model-value="user?.note || 'No note'"
            prepend-icon="mdi-note-text"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="User ID"
            :model-value="user?.id"
            prepend-icon="mdi-identifier"
            readonly
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { User } from '../../services/users'

  /** Define component props */
  defineProps<{
    /** User object to display */
    user: User | null
  }>()

  /** Define component events */
  defineEmits<{
    /** Emitted when the dialog should be closed */
    (e: 'close'): void
  }>()
</script>
