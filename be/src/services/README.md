# Services Directory

This directory contains the service layer of the application, implementing business logic and data access patterns.

## Service Classes

### AuthService

**File**: `auth.service.ts`
**Purpose**: Authentication and authorization operations

**Key Methods**:

- `signToken(userId)` - Generate JWT access tokens
- `signRefreshToken(userId)` - Generate and store refresh tokens
- `verifyToken(token)` - Verify JWT tokens
- `authenticateUser(credentials)` - User login with credentials
- `refreshAccessToken(refreshToken)` - Refresh expired access tokens
- `logout(refreshToken)` - Invalidate user sessions

### UserService

**File**: `user.service.ts`
**Purpose**: User management and CRUD operations

**Key Methods**:

- `createUser(userData)` - Create new user accounts
- `updateUser(updateData)` - Update user information
- `deleteUser(userId)` - Remove users from system
- `findById(userId)` - Find users by ID
- `findByEmail(email)` - Find users by email
- `getAllUsers()` - Get all users (admin function)
- `changePassword(userId, oldPassword, newPassword)` - Password changes

## Design Principles

1. **Single Responsibility**: Each service handles one domain area
2. **Dependency Injection**: Services receive dependencies via constructor
3. **Error Handling**: Services throw meaningful errors that resolvers can handle
4. **Data Transformation**: Services handle converting between internal and external data formats
5. **Business Logic**: All business rules are implemented in services, not resolvers

## Usage Examples

```typescript
// Initialize services
const authService = new AuthService(database);
const userService = new UserService(database);

// Use in resolvers
const authPayload = await authService.authenticateUser({ email, password });
const user = await userService.createUser(registrationData);
```

## Adding New Services

1. Create new service class file
2. Implement constructor with dependencies
3. Add business logic methods with proper error handling
4. Export from `index.ts`
5. Initialize in main application setup
6. Use in resolvers via dependency injection
