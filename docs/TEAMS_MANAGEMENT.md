# Teams Management System

## Overview

The Teams Management System provides a comprehensive interface for managing teams and team member assignments within the Fulcrum application. This system follows the same design patterns and architectural principles established in the User Management and Organization Management interfaces, ensuring consistency across the application.

This system implements a many-to-many relationship between staff members and teams, where one staff member can belong to multiple teams and one team can have multiple staff members, each with specific roles within the team.

## Features

### 1. Team Overview Table
- **Display**: Shows teams in a data table with Name, Description, Team Lead, and Member Count
- **Sorting**: All columns are sortable (click column headers)
- **Filtering**: Real-time search across team names, descriptions, and team lead names
- **Pagination**: Configurable items per page (5, 10, 25, 50, or all)
- **Team Count**: Displays total number of teams

### 2. Team Actions

#### Create New Team
- **Access**: Click "Create Team" button in the page header
- **Form Fields**:
  - **Team Name** (required): 2-100 characters
  - **Description** (optional): Free text description of the team
  - **Team Lead** (optional): Dropdown selection from available staff members
- **Validation**: Client-side and server-side validation
- **Feedback**: Success notification and automatic table refresh

#### View Team Details
- **Access**: Click eye icon in the Actions column
- **Display Information**:
  - Team name and ID
  - Description (or "No description provided")
  - Team lead name (or "No team lead assigned")
  - Member count
- **Action**: Close button to dismiss dialog

#### Edit Team
- **Access**: Click pencil icon in the Actions column
- **Editable Fields**: All team fields (name, description, team lead)
- **Pre-populated**: Form is pre-filled with current team data
- **Validation**: Same validation rules as creation
- **Feedback**: Success notification and automatic table refresh

#### Delete Team
- **Access**: Click delete icon in the Actions column
- **Confirmation**: Warning dialog with team name confirmation
- **Restrictions**: Team must have no members before deletion
- **Feedback**: Success notification and table refresh

### 3. Team Member Management

#### View Team Members
- **Access**: Click "Manage Members" icon in the team Actions column
- **Display**: Expandable section showing team members table
- **Member Information**:
  - Staff member name and email
  - Team role (specific to this team)
  - Staff role (organizational role)
  - Member-specific actions

#### Add Team Member
- **Access**: Click "Add Member" button in the team members section
- **Form Fields**:
  - **Staff Member** (required): Dropdown of available staff not already in team
  - **Team Role** (required): 2-50 characters describing role in this team
- **Validation**: Prevents duplicate assignments
- **Feedback**: Success notification and member list refresh

#### Edit Team Member Role
- **Access**: Click pencil icon in member Actions column
- **Editable Field**: Team role only
- **Pre-populated**: Current role text
- **Validation**: 2-50 character requirement
- **Feedback**: Success notification and member list refresh

#### Remove Team Member
- **Access**: Click remove icon in member Actions column
- **Confirmation**: Warning dialog with member name and role
- **Action**: Removes member from team (can be re-added later)
- **Feedback**: Success notification and member list refresh

### 4. Search and Filter Capabilities

#### Team Search
- **Location**: Search field in teams table header
- **Scope**: Searches across team names, descriptions, and team lead names
- **Type**: Real-time filtering as you type
- **Case Insensitive**: Matches partial strings

#### Team Member Search
- **Location**: Search field in team members table header
- **Scope**: Searches across staff names, emails, team roles, and staff roles
- **Type**: Real-time filtering as you type
- **Case Insensitive**: Matches partial strings

## Technical Implementation

### Frontend Components

#### Main Page
- **`/src/pages/teams.vue`**: Main teams management interface with dual-table layout

#### Dialog Components

**Team Dialogs:**
- **`/src/components/TeamCreateDialog.vue`**: Team creation form
- **`/src/components/TeamEditDialog.vue`**: Team editing form
- **`/src/components/TeamViewDialog.vue`**: Team details display
- **`/src/components/TeamDeleteDialog.vue`**: Deletion confirmation

**Team Member Dialogs:**
- **`/src/components/TeamMemberCreateDialog.vue`**: Add staff to team form
- **`/src/components/TeamMemberEditDialog.vue`**: Edit member role form
- **`/src/components/TeamMemberDeleteDialog.vue`**: Remove member confirmation

#### Services
- **`/src/services/teams.ts`**: GraphQL service layer for all team operations

### Backend Integration

The frontend integrates with existing backend services:

#### GraphQL Operations
- **Queries**: `teams`, `team`, `teamMembers`, `teamMember`
- **Mutations**: `createTeam`, `updateTeam`, `deleteTeam`, `addTeamMember`, `updateTeamMember`, `removeTeamMember`, `removeStaffFromTeam`

#### Business Logic
- **TeamService**: Handles team CRUD operations and validation
- **Team Member Management**: Manages many-to-many relationships between teams and staff
- **Data Integrity**: Ensures referential integrity and prevents orphaned records

## Data Relationships

### Team → Staff Many-to-Many Relationship
```
Team
├── Team Members (TeamMember junction table)
│   ├── Staff Member (Staff object)
│   ├── Member Role (team-specific role)
│   └── Staff Role (organizational role)
└── Team Lead (Staff member, optional)
```

### Referential Integrity
- **Teams**: Can have multiple members and optionally a team lead
- **Staff**: Can belong to multiple teams with different roles in each
- **Team Members**: Must reference existing team and staff, unique per team-staff pair
- **Deletion**: Teams cannot be deleted if they have members; staff removal is handled gracefully

## API Integration

### GraphQL Schema
The system uses the existing GraphQL schema with full type definitions for:
- **Team**: id, name, description, leadId
- **TeamMember**: id, teamId, staffId, memberRole
- **Staff**: Complete staff information for team member selection

### Authentication
All operations require authentication via JWT tokens. Unauthenticated requests are rejected with appropriate error messages.

### Error Handling
- **Validation Errors**: Client-side validation with server-side backup
- **Constraint Violations**: Unique team names, required fields, referential integrity
- **Permission Errors**: Authentication and authorization checks
- **Network Errors**: Graceful handling with user-friendly messages

## User Interface

### Design Principles
- **Vuetify Material Design**: Consistent with application theme
- **Dual-Table Layout**: Teams table with expandable team members section
- **Responsive Layout**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Clear error messages and validation feedback
- **Loading States**: Progress indicators during operations

### Color Coding
- **Primary Actions**: Blue (Create, Save, Update)
- **Destructive Actions**: Red (Delete, Remove)
- **Neutral Actions**: Gray (Cancel, Close)
- **Success**: Green (notifications)
- **Warnings**: Orange (confirmations)
- **Team Lead Chips**: Primary (Blue)
- **Member Count Chips**: Secondary (Purple)
- **Role Chips**: Info (Light Blue)

### Icons
- **Create Team**: `mdi-account-multiple-plus`
- **View**: `mdi-eye`
- **Edit**: `mdi-pencil`
- **Delete**: `mdi-delete`
- **Manage Members**: `mdi-account-multiple-outline`
- **Add Member**: `mdi-account-plus`
- **Remove Member**: `mdi-account-minus`
- **Team Lead**: `mdi-account-star`
- **Team Role**: `mdi-briefcase`

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
// Team name: 2-100 characters, required, unique
// Team description: 0-500 characters, optional
// Team member role: 2-50 characters, required
// Staff selection: Required for team member assignment
```

## Navigation

The teams management system is accessible via:
1. **Side Navigation**: Click "Teams" in the main navigation drawer
2. **Direct URL**: `/teams` route
3. **Icon**: Teams management icon with "Manage teams and team members" subtitle

## Performance

### Optimization Features
- Lazy loading of team data and members
- Efficient table pagination and search
- Debounced search filtering
- Minimal re-renders with Vue 3 reactivity
- Selective data loading (members loaded per team as needed)

### Loading States
- Table loading indicators
- Dialog processing overlays
- Button loading states during operations
- Progressive data loading for large teams

## Usage Examples

### Creating a Team
1. Navigate to Teams Management (/teams)
2. Click "Create Team" button
3. Fill in team name (required)
4. Optionally add description and select team lead
5. Click "Create Team"
6. Team appears in the table immediately

### Adding Team Members
1. Find the team in the teams table
2. Click "Manage Members" icon (people icon)
3. Team members section expands below
4. Click "Add Member" button
5. Select staff member from dropdown
6. Enter their role in the team
7. Click "Add Member"
8. Member appears in the team members table

### Managing Team Member Roles
1. In the team members section, find the member
2. Click the pencil icon in their Actions column
3. Update their team role text
4. Click "Update Role"
5. Role is updated and displayed immediately

### Removing Team Members
1. In the team members section, find the member
2. Click the remove icon (minus) in their Actions column
3. Confirm removal in the dialog
4. Member is removed from the team (but remains in the system)

## Error Handling

### Common Error Scenarios
- **Duplicate team names**: Prevented with validation
- **Team with members deletion**: Blocked with clear error message
- **Invalid staff selection**: Dropdown prevents invalid selections
- **Network issues**: Graceful handling with retry options
- **Authentication expiry**: Automatic redirection to login

### User Feedback
- **Success notifications**: Green snackbar messages
- **Error notifications**: Red snackbar messages with clear descriptions
- **Validation feedback**: Real-time form validation with helpful messages
- **Loading indicators**: Clear progress feedback during operations

## Security Considerations

### Data Protection
- All operations require valid authentication
- Role-based access control for team management
- Input sanitization and validation
- No sensitive data exposure in error messages

### Audit Trail
- All team and membership changes are logged
- User attribution for all operations
- Timestamp tracking for changes
- Change history preservation

## Testing

### Frontend Tests
- **Service Tests**: Complete coverage of team service GraphQL operations
- **Component Tests**: Dialog component functionality and user interactions
- **Integration Tests**: End-to-end team management workflows
- **Validation Tests**: Form validation and error handling

### Backend Tests
- **Unit Tests**: Team service business logic and validation
- **Integration Tests**: GraphQL resolver functionality
- **Database Tests**: Data integrity and constraint enforcement
- **Performance Tests**: Large dataset handling

## Future Enhancements

### Planned Features
- **Bulk Operations**: Multi-select team members for bulk role updates
- **Team Templates**: Predefined team structures for common team types
- **Team Analytics**: Member contribution metrics and team performance
- **Advanced Search**: Filter by team lead, member count, creation date
- **Export/Import**: CSV export for team rosters and bulk member import
- **Team Hierarchies**: Support for nested teams and sub-teams

### Technical Improvements
- **Virtual Scrolling**: For organizations with hundreds of teams
- **Offline Support**: Cache management for offline team management
- **Real-time Updates**: WebSocket integration for live membership changes
- **Advanced Validation**: Cross-team validation and business rules
- **Role Hierarchies**: Structured role definitions with permissions

This Teams Management system provides a complete, secure, and user-friendly interface for managing teams and team member assignments while maintaining consistency with the overall application design and architecture.