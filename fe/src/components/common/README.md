# Common Components

Shared utility components used across the application.

## Components

### AppFooter.vue
Application footer with external links, backend status indicator, user information, and copyright notice.

**Features:**
- Links to external resources
- Real-time backend connectivity status
- Current user display for authenticated users
- Responsive design with conditional content
- Copyright notice with current year

**Usage:**
```vue
<AppFooter />
```

### ErrorBoundary.vue
Error boundary component for handling and displaying errors in the application.

**Features:**
- Catches and displays errors gracefully
- Prevents entire app crashes
- User-friendly error messages

**Usage:**
```vue
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```
