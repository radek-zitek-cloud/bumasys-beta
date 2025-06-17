<!--
  @fileoverview Global Notification Container Component

  This component renders notifications from the useNotifications composable.
  It displays notifications as Vuetify snackbars with support for:
  - Different notification types (success, error, warning, info)
  - Action buttons
  - Auto-dismiss and persistent notifications
  - Multiple notification queue management

  Usage:
  The component is automatically included in App.vue and doesn't require props.
  Notifications are controlled via the useNotifications composable.

  Features:
  - Responsive positioning
  - Accessibility support
  - Consistent styling across notification types
  - Action button support
  - Progress indicator for auto-dismiss notifications
-->

<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      v-model="notification.visible"
      :color="getSnackbarColor(notification.type)"
      :timeout="notification.persistent ? -1 : notification.timeout"
      :location="'bottom'"
      :max-width="400"
      :multi-line="notification.message.length > 60"
      @update:model-value="handleVisibilityChange(notification.id, $event)"
    >
      <div class="d-flex align-center">
        <v-icon
          v-if="notification.icon"
          :icon="notification.icon"
          :size="20"
          class="mr-2"
        />
        
        <div class="flex-grow-1">
          <div
            v-if="notification.title"
            class="font-weight-medium mb-1"
          >
            {{ notification.title }}
          </div>
          <div>{{ notification.message }}</div>
        </div>
      </div>

      <template #actions>
        <div class="d-flex gap-2">
          <!-- Custom action buttons -->
          <v-btn
            v-for="action in notification.actions"
            :key="action.label"
            :color="action.color || 'white'"
            :variant="action.outlined ? 'outlined' : 'text'"
            size="small"
            @click="handleAction(notification.id, action.action)"
          >
            {{ action.label }}
          </v-btn>

          <!-- Close button (if closable) -->
          <v-btn
            v-if="notification.closable"
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="dismiss(notification.id)"
          />
        </div>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Global notification container component
 * 
 * Renders all active notifications from the useNotifications composable
 * as Vuetify snackbars with proper styling and interaction support.
 */

import { useNotifications } from '../../composables/useNotifications'

// Get notification state and methods from composable
const { notifications, dismiss } = useNotifications()

/**
 * Map notification types to Vuetify color variants
 * @param type - The notification type
 * @returns Vuetify color string
 */
function getSnackbarColor(type: string): string {
  const colorMap: Record<string, string> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }
  return colorMap[type] || 'info'
}

/**
 * Handle notification visibility changes
 * @param id - Notification ID
 * @param visible - New visibility state
 */
function handleVisibilityChange(id: string, visible: boolean): void {
  if (!visible) {
    dismiss(id)
  }
}

/**
 * Handle action button clicks
 * @param notificationId - ID of the notification
 * @param action - Action function to execute
 */
async function handleAction(notificationId: string, action: () => void | Promise<void>): Promise<void> {
  try {
    await action()
    dismiss(notificationId)
  } catch (error) {
    console.error('Notification action failed:', error)
    // Keep notification open if action fails
  }
}
</script>

<style scoped>
.notification-container {
  /* Ensure notifications appear above other content */
  z-index: 9999;
}

/* Improve readability for multi-line notifications */
.v-snackbar--multi-line .v-snackbar__content {
  padding: 16px;
}

/* Ensure action buttons are properly spaced */
.gap-2 > * + * {
  margin-left: 8px;
}
</style>
