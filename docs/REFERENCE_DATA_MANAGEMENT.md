# Reference Data Management System

## Overview

The Reference Data Management System provides a comprehensive interface for managing core reference data including Status, Priority, and Complexity entities. This system follows the same design patterns and architectural principles established in the User Management interface, ensuring consistency across the application.

## Features

### 1. Reference Data Overview
- **Three-Column Layout**: Displays Status, Priority, and Complexity in separate, side-by-side tables
- **Individual Search**: Each entity type has its own search functionality for quick filtering
- **Consistent UI**: Material Design components matching the application's theme
- **Real-time Updates**: Immediate reflection of changes across the interface

### 2. Status Management
- **Display**: Shows all status values in a sortable, filterable table
- **Search**: Real-time search across status names
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **CRUD Operations**: Create, edit, and delete status entries
- **Validation**: Ensures status names are unique and within length constraints

### 3. Priority Management
- **Display**: Shows all priority values in a sortable, filterable table
- **Search**: Real-time search across priority names
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **CRUD Operations**: Create, edit, and delete priority entries
- **Validation**: Ensures priority names are unique and within length constraints

### 4. Complexity Management
- **Display**: Shows all complexity values in a sortable, filterable table
- **Search**: Real-time search across complexity names
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **CRUD Operations**: Create, edit, and delete complexity entries
- **Validation**: Ensures complexity names are unique and within length constraints

## Navigation

The reference data management system is accessible via:
1. **Side Navigation**: Click "References" in the main navigation drawer
2. **Direct URL**: `/references` route
3. **Icon**: Reference data icon with "Manage reference data" subtitle

## Technical Implementation

### Frontend Components

#### Services
- **`/src/services/status.ts`**: GraphQL service layer for status operations
  - `getStatuses()`: Fetch all statuses
  - `getStatus(id)`: Fetch specific status
  - `createStatus(input)`: Create new status
  - `updateStatus(input)`: Update existing status
  - `deleteStatus(id)`: Delete status

- **`/src/services/priority.ts`**: GraphQL service layer for priority operations
  - `getPriorities()`: Fetch all priorities
  - `getPriority(id)`: Fetch specific priority
  - `createPriority(input)`: Create new priority
  - `updatePriority(input)`: Update existing priority
  - `deletePriority(id)`: Delete priority

- **`/src/services/complexity.ts`**: GraphQL service layer for complexity operations
  - `getComplexities()`: Fetch all complexities
  - `getComplexity(id)`: Fetch specific complexity
  - `createComplexity(input)`: Create new complexity
  - `updateComplexity(input)`: Update existing complexity
  - `deleteComplexity(id)`: Delete complexity

#### Dialog Components

**Status Dialogs:**
- **`/src/components/StatusCreateDialog.vue`**: Status creation form
- **`/src/components/StatusEditDialog.vue`**: Status editing form
- **`/src/components/StatusDeleteDialog.vue`**: Deletion confirmation

**Priority Dialogs:**
- **`/src/components/PriorityCreateDialog.vue`**: Priority creation form
- **`/src/components/PriorityEditDialog.vue`**: Priority editing form
- **`/src/components/PriorityDeleteDialog.vue`**: Deletion confirmation

**Complexity Dialogs:**
- **`/src/components/ComplexityCreateDialog.vue`**: Complexity creation form
- **`/src/components/ComplexityEditDialog.vue`**: Complexity editing form
- **`/src/components/ComplexityDeleteDialog.vue`**: Deletion confirmation

#### Pages
- **`/src/pages/references.vue`**: Main reference data management interface

### Backend Integration

The frontend integrates with existing backend services:

- **Status Service**: Uses `StatusService` for CRUD operations
- **Priority Service**: Uses `PriorityService` for CRUD operations  
- **Complexity Service**: Uses `ComplexityService` for CRUD operations

All operations are performed through GraphQL mutations and queries with proper authentication.

## User Interface

### Design Principles
- **Vuetify Material Design**: Consistent with application theme
- **Responsive Layout**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Clear error messages and validation feedback
- **Loading States**: Progress indicators during operations

### Color Coding
- **Primary Actions**: Blue (Create, Save, Update)
- **Destructive Actions**: Red (Delete)
- **Neutral Actions**: Gray (Cancel, Close)
- **Success**: Green (notifications)
- **Warnings**: Orange (confirmations)

### Icons
- **Create**: `mdi-plus`
- **Edit**: `mdi-pencil`
- **Delete**: `mdi-delete`
- **Search**: `mdi-magnify`
- **Status**: `mdi-flag`
- **Priority**: `mdi-priority-high`
- **Complexity**: `mdi-chart-bar`

## Data Validation

### Status Validation
- **Name Required**: Status name cannot be empty
- **Minimum Length**: Must be at least 2 characters
- **Maximum Length**: Must not exceed 50 characters
- **Uniqueness**: Status names must be unique across the system

### Priority Validation
- **Name Required**: Priority name cannot be empty
- **Minimum Length**: Must be at least 2 characters
- **Maximum Length**: Must not exceed 50 characters
- **Uniqueness**: Priority names must be unique across the system

### Complexity Validation
- **Name Required**: Complexity name cannot be empty
- **Minimum Length**: Must be at least 2 characters
- **Maximum Length**: Must not exceed 50 characters
- **Uniqueness**: Complexity names must be unique across the system

## Error Handling

### Common Error Scenarios
- **Authentication Errors**: Clear messaging when user session expires
- **Validation Errors**: Field-level validation with immediate feedback
- **Duplicate Names**: Specific error messages for name conflicts
- **Dependency Errors**: Clear warnings when deletion is blocked by task dependencies
- **Network Errors**: Graceful handling of connection issues

### Error Messages
- **Create Conflicts**: "Status/Priority/Complexity name already exists"
- **Not Found**: "Status/Priority/Complexity not found"
- **Dependency Violations**: "Cannot delete: it is being used by tasks"
- **Validation**: Field-specific validation messages

## Performance

### Optimization Features
- **Lazy Loading**: Efficient data loading on page initialization
- **Efficient Pagination**: Table pagination to handle large datasets
- **Debounced Search**: Optimized search filtering to reduce API calls
- **Minimal Re-renders**: Vue 3 reactivity for efficient updates

### Loading States
- **Table Loading**: Individual loading indicators for each table
- **Dialog Processing**: Progress overlays during form submissions
- **Button States**: Loading states during operations

## Testing

### Unit Tests
Comprehensive unit test coverage for all services:

**Status Service Tests** (`/tests/unit/services/status.test.ts`):
- Successful data fetching
- Error handling
- Create operations with validation
- Update operations with conflict detection
- Delete operations with dependency checking

**Priority Service Tests** (`/tests/unit/services/priority.test.ts`):
- Successful data fetching
- Error handling
- Create operations with validation
- Update operations with conflict detection
- Delete operations with dependency checking

**Complexity Service Tests** (`/tests/unit/services/complexity.test.ts`):
- Successful data fetching
- Error handling
- Create operations with validation
- Update operations with conflict detection
- Delete operations with dependency checking

### Test Coverage
- **27 Test Cases**: Comprehensive coverage of all CRUD operations
- **Error Scenarios**: Testing of all error conditions
- **GraphQL Integration**: Mocked GraphQL responses
- **Authentication**: Proper authentication token handling

## Security

### Authentication Requirements
- All operations require valid authentication tokens
- Session timeout handling with clear user feedback
- Secure GraphQL communication

### Data Protection
- Input validation to prevent malicious data
- Proper escaping of user-provided content
- Server-side validation enforcement

## Future Enhancements

### Planned Features
- **Bulk Operations**: Multi-select for batch updates/deletions
- **Import/Export**: CSV import/export functionality
- **Advanced Filtering**: Multiple filter criteria
- **Audit Trail**: Track changes to reference data
- **Custom Fields**: Extensible reference data structure

### Accessibility Improvements
- **Screen Reader Support**: Enhanced ARIA labeling
- **Keyboard Shortcuts**: Quick navigation and actions
- **High Contrast Support**: Improved theme support
- **Focus Management**: Better keyboard navigation flow

## Integration

### Task Management Integration
Reference data entities are used throughout the task management system:
- **Status**: Task workflow states
- **Priority**: Task importance levels
- **Complexity**: Task difficulty assessments

### Data Dependencies
- Tasks reference Status, Priority, and Complexity entities
- Deletion is prevented when entities are in use
- Updates are reflected across all dependent systems

## Troubleshooting

### Common Issues
1. **Load Failures**: Check network connectivity and authentication
2. **Save Errors**: Verify data validation requirements
3. **Delete Restrictions**: Check for task dependencies
4. **Search Not Working**: Clear browser cache and reload

### Debug Information
- Browser console logs for technical details
- Network tab for GraphQL request/response inspection
- Authentication token validation in browser storage

This reference data management system provides a robust, user-friendly interface for managing core system reference data while maintaining consistency with the overall application architecture and design patterns.