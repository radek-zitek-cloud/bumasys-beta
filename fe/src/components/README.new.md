# Components Directory

Vue template files in this folder are automatically imported and globally available throughout the application.

## 🚀 Usage

Importing is handled by [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components). This plugin automatically imports `.vue` files created in the `src/components` directory, and registers them as global components. This means that you can use any component in your application without having to manually import it.

The following example assumes a component located at `src/components/auth/LoginCard.vue`:

```vue
<template>
  <div>
    <LoginCard />
  </div>
</template>

<script lang="ts" setup>
//
</script>
```

When your template is rendered, the component's import will automatically be inlined, which renders to this:

```vue
<template>
  <div>
    <LoginCard />
  </div>
</template>

<script lang="ts" setup>
import LoginCard from "@/components/auth/LoginCard.vue";
</script>
```

## 📂 Domain-Based Organization

**Refactoring Note:** This directory has been refactored from a flat structure with 53+ components to a domain-based organization for better maintainability and developer experience.

### 🔧 `/common/` - Shared Components
Utility components used across the application.

**Components:**
- **AppFooter.vue** - Application footer with backend status and user info
- **ErrorBoundary.vue** - Error boundary for handling application errors

### 🔐 `/auth/` - Authentication & Authorization  
Components for user authentication, registration, and profile management.

**Components:**
- **LoginCard.vue** - User login form
- **RegisterCard.vue** - User registration form
- **LogoutCard.vue** - Logout confirmation dialog
- **PasswordResetCard.vue** - Password reset request form
- **ChangePasswordCard.vue** - Password change form for authenticated users
- **ProfileCard.vue** - User profile editing form

### 🏢 `/organization/` - Organization Management
Components for managing organizations, departments, and staff.

**Organization Components:**
- **OrganizationCreateDialog.vue** - Create new organization
- **OrganizationEditDialog.vue** - Edit existing organization
- **OrganizationViewDialog.vue** - View organization details (read-only)
- **OrganizationDeleteDialog.vue** - Organization deletion confirmation

**Department Components:**  
- **DepartmentCreateDialog.vue** - Create new department
- **DepartmentEditDialog.vue** - Edit existing department
- **DepartmentViewDialog.vue** - View department details (read-only)
- **DepartmentDeleteDialog.vue** - Department deletion confirmation
- **DepartmentTreeDialog.vue** - Hierarchical department structure view

**Staff Components:**
- **StaffCreateDialog.vue** - Create new staff member
- **StaffEditDialog.vue** - Edit existing staff member
- **StaffViewDialog.vue** - View staff details (read-only)
- **StaffDeleteDialog.vue** - Staff deletion confirmation
- **StaffTreeDialog.vue** - Hierarchical organization structure view

### 👥 `/teams/` - Team Management
Components for managing teams and team memberships.

**Team Components:**
- **TeamCreateDialog.vue** - Create new team
- **TeamEditDialog.vue** - Edit existing team
- **TeamViewDialog.vue** - View team details (read-only)
- **TeamDeleteDialog.vue** - Team deletion confirmation

**Team Member Components:**
- **TeamMemberCreateDialog.vue** - Add member to team
- **TeamMemberEditDialog.vue** - Edit team member role
- **TeamMemberDeleteDialog.vue** - Remove member from team

### 📋 `/projects/` - Project & Task Management
Components for managing projects and their associated tasks.

**Project Components:**
- **ProjectCreateDialog.vue** - Create new project
- **ProjectEditDialog.vue** - Edit existing project
- **ProjectViewDialog.vue** - View project details (read-only)
- **ProjectDeleteDialog.vue** - Project deletion confirmation

**Task Components:**
- **TaskCreateDialog.vue** - Create new task
- **TaskEditDialog.vue** - Edit existing task
- **TaskViewDialog.vue** - View task details (read-only)
- **TaskDeleteDialog.vue** - Task deletion confirmation

### 📊 `/references/` - Reference Data Management
Components for managing core reference data used throughout the application.

**Status Components:**
- **StatusCreateDialog.vue** - Create new status
- **StatusEditDialog.vue** - Edit existing status
- **StatusDeleteDialog.vue** - Status deletion confirmation

**Priority Components:**
- **PriorityCreateDialog.vue** - Create new priority
- **PriorityEditDialog.vue** - Edit existing priority
- **PriorityDeleteDialog.vue** - Priority deletion confirmation

**Complexity Components:**
- **ComplexityCreateDialog.vue** - Create new complexity level
- **ComplexityEditDialog.vue** - Edit existing complexity
- **ComplexityDeleteDialog.vue** - Complexity deletion confirmation

### 👤 `/users/` - User Management
Components for managing system users and their accounts.

**User Components:**
- **UserCreateDialog.vue** - Create new user account
- **UserEditDialog.vue** - Edit existing user information
- **UserViewDialog.vue** - View user details (read-only)
- **UserDeleteDialog.vue** - User deletion confirmation

### 🐛 `/debug/` - Development & Debugging
Components used for development, debugging, and system information.

**Debug Components:**
- **DebugInfoCard.vue** - Development debug information display
- **ConfigDisplayCard.vue** - Backend configuration viewer
- **HomeCard.vue** - Home page welcome card

## 🎨 Design Patterns

### CRUD Dialog Patterns
All domain-specific dialogs follow consistent patterns:

1. **Create Dialogs**: Form-based dialogs for creating new entities
2. **Edit Dialogs**: Pre-populated forms for updating existing entities
3. **View Dialogs**: Read-only displays for viewing entity details
4. **Delete Dialogs**: Confirmation dialogs for entity deletion

### Common Features
- **Vuetify Material Design**: Consistent theming and component usage
- **Form Validation**: Client-side validation with proper error messaging
- **Responsive Design**: Mobile and desktop compatibility
- **Accessibility**: ARIA labels and keyboard navigation support
- **Error Handling**: Graceful error handling with user feedback
- **Loading States**: Progress indicators during async operations

## 🧪 Testing Strategy

### Component Testing
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interactions and data flow
- **E2E Tests**: Full user workflows across related components

### Domain Testing
Each domain folder enables focused testing strategies:
- Domain-specific test suites
- Mock data relevant to each business area
- Isolated testing environments

## 📝 Documentation Standards

### Component Documentation
Each component includes:
- **JSDoc Comments**: Comprehensive component documentation
- **Props Interface**: TypeScript interfaces for all props
- **Events Documentation**: Emitted events and their payloads
- **Usage Examples**: Code examples in component comments

### Domain Documentation
Each domain folder includes:
- **README.md**: Domain overview and component listing
- **Component Descriptions**: Purpose and functionality
- **Integration Notes**: How components work together

## 🔄 Migration Notes

### Before Refactoring
- 53+ components in a single flat directory
- Difficult navigation and component discovery
- No logical grouping or organization
- Challenging maintenance for large teams

### After Refactoring
- Domain-based organization with 8 logical folders
- Clear separation of concerns
- Improved developer experience
- Easier component discovery and maintenance
- Better scalability for future development

### Auto-Generated Files
The following files are automatically updated:
- **components.d.ts**: TypeScript declarations for global components
- **Import paths**: Automatically handled by unplugin-vue-components
- **Build optimization**: Vite handles the new structure seamlessly

## 🚀 Future Enhancements

### Planned Improvements
- Component library with Storybook integration
- Performance optimization with lazy loading
- Advanced component composition patterns
- Automated component documentation generation

### Development Guidelines
- Follow domain-driven design principles
- Maintain consistent CRUD dialog patterns
- Ensure comprehensive testing coverage
- Document all new components thoroughly
