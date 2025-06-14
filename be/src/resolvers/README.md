# Resolvers Directory

This directory contains GraphQL resolver functions organized by operation type.

## Structure

- `query.resolvers.ts` - All Query type resolvers
- `mutation.resolvers.ts` - All Mutation type resolvers  
- `index.ts` - Combines resolvers and provides initialization

## Design Pattern

Resolvers follow a thin controller pattern:
1. Extract and validate arguments
2. Delegate business logic to services
3. Handle errors appropriately
4. Return properly formatted responses

## Query Resolvers

### Available Queries
- `me` - Get current authenticated user
- `health` - Server health check
- `users` - Get all users (requires auth)
- `user(id)` - Get specific user by ID (requires auth)

### Implementation Pattern
```typescript
queryName: (
  parent: unknown,
  args: QueryArgs,
  context: GraphQLContext
) => {
  // 1. Check authentication if required
  if (!context.user) throw new Error('Unauthenticated');
  
  // 2. Delegate to service
  return service.performOperation(args);
}
```

## Mutation Resolvers

### Available Mutations
- `register` - Create new user account
- `login` - Authenticate user
- `logout` - End user session
- `refreshToken` - Get new access token
- `changePassword` - Update user password
- `createUser` - Admin user creation
- `updateUser` - Update user information
- `deleteUser` - Remove user
- `resetPassword` - Password reset (placeholder)

### Implementation Pattern
```typescript
mutationName: async (
  parent: unknown,
  args: MutationArgs,
  context: GraphQLContext
) => {
  // 1. Validate authentication if required
  // 2. Call appropriate service method
  // 3. Return result or handle errors
}
```

## Error Handling

Resolvers should:
- Let service errors bubble up to GraphQL error handling
- Provide meaningful error messages
- Not expose internal implementation details
- Follow consistent error patterns

## Authentication

Many resolvers require authentication:
- Check `context.user` for authenticated requests
- Throw `'Unauthenticated'` error if auth required but missing
- Use user ID from context for user-specific operations

## Initialization

Services must be initialized before resolvers can function:
```typescript
initializeResolvers(authService, userService);
```

This sets up the service dependencies that resolvers need to operate.