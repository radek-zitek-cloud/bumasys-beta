# Composables Directory

Vue 3 composables providing reusable reactive functionality across the application.

## 🧩 Available Composables

### Authentication (`useAuth.ts`)

Centralized authentication operations with loading states and error handling.

```typescript
import { useAuth } from './useAuth'

const auth = useAuth(notify)

// Login with loading state
await auth.login({ email: 'user@example.com', password: 'password' })

// Check loading states
if (auth.loginLoading.value) {
  // Show loading spinner
}
```

**Features:**
- Login, registration, and logout operations
- Password management (change, reset)
- Profile updates
- Individual loading states for each operation
- Automatic error handling and notifications
- Navigation handling

### Form Validation (`useValidation.ts`)

Comprehensive form validation with pre-built rules and custom validation support.

```typescript
import { useValidation } from './useValidation'

const { validateRequired, validateEmail, useFormValidation } = useValidation()

// Create form validator
const { errors, isValid, validate } = useFormValidation({
  email: [validateRequired(), validateEmail()],
  password: [validateRequired(), validateMinLength(8)]
})

// Validate form data
const formData = { email: 'test@example.com', password: 'password123' }
const isValidForm = await validate(formData)
```

**Pre-built Rules:**
- `validateRequired()` - Required field validation
- `validateEmail()` - Email format validation  
- `validateMinLength(length)` - Minimum length validation
- `validateMaxLength(length)` - Maximum length validation
- `validatePattern(regex)` - Pattern matching
- `validateNumeric()` - Number validation
- `validateRange(min, max)` - Range validation

**Custom Rules:**
```typescript
const customRule = createValidator(
  (value) => value.includes('@company.com'),
  'Must be a company email'
)
```

### Loading State Management (`useLoading.ts`)

Consistent loading state management with support for multiple named operations.

```typescript
import { useLoading } from './useLoading'

// Default loading state
const { loading, error, withLoading } = useLoading()

// Named loading states
const saveLoading = useLoading('save')
const deleteLoading = useLoading('delete')

// Wrap async operations
const result = await withLoading(async () => {
  return await api.fetchData()
})

// Global loading utilities
import { useGlobalLoading } from './useLoading'
const { isAnyLoading, clearAllLoading } = useGlobalLoading()
```

**Features:**
- Named loading states for multiple simultaneous operations
- Automatic error state management
- Async operation wrappers
- Global loading state monitoring
- Sequence and parallel operation support

### D3 Tree Visualization (`useD3Tree.ts`)

Tree visualization functionality using d3.js for hierarchical data display.

```typescript
import { useD3Tree, type TreeNodeData } from './useD3Tree'

const { createTree, clearTree, error } = useD3Tree()

// Create tree structure
const treeData: TreeNodeData = {
  name: 'Root Node',
  title: 'Description',
  children: [
    {
      name: 'Child 1',
      title: 'Description 1'
    },
    {
      name: 'Child 2', 
      title: 'Description 2'
    }
  ]
}

// Render the tree
createTree(treeData, {
  containerSelector: '#tree-container',
  width: 800,
  height: 600,
  nodeColor: '#1976D2',
  linkColor: '#1976D2'
})
```

**Features:**
- SVG-based tree rendering using d3.js
- Customizable node and link colors
- Text wrapping for long node labels
- Responsive design
- Error handling

## 🎯 Design Patterns

### Composable Architecture

All composables follow consistent patterns:

1. **Single Responsibility**: Each composable has a clear, focused purpose
2. **Reactive State**: Using Vue 3's reactivity system effectively
3. **Error Handling**: Consistent error management and reporting
4. **TypeScript**: Full type safety with proper interfaces
5. **Readonly Exports**: Preventing external state mutation

### Common Patterns

```typescript
// Typical composable structure
export function useFeature(config?: FeatureConfig) {
  // Internal reactive state
  const state = ref(initialState)
  const error = ref<Error | null>(null)
  
  // Computed properties
  const derivedState = computed(() => transform(state.value))
  
  // Methods
  const performAction = async (data: ActionData) => {
    try {
      // Implementation
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }
  
  // Return readonly state and methods
  return {
    state: readonly(state),
    error: readonly(error),
    derivedState,
    performAction,
  }
}
```

### Error Handling

Consistent error handling across composables:

```typescript
// Always provide error state
const error = ref<Error | null>(null)

// Clear errors on new operations
const clearError = () => { error.value = null }

// Catch and expose errors
try {
  await operation()
} catch (err) {
  error.value = err as Error
  throw err // Re-throw for component handling
}
```

## 🧪 Testing Composables

### Unit Testing Approach

```typescript
import { describe, it, expect } from 'vitest'
import { useFeature } from './useFeature'

describe('useFeature', () => {
  it('should initialize with default state', () => {
    const { state } = useFeature()
    expect(state.value).toBe(expectedDefault)
  })
  
  it('should handle async operations', async () => {
    const { performAction, error } = useFeature()
    await performAction(testData)
    expect(error.value).toBeNull()
  })
})
```

### Testing with Vue Test Utils

```typescript
import { mount } from '@vue/test-utils'
import { useFeature } from './useFeature'

const TestComponent = {
  setup() {
    return useFeature()
  },
  template: '<div>{{ state }}</div>'
}

const wrapper = mount(TestComponent)
```

## 📚 Best Practices

### Creating New Composables

1. **Clear Naming**: Use descriptive names with `use` prefix
2. **Type Safety**: Define proper TypeScript interfaces
3. **Documentation**: Add comprehensive JSDoc documentation
4. **Error Handling**: Include error state management
5. **Testing**: Write unit tests for all functionality

### Using Composables in Components

```typescript
// Good: Destructure only what you need
const { loading, error, performAction } = useFeature()

// Good: Use reactive state in templates
<template>
  <v-btn :loading="loading" @click="performAction">
    Action
  </v-btn>
</template>

// Avoid: Mutating readonly state
// loading.value = true // This will error with readonly

// Good: Use provided methods
performAction() // This will manage loading state
```

## 🔄 Future Enhancements

### TODO Items
- [ ] Add debounced validation composable
- [ ] Create notification management composable
- [ ] Implement clipboard operations composable
- [ ] Add file upload/download composable
- [ ] Create theme management composable
- [ ] Implement keyboard shortcut composable
- [ ] Add local storage persistence composable
- [ ] Create websocket connection composable

### Architecture Improvements
- Consider composable composition patterns
- Implement composable dependency injection
- Add composable lifecycle management
- Create composable performance monitoring
- Implement composable state persistence
- Add composable internationalization support