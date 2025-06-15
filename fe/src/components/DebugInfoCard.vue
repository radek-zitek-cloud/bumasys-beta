<!--
  @fileoverview Debug Information Dialog Component

  This component displays debug information about the current authentication state.
  Intended for development and troubleshooting purposes. Shows user details,
  tokens, and login status in a read-only format.

  Usage:
  ```vue
  <DebugInfoCard @close="handleClose" />
  ```

  Features:
  - Displays current user information
  - Shows authentication tokens (for debugging)
  - Read-only interface for security
  - Responsive layout compatible with mobile devices

  Security Note:
  This component displays sensitive authentication tokens and should only be
  accessible to authenticated users in development environments.
-->

<template>
  <v-card width="600">
    <v-card-title>Debug Information</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Login Status"
            :model-value="auth.loggedIn ? 'Logged In' : 'Not Logged In'"
            prepend-icon="mdi-account-check"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="User ID"
            :model-value="auth.user?.id || 'Not available'"
            prepend-icon="mdi-identifier"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Email"
            :model-value="auth.user?.email || 'Not available'"
            prepend-icon="mdi-email"
            readonly
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="First Name"
            :model-value="auth.user?.firstName || 'Not specified'"
            prepend-icon="mdi-account"
            readonly
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="Last Name"
            :model-value="auth.user?.lastName || 'Not specified'"
            prepend-icon="mdi-account"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Note"
            :model-value="auth.user?.note || 'No note'"
            prepend-icon="mdi-note-text"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Access Token"
            :model-value="auth.token || 'Not available'"
            prepend-icon="mdi-key"
            readonly
            rows="3"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Refresh Token"
            :model-value="auth.refreshToken || 'Not available'"
            prepend-icon="mdi-key-variant"
            readonly
            rows="3"
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
/**
 * @fileoverview Debug Info Card Script
 *
 * This script handles the debug information display functionality.
 * It provides access to the authentication store for displaying current
 * user state and authentication tokens.
 */

  import { useAuthStore } from '../stores/auth'

  /**
   * Authentication store to access debug information.
   * Provides access to current user data, tokens, and login status.
   */
  const auth = useAuthStore()

  /**
   * Define component events.
   * @event close - Emitted when the dialog should be closed
   */
  defineEmits<{
    /** Emitted when the dialog should be closed */
    (e: 'close'): void
  }>()
</script>
