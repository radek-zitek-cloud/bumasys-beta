# Organization Management System

## Overview

The Organization Management System provides a comprehensive interface for managing organizations, departments, and staff members within the Fulcrum application. This system follows the same design patterns and architectural principles established in the User Management and Reference Data interfaces, ensuring consistency across the application.

## Features

### 1. Organization Management
- **Display**: Shows all organizations in a sortable, filterable table
- **Search**: Real-time search across organization names and descriptions
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **CRUD Operations**: Create, view, edit, and delete organization entries
- **Validation**: Ensures organization names are unique and within length constraints
- **Hierarchical Support**: Optional root department and staff assignment

### 2. Department Management
- **Display**: Shows all departments with organization association in a sortable, filterable table
- **Search**: Real-time search across department names, descriptions, and organization names
- **Organization Filtering**: Departments are linked to their parent organizations
- **CRUD Operations**: Create, edit, and delete department entries
- **Hierarchical Structure**: Support for parent-child department relationships
- **Manager Assignment**: Ability to assign staff members as department managers

### 3. Staff Management
- **Display**: Shows all staff members with full contact and organizational details
- **Search**: Real-time search across names, emails, roles, and organizational associations
- **Multi-level Organization**: Staff members are linked to both organizations and departments
- **CRUD Operations**: Create, edit, and delete staff member entries
- **Supervisor Relationships**: Support for reporting relationships between staff members
- **Contact Information**: Full name, email, phone, and role tracking

## Technical Implementation

### Frontend Components

#### Services
- **`/src/services/organizations.ts`**: Organization GraphQL operations
- **`/src/services/departments.ts`**: Department GraphQL operations  
- **`/src/services/staff.ts`**: Staff GraphQL operations

#### Dialog Components

**Organization Dialogs:**
- **`/src/components/OrganizationCreateDialog.vue`**: Organization creation form
- **`/src/components/OrganizationEditDialog.vue`**: Organization editing form
- **`/src/components/OrganizationViewDialog.vue`**: Read-only organization details
- **`/src/components/OrganizationDeleteDialog.vue`**: Deletion confirmation

**Department Dialogs:**
- **`/src/components/DepartmentCreateDialog.vue`**: Department creation form
- **`/src/components/DepartmentEditDialog.vue`**: Department editing form
- **`/src/components/DepartmentDeleteDialog.vue`**: Deletion confirmation

**Staff Dialogs:**
- **`/src/components/StaffCreateDialog.vue`**: Staff creation form
- **`/src/components/StaffEditDialog.vue`**: Staff editing form
- **`/src/components/StaffDeleteDialog.vue`**: Deletion confirmation

#### Pages
- **`/src/pages/people.vue`**: Main organization management interface

### Backend Integration

The frontend integrates with existing backend services:

#### GraphQL Operations
- **Queries**: `organizations`, `departments`, `staff`, `organization`, `department`, `staffMember`
- **Mutations**: `createOrganization`, `updateOrganization`, `deleteOrganization`, `createDepartment`, `updateDepartment`, `deleteDepartment`, `createStaff`, `updateStaff`, `deleteStaff`

#### Business Logic
- **OrganizationService**: Handles organization CRUD and validation
- **DepartmentService**: Manages department hierarchies and organization relationships
- **StaffService**: Manages staff members and reporting relationships

## User Interface

### Design Principles
- **Vuetify Material Design**: Consistent with application theme
- **Three-Table Layout**: Organizations, departments, and staff displayed in separate tables stacked vertically
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
- **Organization Chips**: Primary (Blue)
- **Department Chips**: Secondary (Purple)

### Icons
- **Organization**: `mdi-office-building`
- **Department**: `mdi-office-building-outline`
- **Staff**: `mdi-account`, `mdi-account-group`
- **Create**: `mdi-plus`
- **Edit**: `mdi-pencil`
- **Delete**: `mdi-delete`
- **View**: `mdi-eye`
- **Search**: `mdi-magnify`
- **Manager**: `mdi-account-supervisor`
- **Phone**: `mdi-phone`
- **Email**: `mdi-email`

## Data Relationships

### Organization → Department → Staff Hierarchy
```
Organization
├── Root Department (optional)
├── Root Staff (optional)
└── Departments
    ├── Manager (Staff member)
    ├── Parent Department (optional)
    └── Staff Members
        └── Supervisor (Staff member, optional)
```

### Referential Integrity
- **Organizations**: Can have departments and staff
- **Departments**: Must belong to an organization, can have a parent department and manager
- **Staff**: Must belong to both an organization and department, can have a supervisor
- **Deletion**: Cascading rules prevent orphaned records

## API Integration

### GraphQL Schema
The system uses the existing GraphQL schema with full type definitions for:
- **Organization**: id, name, description, rootDepartmentId, rootStaffId
- **Department**: id, name, description, organizationId, parentDepartmentId, managerId
- **Staff**: id, firstName, lastName, email, phone, role, organizationId, departmentId, supervisorId

### Authentication
All operations require authentication via JWT tokens. Unauthenticated requests are rejected with appropriate error messages.

### Error Handling
- **Validation Errors**: Client-side validation with server-side backup
- **Constraint Violations**: Unique names, required fields, referential integrity
- **Permission Errors**: Authentication and authorization checks
- **Network Errors**: Graceful handling with user-friendly messages

## Testing

### Unit Tests
- **Service Tests**: `/tests/unit/services/organizations.test.ts`
- **Component Tests**: Dialog and page component testing
- **Integration Tests**: GraphQL client and store integration

### E2E Tests
- **`/tests/e2e/organization-management.spec.ts`**: Full user journey testing
- **Dialog Interactions**: Create, edit, delete workflows
- **Form Validation**: Required fields and constraint checking
- **Search and Filter**: Table functionality verification

### Test Coverage
- **GraphQL Operations**: All CRUD operations tested
- **Form Validation**: Required fields, length limits, format validation
- **Error Scenarios**: Network failures, validation errors, permission denied
- **User Workflows**: Complete create-to-delete cycles

## Usage Examples

### Creating an Organization
1. Navigate to Organization Management (/people)
2. Click "Add Organization" button
3. Fill in organization name (required) and description (optional)
4. Click "Create Organization"
5. Organization appears in the table immediately

### Creating a Department
1. Ensure at least one organization exists
2. Click "Add Department" button
3. Fill in department name (required)
4. Select organization from dropdown (required)
5. Optionally select parent department
6. Click "Create Department"

### Creating Staff Members
1. Ensure organization and department exist
2. Click "Add Staff Member" button
3. Fill in first name, last name, email, role (all required)
4. Select organization and department from dropdowns
5. Optionally add phone and supervisor
6. Click "Create Staff Member"

### Search and Filter
- Use search boxes above each table for real-time filtering
- Search works across all displayed columns
- Search is case-insensitive and matches partial strings

## Configuration

### Table Pagination
```javascript
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: -1, title: 'All' },
]
```

### Validation Rules
```javascript
// Organization name: 2-100 characters, required
// Department name: 2-100 characters, required  
// Staff name: 1-50 characters each, required
// Email: Valid email format, required
// Role: 2-50 characters, required
// Descriptions: 0-500 characters, optional
```

## Performance Considerations

### Data Loading
- **Parallel Loading**: Organizations, departments, and staff loaded simultaneously
- **Progressive Enhancement**: Page remains functional during data loading
- **Error Recovery**: Individual table failures don't break entire page

### Search Performance
- **Client-side Filtering**: Real-time search without server round-trips
- **Computed Properties**: Reactive filtering using Vue's computed properties
- **Debouncing**: Search input changes are processed efficiently

### Memory Management
- **Reactive References**: Proper cleanup of Vue reactive references
- **Dialog State**: Dialog components unmounted when closed
- **Event Listeners**: Proper cleanup of event handlers

## Security

### Input Validation
- **Client-side**: Immediate feedback for form validation
- **Server-side**: Comprehensive validation at GraphQL resolver level
- **Sanitization**: All user inputs properly sanitized

### Access Control
- **Authentication Required**: All operations require valid JWT tokens
- **Role-based Access**: Future enhancement for role-based permissions
- **Audit Trail**: Server-side logging of all CRUD operations

## Future Enhancements

### Planned Features
- **Bulk Operations**: Multi-select and bulk edit/delete
- **Import/Export**: CSV import and export functionality
- **Advanced Search**: Filter by organization, department, role
- **Reporting**: Organization charts and staff directories
- **Notifications**: Email notifications for staff changes

### Technical Improvements
- **Virtual Scrolling**: For large datasets (1000+ records)
- **Offline Support**: Cache management for offline capabilities
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Validation**: Cross-field validation and business rules

## Troubleshooting

### Common Issues
1. **Empty Tables**: Check authentication and network connectivity
2. **Search Not Working**: Verify reactive data binding and computed properties
3. **Dialog Validation**: Ensure all required fields are properly marked
4. **Relationship Errors**: Verify parent-child relationships are valid

### Debugging
- **Browser DevTools**: Network tab for GraphQL request inspection
- **Vue DevTools**: Component state and reactive data inspection
- **Console Logs**: Structured error logging for API failures
- **Backend Logs**: Server-side error tracking and debugging

## Maintenance

### Code Organization
- **Service Layer**: Clean separation of API calls
- **Component Hierarchy**: Reusable dialog components
- **Type Safety**: Full TypeScript coverage
- **Documentation**: Comprehensive JSDoc comments

### Updates and Patches
- **Version Control**: Git-based version tracking
- **Testing**: Automated test suite for regression prevention
- **Dependencies**: Regular updates to Vue, Vuetify, and other dependencies
- **Performance Monitoring**: Regular performance audits and optimizations