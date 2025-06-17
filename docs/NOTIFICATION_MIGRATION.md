# Notification System Migration Guide

## Overview

The application has been migrated from a legacy notification system to the unified `useNotifications` composable. This guide explains the changes and how to update existing code.

## What Changed

### Before (Legacy System)
```vue
<template>
  <!-- Legacy snackbar -->
  <v-snackbar v-model="snackbar" :color="snackbarColor">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script>
// Legacy notification function
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

function notify(message, success = true) {
  snackbarMessage.value = message
  snackbarColor.value = success ? 'success' : 'error'
  snackbar.value = true
}

// useAuth required notify parameter
const { login } = useAuth(notify)
</script>
```

### After (New System)
```vue
<template>
  <!-- Global notification system -->
  <NotificationContainer />
</template>

<script>
import { useNotifications } from './composables/useNotifications'

// Modern notification composable
const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotifications()

// Simplified useAuth (no notify parameter needed)
const { login } = useAuth()
</script>
```

## Migration Steps

### 1. Update useAuth Usage
**Before:**
```typescript
const { login } = useAuth(notify)
```

**After:**
```typescript
const { login } = useAuth()
```

### 2. Replace Manual Notifications
**Before:**
```typescript
notify('Operation successful')
notify('Operation failed', false)
```

**After:**
```typescript
const { notifySuccess, notifyError } = useNotifications()

notifySuccess('Operation successful')
notifyError('Operation failed')
```

### 3. Remove Legacy Notification Code
Remove these from your components:
- `snackbar` ref
- `snackbarMessage` ref
- `snackbarColor` ref
- `notify` function
- Legacy `<v-snackbar>` in template

### 4. Add NotificationContainer
Add this to your root component (App.vue):
```vue
<template>
  <!-- Your existing content -->
  
  <!-- Add this before closing </v-app> -->
  <NotificationContainer />
</v-app>
</template>

<script>
import NotificationContainer from './components/common/NotificationContainer.vue'
</script>
```

## Advanced Features

The new notification system provides additional features:

### Notification Types
```typescript
const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotifications()

notifySuccess('Operation completed')
notifyError('Something went wrong')
notifyWarning('Please review your input')
notifyInfo('New feature available')
```

### Advanced Notifications
```typescript
const { notify } = useNotifications()

// Persistent notification with action
notify({
  type: 'warning',
  title: 'Unsaved Changes',
  message: 'You have unsaved changes. Save before leaving?',
  persistent: true,
  actions: [
    {
      label: 'Save',
      action: () => saveChanges(),
      color: 'primary'
    },
    {
      label: 'Discard',
      action: () => discardChanges(),
      outlined: true
    }
  ]
})
```

### Undo Functionality
```typescript
const { notifyWithUndo } = useNotifications()

notifyWithUndo(
  'Item deleted',
  () => restoreItem(),
  { timeout: 5000 }
)
```

## Benefits

1. **Consistency**: All notifications use the same styling and behavior
2. **Features**: Access to advanced features like action buttons and persistence
3. **Maintainability**: Single notification system to maintain
4. **User Experience**: Better visual feedback and interaction patterns
5. **Developer Experience**: Simplified APIs and better TypeScript support

## Breaking Changes

- `useAuth()` no longer requires a notify parameter
- Legacy `notify()` function is no longer available
- Manual snackbar management is replaced by the global system

## Support

If you encounter issues during migration, please:
1. Check this guide for common patterns
2. Review the `useNotifications` composable documentation
3. Look at the App.vue implementation for examples
4. Create an issue if you need assistance
