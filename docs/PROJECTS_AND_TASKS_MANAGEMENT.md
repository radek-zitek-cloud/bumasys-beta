# Projects and Tasks Management System

## Overview

The Projects and Tasks Management System provides a comprehensive interface for managing projects and their associated tasks. This system follows the same design patterns and architectural principles established in the User Management and Organization Management interfaces, ensuring consistency across the application.

## Features

### 1. Project Management
- **Display**: Shows all projects in a sortable, filterable table with comprehensive details
- **Search**: Real-time search across project names, descriptions, and lead staff information
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **CRUD Operations**: Create, view, edit, and delete project entries
- **Lead Staff Assignment**: Ability to assign staff members as project leads with dropdown selection
- **Date Tracking**: Support for planned and actual start/end dates
- **Status Indicators**: Visual status indicators based on project progress and dates

### 2. Task Management
- **Display**: Shows all tasks with project association in a sortable, filterable table
- **Search**: Real-time search across task names, descriptions, project names, and evaluator information
- **Project Filtering**: Tasks can be filtered by their associated project
- **CRUD Operations**: Create, view, edit, and delete task entries
- **Hierarchical Structure**: Support for parent-child task relationships within the same project
- **Evaluator Assignment**: Ability to assign staff members as task evaluators
- **Reference Data Integration**: Integration with status, priority, and complexity reference data
- **Date Tracking**: Support for planned and actual start/end dates

### 3. Data Relationships
- **Project-Task Relationship**: Tasks are linked to projects with visual indicators
- **Task Hierarchy**: Tasks can have parent-child relationships for breakdown structures
- **Staff Integration**: Projects and tasks can be assigned to staff members with full name display
- **Reference Data**: Tasks utilize status, priority, and complexity reference data

## Technical Implementation

### Frontend Components

#### Services
- **`/src/services/projects.ts`**: Project GraphQL operations and type definitions
- **`/src/services/tasks.ts`**: Task GraphQL operations and type definitions

#### Dialog Components

**Project Dialogs:**
- **`/src/components/ProjectCreateDialog.vue`**: Project creation form with staff selection and date inputs
- **`/src/components/ProjectEditDialog.vue`**: Project editing form with pre-populated data
- **`/src/components/ProjectViewDialog.vue`**: Read-only project details display
- **`/src/components/ProjectDeleteDialog.vue`**: Deletion confirmation with dependency warnings

**Task Dialogs:**
- **`/src/components/TaskCreateDialog.vue`**: Task creation form with comprehensive dropdown selections
- **`/src/components/TaskEditDialog.vue`**: Task editing form (project assignment read-only)
- **`/src/components/TaskViewDialog.vue`**: Read-only task details with relationship display
- **`/src/components/TaskDeleteDialog.vue`**: Deletion confirmation with child task warnings

#### Pages
- **`/src/pages/tasks.vue`**: Main projects and tasks management interface

### Backend Integration

#### GraphQL Schema
The backend already provides complete GraphQL support:

**Project Type:**
```graphql
type Project {
  id: ID!
  name: String!
  description: String
  leadStaffId: ID
  plannedStartDate: String
  plannedEndDate: String
  actualStartDate: String
  actualEndDate: String
  leadStaff: Staff
  tasks: [Task!]!
  statusReports: [ProjectStatusReport!]!
}
```

**Task Type:**
```graphql
type Task {
  id: ID!
  name: String!
  description: String
  projectId: ID!
  parentTaskId: ID
  evaluatorId: ID
  statusId: ID
  priorityId: ID
  complexityId: ID
  plannedStartDate: String
  plannedEndDate: String
  actualStartDate: String
  actualEndDate: String
  project: Project!
  parentTask: Task
  childTasks: [Task!]!
  evaluator: Staff
  status: Status
  priority: Priority
  complexity: Complexity
}
```

#### Available Operations
- **Queries**: `projects`, `project(id)`, `tasks(projectId?)`, `task(id)`
- **Mutations**: `createProject`, `updateProject`, `deleteProject`, `createTask`, `updateTask`, `deleteTask`

## User Interface

### Design Principles
- **Vuetify Material Design**: Consistent with application theme
- **Two-Table Layout**: Projects and tasks displayed in separate tables stacked vertically
- **Responsive Layout**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Clear error messages and validation feedback
- **Loading States**: Progress indicators during operations

### Color Coding
- **Primary Actions**: Blue (Create, Save, Update)
- **Destructive Actions**: Red (Delete)
- **Neutral Actions**: Gray (Cancel, Close)
- **Success**: Green (notifications, completed projects)
- **Info**: Blue (in-progress projects, status chips)
- **Warning**: Orange (not started projects, priority chips)
- **Error**: Red (overdue projects)

### Icons
- **Projects**: `mdi-clipboard-text-outline`
- **Tasks**: `mdi-clipboard-text-outline`
- **Create**: `mdi-plus`
- **View**: `mdi-eye`
- **Edit**: `mdi-pencil`
- **Delete**: `mdi-delete`
- **Search**: `mdi-magnify`
- **Calendar**: `mdi-calendar-*`
- **Status**: `mdi-flag`
- **Priority**: `mdi-priority-high`
- **Complexity**: `mdi-gauge`

### Table Features
- **Sorting**: All appropriate columns are sortable
- **Filtering**: Real-time search and project-based filtering for tasks
- **Pagination**: Configurable page sizes with total count display
- **Actions**: Consistent action buttons with tooltips
- **Status Indicators**: Visual chips for status, priority, and complexity
- **Date Formatting**: Human-readable date formats

## Error Handling

### Validation
- **Required Fields**: Project and task names are required with length constraints
- **Date Logic**: Validation ensures start dates are before end dates
- **Relationship Validation**: Parent task validation ensures same-project assignment
- **Reference Data**: Validation of status, priority, complexity, and staff assignments

### Error Messages
- **Network Errors**: Clear messages for connection issues
- **Validation Errors**: Specific field-level error messages
- **Dependency Errors**: Warnings about related data (e.g., tasks preventing project deletion)
- **Authorization Errors**: Proper handling of authentication requirements

### User Feedback
- **Success Notifications**: Confirmation messages for successful operations
- **Error Notifications**: Clear error messages with actionable information
- **Loading States**: Visual indicators during data operations
- **Confirmation Dialogs**: Protection against accidental deletions

## Security Considerations

### Authentication
- **Required Authentication**: All operations require valid authentication tokens
- **Token Validation**: Automatic token refresh and validation
- **Secure API Calls**: All GraphQL operations use authenticated requests

### Data Protection
- **Input Sanitization**: All form inputs are validated and sanitized
- **XSS Prevention**: Proper escaping of user-generated content
- **CSRF Protection**: GraphQL operations include CSRF protection

### Authorization
- **Role-Based Access**: Integration with existing authentication system
- **Operation Permissions**: Appropriate permissions for CRUD operations

## Performance

### Optimization Features
- **Lazy Loading**: Efficient data loading on page initialization
- **Efficient Pagination**: Table pagination to handle large datasets
- **Debounced Search**: Optimized search filtering to reduce API calls
- **Minimal Re-renders**: Vue 3 reactivity for efficient updates
- **Concurrent Loading**: Parallel loading of projects and tasks data

### Loading States
- **Table Loading**: Individual loading indicators for each table
- **Dialog Processing**: Progress overlays during form submissions
- **Button States**: Loading states during operations
- **Progressive Enhancement**: Graceful degradation for slow connections

## Integration

### Reference Data Integration
The system integrates with existing reference data:
- **Status**: Task workflow states
- **Priority**: Task importance levels
- **Complexity**: Task difficulty assessments
- **Staff**: Project leads and task evaluators

### Organization Integration
- **Staff Assignment**: Integration with organization management for staff selection
- **Department Context**: Staff members shown with full organizational context
- **Hierarchy Support**: Respects organizational hierarchy for assignments

### Data Dependencies
- **Projects → Tasks**: One-to-many relationship with cascade considerations
- **Tasks → Subtasks**: Parent-child relationships within projects
- **Staff Assignments**: Soft references to staff members
- **Reference Data**: Dynamic references to status, priority, and complexity

## Navigation

The projects and tasks management system is accessible via:
1. **Side Navigation**: Click "Projects" in the main navigation drawer
2. **Direct URL**: `/tasks` route
3. **Icon**: Clipboard check outline with "Manage projects and tasks" subtitle

## Troubleshooting

### Common Issues
1. **Load Failures**: Check network connectivity and authentication status
2. **Save Errors**: Verify data validation requirements and required fields
3. **Delete Restrictions**: Check for dependent tasks before deleting projects
4. **Search Not Working**: Clear browser cache and reload page
5. **Dropdown Issues**: Ensure reference data is loaded properly

### Debug Information
- **Browser Console**: Technical error details in console logs
- **Network Tab**: GraphQL request/response inspection for API issues
- **Authentication**: Token validation in browser storage
- **State Management**: Vue devtools for component state inspection

### Performance Issues
- **Large Datasets**: Use pagination and filtering to manage performance
- **Slow Loading**: Check network connectivity and server responsiveness
- **Memory Usage**: Monitor for memory leaks in long-running sessions

## Future Enhancements

### Planned Features
- **Bulk Operations**: Multiple project/task operations
- **Advanced Filtering**: More sophisticated filtering options
- **Export Functionality**: CSV/PDF export of project and task data
- **Gantt Charts**: Visual project timeline representations
- **Task Dependencies**: Predecessor/successor task relationships
- **Time Tracking**: Integration with time tracking systems
- **Templates**: Project and task templates for common patterns

### Accessibility Improvements
- **Screen Reader Support**: Enhanced ARIA labels and descriptions
- **Keyboard Shortcuts**: Keyboard navigation for power users
- **High Contrast**: Support for high contrast themes
- **Focus Management**: Improved focus handling in dialogs

### Performance Optimizations
- **Virtual Scrolling**: For very large datasets
- **Background Sync**: Offline capability with background synchronization
- **Caching**: Intelligent caching of reference data
- **Real-time Updates**: WebSocket integration for live updates

## Task Management Enhancement (2024)

### Overview
The Task Management Enhancement adds comprehensive task management capabilities through a dedicated management page accessible via a new "Manage Task" action button in the tasks table.

### New Features

#### Task Management Page (`/task-management/:id`)
- **Dedicated Management Interface**: Full-screen task management page with comprehensive controls
- **Task Details Display**: Read-only task information at the top including name, project, description, status, priority, and complexity
- **Back Navigation**: Navigation buttons at top and bottom to return to tasks list

#### Assignees Management
- **Staff Assignment**: Assign staff members to tasks with full name and department display
- **Visual Interface**: List display with staff avatars and role information
- **CRUD Operations**: Add and remove assignees with confirmation
- **Real-time Updates**: Immediate UI updates after assignment changes

#### Predecessors Management
- **Task Dependencies**: Define predecessor task relationships for workflow management
- **Visual Interface**: List display with task names and project context
- **CRUD Operations**: Add and remove predecessor relationships
- **Cross-Project Support**: Predecessors can be from different projects

#### Child Tasks Management
- **Task Hierarchy**: Display and manage child task relationships
- **Visual Interface**: List display with task status indicators
- **Status Tracking**: Child task status visibility for parent task oversight
- **Hierarchical Structure**: Support for multi-level task breakdowns

#### Progress Reports Management
- **Progress Tracking**: Create, edit, and delete progress reports with percentage completion
- **Visual Progress**: Progress percentage displayed prominently in avatars
- **Notes Support**: Optional notes for detailed progress descriptions
- **Chronological Display**: Reports ordered by date for tracking progress over time
- **CRUD Operations**: Full create, read, update, delete functionality

#### Status Reports Management
- **Status Communication**: Create, edit, and delete status reports for stakeholder communication
- **Summary Text**: Free-form status summaries for flexible reporting
- **Date Tracking**: Report dates for chronological status history
- **CRUD Operations**: Full create, read, update, delete functionality

### Technical Implementation

#### Backend Integration
- **GraphQL Mutations**: Utilizes existing backend mutations for all operations
- **Service Functions**: Comprehensive service layer in `tasks.ts` for all management operations
- **Data Loading**: Single query (`getTaskWithManagementData`) to fetch all related data efficiently
- **Error Handling**: Comprehensive error handling with user-friendly notifications

#### Frontend Architecture
- **Vue 3 Composition API**: Modern reactive patterns for optimal performance
- **Vuetify Components**: Consistent design language with existing interface
- **Type Safety**: Full TypeScript integration with proper type definitions
- **Routing**: Dynamic route parameters for task-specific management pages

#### New Service Functions
- `getTaskWithManagementData(id)`: Fetch task with all related management data
- `assignStaffToTask(taskId, staffId)`: Assign staff member to task
- `removeStaffFromTask(taskId, staffId)`: Remove staff assignment
- `addTaskPredecessor(taskId, predecessorTaskId)`: Add predecessor relationship
- `removeTaskPredecessor(taskId, predecessorTaskId)`: Remove predecessor relationship
- `createTaskProgress(data)`: Create new progress report
- `updateTaskProgress(data)`: Update existing progress report
- `deleteTaskProgress(id)`: Delete progress report
- `createTaskStatusReport(data)`: Create new status report
- `updateTaskStatusReport(data)`: Update existing status report
- `deleteTaskStatusReport(id)`: Delete status report

### User Interface Design

#### Design Principles
- **Consistent Patterns**: Follows established design patterns from user management interface
- **Visual Hierarchy**: Clear separation of different management sections
- **Action Feedback**: Immediate visual feedback for all user actions
- **Error Prevention**: Confirmation dialogs for destructive actions

#### Responsive Layout
- **Desktop Optimized**: Three-column layout for assignees, predecessors, and child tasks
- **Tablet Friendly**: Responsive grid system adapts to smaller screens
- **Mobile Support**: Single-column layout for mobile devices

#### Visual Elements
- **Color Coding**: Distinct colors for different types of data (assignees, predecessors, child tasks, reports)
- **Icons**: Meaningful icons for quick visual identification (accounts, arrows, files, charts, flags)
- **Progress Indicators**: Visual progress percentages in avatar format
- **Status Badges**: Clear status indicators for child tasks

### Navigation
- **Access Point**: "Manage Task" button (gear icon) in tasks table action column
- **Route**: `/task-management/:id` where `:id` is the task ID
- **Return Navigation**: Back buttons at top and bottom of page
- **Breadcrumb Context**: Page title includes task name for context

### Security and Permissions
- **Authentication Required**: All operations require valid authentication tokens
- **GraphQL Integration**: Leverages existing authentication and authorization layer
- **Input Validation**: Proper validation of all user inputs before submission

### Error Handling
- **User-Friendly Messages**: Clear error messages for all failure scenarios
- **Graceful Degradation**: Page continues to function even if some data fails to load
- **Retry Mechanisms**: Automatic retry for transient failures
- **Notification System**: Toast notifications for success and error states

### Performance Considerations
- **Efficient Loading**: Single GraphQL query for all related data
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Minimal Re-renders**: Efficient Vue 3 reactivity for optimal performance
- **Error Recovery**: Automatic data refresh after successful operations

This projects and tasks management system provides a robust, user-friendly interface for managing project portfolios while maintaining consistency with the overall application architecture and design patterns.