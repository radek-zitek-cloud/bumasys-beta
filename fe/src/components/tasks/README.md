# Task Management Components

This directory contains Vue components for comprehensive task management operations. These dialogs provide CRUD functionality for various task-related entities.

## Components

### 📋 Task Assignment Management

#### `TaskAssigneeCreateDialog.vue`
- **Purpose**: Add staff members as assignees to tasks
- **Features**: 
  - Dropdown selection of available staff members
  - Automatic filtering to exclude current assignees
  - Displays staff role and department information
  - Form validation for required staff selection
- **Props**: `availableStaff`, `currentAssignees`
- **Events**: `cancel`, `created(staffId)`

### 🔗 Task Dependency Management

#### `TaskPredecessorCreateDialog.vue`
- **Purpose**: Add predecessor relationships between tasks
- **Features**:
  - Dropdown selection of available tasks from any project
  - Automatic filtering to prevent circular dependencies
  - Visual info about predecessor functionality
  - Cross-project predecessor support
- **Props**: `availableTasks`, `currentPredecessors`, `currentTaskId`
- **Events**: `cancel`, `created(predecessorTaskId)`

### 👶 Child Task Management

#### `TaskChildCreateDialog.vue`
- **Purpose**: Create new child tasks with parent relationship
- **Features**:
  - Full task creation form (name, description, dates, etc.)
  - Pre-filled parent task and project relationships
  - Optional status, priority, and complexity selection
  - Date pickers for planned start/end dates
  - Informational alert about parent relationship
- **Props**: `parentTaskId`, `projectId`, `availableStatuses`, `availablePriorities`, `availableComplexities`
- **Events**: `cancel`, `created(taskData)`

### 📊 Progress Reporting

#### `TaskProgressCreateDialog.vue`
- **Purpose**: Create new progress reports for tasks
- **Features**:
  - Date picker with default to current date
  - Progress percentage input with slider visualization
  - Color-coded progress chips (red < 25%, yellow < 50%, blue < 75%, green < 100%, purple = 100%)
  - Optional notes field for detailed progress descriptions
  - Visual progress slider for immediate feedback
- **Props**: `taskId`
- **Events**: `cancel`, `created(progressData)`

#### `TaskProgressEditDialog.vue`
- **Purpose**: Edit existing progress reports
- **Features**:
  - Pre-populated form with existing report data
  - Same UI features as create dialog
  - Date format conversion for form compatibility
- **Props**: `progressReport`
- **Events**: `cancel`, `updated(progressData)`

### 📝 Status Reporting

#### `TaskStatusReportCreateDialog.vue`
- **Purpose**: Create status reports for stakeholder communication
- **Features**:
  - Date picker with default to current date
  - Large text area for status summary
  - Informational guidance on status report content
  - Form validation for required fields
- **Props**: `taskId`
- **Events**: `cancel`, `created(statusData)`

#### `TaskStatusReportEditDialog.vue`
- **Purpose**: Edit existing status reports
- **Features**:
  - Pre-populated form with existing report data
  - Same UI features as create dialog
  - Date format conversion for form compatibility
- **Props**: `statusReport`
- **Events**: `cancel`, `updated(statusData)`

## Design Patterns

### Consistent UI/UX
- All dialogs use Vuetify Material Design components
- Consistent color scheme and iconography
- Standard form validation with user-friendly error messages
- Loading states during form submission
- Responsive design for mobile and desktop

### Form Validation
- Required field validation with visual indicators
- Custom validation rules for business logic
- Real-time validation feedback
- Proper error message display

### Event Architecture
- Clean separation between UI and business logic
- Parent component handles all API calls
- Dialogs emit events with processed data
- Consistent event naming convention

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Integration Example

```vue
<template>
  <!-- Dialog trigger -->
  <v-btn @click="showAssigneeDialog = true">Add Assignee</v-btn>
  
  <!-- Dialog component -->
  <v-dialog v-model="showAssigneeDialog" max-width="500" persistent>
    <TaskAssigneeCreateDialog
      :available-staff="staff"
      :current-assignees="task.assignees"
      @cancel="showAssigneeDialog = false"
      @created="handleAssigneeCreated"
    />
  </v-dialog>
</template>

<script setup>
async function handleAssigneeCreated(staffId) {
  try {
    await assignStaffToTask(taskId, staffId)
    showNotification('Assignee added successfully')
    showAssigneeDialog.value = false
    await refreshTaskData()
  } catch (error) {
    showNotification('Failed to add assignee', 'error')
  }
}
</script>
```

## Testing

Each component includes comprehensive unit tests covering:
- Component rendering and props
- Form validation logic
- Event emission
- User interaction scenarios
- Error handling

Run tests with: `npm test -- tests/unit/components/Task*.test.ts`

## Dependencies

- **Vue 3**: Composition API and reactive features
- **Vuetify 3**: Material Design component library
- **Vue Router**: Navigation and route parameters
- **TypeScript**: Type safety and interface definitions

## Service Integration

These components integrate with the following services:
- `tasks.ts`: Task CRUD operations and relationship management
- `staff.ts`: Staff member data for assignee selection
- `status.ts`, `priority.ts`, `complexity.ts`: Reference data for task creation