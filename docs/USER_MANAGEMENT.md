# User Management System

This document describes the comprehensive user management system implemented for the application.

## Overview

The user management system provides a complete interface for managing system users, including creating, viewing, editing, and deleting user accounts. The system is built using Vue 3 with TypeScript, Vuetify components, and GraphQL for backend communication.

## Features

### 1. User Overview Table
- **Display**: Shows users in a data table with First Name, Last Name, Email, and Notes
- **Sorting**: All columns are sortable (click column headers)
- **Filtering**: Real-time search across all user fields
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **User Count**: Displays total number of users

### 2. User Actions

#### Create New User
- **Access**: Click "Create User" button in the top-right corner
- **Form Fields**:
  - Email (required, validated)
  - Password (required, minimum 6 characters)
  - Confirm Password (required, must match)
  - First Name (optional)
  - Last Name (optional)
  - Note (optional)
- **Password Validation**:
  - Real-time strength indicator (Weak/Medium/Strong)
  - Visual progress bar showing strength
  - Password confirmation matching

#### View User Details
- **Access**: Click the eye icon in the Actions column
- **Information Displayed**:
  - Email address
  - First and Last name
  - User notes
  - User ID
  - Read-only format with clear labels

#### Edit User
- **Access**: Click the pencil icon in the Actions column
- **Editable Fields**:
  - Email address
  - First and Last name
  - User notes
  - Password (optional - leave blank to keep current)
- **Password Change**:
  - Optional - only change if new password is provided
  - Same validation as creation (strength indicator, confirmation)
  - Real-time matching validation

#### Delete User
- **Access**: Click the delete icon in the Actions column
- **Safety Features**:
  - Confirmation dialog with user details
  - Warning about permanent deletion
  - Cannot be undone

## Technical Implementation

### Frontend Components

#### Services
- **`/src/services/users.ts`**: GraphQL service layer for user operations
  - `getUsers()`: Fetch all users
  - `getUser(id)`: Fetch specific user
  - `createUser(input)`: Create new user
  - `updateUser(input)`: Update existing user
  - `deleteUser(id)`: Delete user

#### Components
- **`/src/components/UserCreateDialog.vue`**: User creation form
- **`/src/components/UserEditDialog.vue`**: User editing form
- **`/src/components/UserViewDialog.vue`**: Read-only user details
- **`/src/components/UserDeleteDialog.vue`**: Deletion confirmation

#### Pages
- **`/src/pages/users.vue`**: Main user management interface

### Backend Integration

The system uses existing GraphQL mutations and queries:

```graphql
# Queries
query {
  users {
    id
    email
    firstName
    lastName
    note
  }
}

query ($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    note
  }
}

# Mutations
mutation createUser($email: String!, $password: String!, ...) {
  createUser(email: $email, password: $password, ...) {
    id
    email
    firstName
    lastName
    note
  }
}

mutation updateUser($id: ID!, $email: String, ...) {
  updateUser(id: $id, email: $email, ...) {
    id
    email
    firstName
    lastName
    note
  }
}

mutation deleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

### Authentication

All user management operations require authentication:
- Uses JWT tokens from the auth store
- Automatically includes `Authorization: Bearer <token>` header
- Handles authentication errors gracefully

## User Interface

### Design Principles
- **Vuetify Material Design**: Consistent with application theme
- **Responsive Layout**: Works on desktop and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Clear error messages and validation feedback
- **Loading States**: Progress indicators during operations

### Color Coding
- **Primary Actions**: Blue (Create, Save, Update)
- **Destructive Actions**: Red (Delete)
- **Neutral Actions**: Gray (Cancel, Close)
- **Success**: Green (notifications)
- **Warnings**: Orange (strength indicators, confirmations)

### Icons
- **Create**: `mdi-account-plus`
- **View**: `mdi-eye`
- **Edit**: `mdi-pencil`
- **Delete**: `mdi-delete`
- **Search**: `mdi-magnify`
- **Email**: `mdi-email`
- **Password**: `mdi-lock`

## Error Handling

### Validation Errors
- Real-time form validation
- Clear error messages
- Field-specific error highlighting

### Network Errors
- Connection timeout handling
- GraphQL error parsing
- User-friendly error notifications

### Authentication Errors
- Automatic token refresh
- Login prompt when unauthenticated
- Graceful degradation

## Security Considerations

### Password Handling
- Passwords never sent in responses
- Secure hashing on backend
- Strength validation on frontend

### Access Control
- Authentication required for all operations
- Server-side authorization validation
- Role-based access control ready

### Data Validation
- Input sanitization
- Email format validation
- Required field enforcement

## Testing

### Unit Tests
- User service functions tested (`/tests/unit/services/users.test.ts`)
- Component behavior testing
- Mock GraphQL responses

### Integration Tests
- End-to-end user workflows
- Form validation testing
- Error scenario testing

## Navigation

The user management system is accessible via:
1. **Side Navigation**: Click "Users" in the main navigation drawer
2. **Direct URL**: `/users` route
3. **Icon**: Account management icon with "Manage system users" subtitle

## Performance

### Optimization Features
- Lazy loading of user data
- Efficient table pagination
- Debounced search filtering
- Minimal re-renders with Vue 3 reactivity

### Loading States
- Table loading indicator
- Dialog processing overlays
- Button loading states during operations

## Future Enhancements

### Planned Features
- Bulk user operations
- User role management
- Advanced filtering options
- Export user data
- User activity logging

### Accessibility Improvements
- Screen reader support
- Keyboard shortcuts
- High contrast theme support
- Focus management

This user management system provides a complete, secure, and user-friendly interface for managing system users while maintaining consistency with the overall application design and architecture.