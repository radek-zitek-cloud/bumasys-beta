# Components Directory

Vue template files in this folder are automatically imported and globally available throughout the application.

## 🚀 Usage

Importing is handled by [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components). This plugin automatically imports `.vue` files created in the `src/components` directory, and registers them as global components. This means that you can use any component in your application without having to manually import it.

The following example assumes a component located at `src/components/MyComponent.vue`:

```vue
<template>
  <div>
    <MyComponent />
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
    <MyComponent />
  </div>
</template>

<script lang="ts" setup>
import MyComponent from "@/components/MyComponent.vue";
</script>
```

## 📋 Component Categories

### Authentication Components
- **LoginCard.vue** - User login form
- **RegisterCard.vue** - User registration form
- **LogoutCard.vue** - Logout confirmation dialog
- **PasswordResetCard.vue** - Password reset request form
- **ChangePasswordCard.vue** - Password change form for authenticated users
- **ProfileCard.vue** - User profile editing form

### CRUD Dialog Components

#### Organization Management
- **OrganizationCreateDialog.vue** - Create new organization
- **OrganizationEditDialog.vue** - Edit existing organization
- **OrganizationViewDialog.vue** - View organization details (read-only)
- **OrganizationDeleteDialog.vue** - Organization deletion confirmation

#### Department Management  
- **DepartmentCreateDialog.vue** - Create new department
- **DepartmentEditDialog.vue** - Edit existing department
- **DepartmentViewDialog.vue** - View department details (read-only)
- **DepartmentDeleteDialog.vue** - Department deletion confirmation
- **DepartmentTreeDialog.vue** - Hierarchical department structure view

#### Staff Management
- **StaffCreateDialog.vue** - Create new staff member
- **StaffEditDialog.vue** - Edit existing staff member
- **StaffViewDialog.vue** - View staff details (read-only)
- **StaffDeleteDialog.vue** - Staff deletion confirmation
- **StaffTreeDialog.vue** - Hierarchical organization structure view

#### Team Management
- **TeamCreateDialog.vue** - Create new team
- **TeamEditDialog.vue** - Edit existing team
- **TeamViewDialog.vue** - View team details (read-only)
- **TeamDeleteDialog.vue** - Team deletion confirmation
- **TeamMemberCreateDialog.vue** - Add member to team
- **TeamMemberEditDialog.vue** - Edit team member role
- **TeamMemberDeleteDialog.vue** - Remove member from team

#### Project & Task Management
- **ProjectCreateDialog.vue** - Create new project
- **ProjectEditDialog.vue** - Edit existing project
- **ProjectViewDialog.vue** - View project details (read-only)
- **ProjectDeleteDialog.vue** - Project deletion confirmation
- **TaskCreateDialog.vue** - Create new task
- **TaskEditDialog.vue** - Edit existing task
- **TaskViewDialog.vue** - View task details (read-only)
- **TaskDeleteDialog.vue** - Task deletion confirmation

#### Reference Data Management
- **StatusCreateDialog.vue** - Create new status
- **StatusEditDialog.vue** - Edit existing status
- **StatusDeleteDialog.vue** - Status deletion confirmation
- **PriorityCreateDialog.vue** - Create new priority
- **PriorityEditDialog.vue** - Edit existing priority
- **PriorityDeleteDialog.vue** - Priority deletion confirmation
- **ComplexityCreateDialog.vue** - Create new complexity level
- **ComplexityEditDialog.vue** - Edit existing complexity level
- **ComplexityDeleteDialog.vue** - Complexity deletion confirmation

#### User Management
- **UserCreateDialog.vue** - Create new user
- **UserEditDialog.vue** - Edit existing user
- **UserViewDialog.vue** - View user details (read-only)
- **UserDeleteDialog.vue** - User deletion confirmation

### Utility Components
- **AppFooter.vue** - Application footer with backend status and user info
- **DebugInfoCard.vue** - Development debug information display
- **ConfigDisplayCard.vue** - Backend configuration viewer

## 🎨 Design Patterns

### CRUD Dialog Pattern
All CRUD dialogs follow a consistent pattern:

1. **Props Interface**: Typed props for data input
2. **Emits Interface**: Typed events for parent communication
3. **Form Validation**: Client-side validation with rules
4. **Error Handling**: Consistent error display and handling
5. **Loading States**: Visual feedback during operations

### Common Props
- Most dialogs accept entity data as props
- Create dialogs may accept dropdown data (staff, organizations, etc.)
- Edit dialogs require the entity ID and current data

### Common Events
- `cancel` - User cancelled the operation
- `created` - Entity was successfully created
- `updated` - Entity was successfully updated
- `deleted` - Entity was successfully deleted
- `close` - Dialog should be closed

### Styling Guidelines
- Use Vuetify components consistently
- Follow Material Design principles
- Implement responsive layouts
- Use consistent spacing and typography
- Apply proper color coding for actions (primary, error, etc.)

## 🧪 Testing Strategy

### Component Testing
- Each component should have corresponding test files in `/tests/unit/components/`
- Test props, events, and user interactions
- Mock external dependencies (services, stores)
- Test loading states and error conditions

### Test File Naming
- Use `.test.ts` suffix for component tests
- Match component file names (e.g., `LoginCard.test.ts` for `LoginCard.vue`)

## 📝 Documentation Standards

### Component Documentation
Each component should include:

1. **File Header Comment**: Description, usage examples, features
2. **Props Documentation**: JSDoc for all props
3. **Events Documentation**: JSDoc for all emitted events
4. **Function Documentation**: JSDoc for all methods
5. **Computed Properties**: Documentation for complex computed properties

### Example Template
```vue
<!--
  @fileoverview Component Name and Description
  
  Brief description of what the component does and its purpose.
  
  Usage:
  ```vue
  <ComponentName :prop="value" @event="handler" />
  ```
  
  Features:
  - Feature 1
  - Feature 2
  - Feature 3
-->

<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
/**
 * @fileoverview Component Script
 * 
 * Description of the script functionality.
 */

// Component implementation
</script>
```

## 🔄 Future Improvements

### TODO Items
- [ ] Implement error boundary components
- [ ] Add loading skeleton components
- [ ] Create reusable form field components
- [ ] Implement component lazy loading
- [ ] Add component performance monitoring
- [ ] Create component design system documentation
- [ ] Implement component accessibility testing
- [ ] Add component visual regression testing

### Architecture Enhancements
- Consider extracting common dialog logic into composables
- Implement consistent form validation patterns
- Add component state management where needed
- Create component library with Storybook
- Implement component performance optimization
