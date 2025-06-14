# Backend Architecture Documentation

This document describes the backend architecture and organization following Node.js, Express.js, and GraphQL Apollo Server best practices.

## Project Structure

```
be/src/
├── types/           # TypeScript interfaces and type definitions
├── services/        # Business logic and service layer
├── resolvers/       # GraphQL resolver functions
├── schema/          # GraphQL type definitions
├── middleware/      # Express middleware functions
├── utils/           # Utility functions and helpers
├── auth.ts         # Legacy auth module (deprecated)
├── config.ts       # Application configuration
├── db.ts           # Legacy database module (deprecated)
├── index.ts        # Main application entry point
├── logger.ts       # Logging configuration
└── schema.ts       # Legacy schema module (deprecated)
```

## Architecture Overview

### Service Layer Pattern
The application follows a service layer pattern where business logic is separated from GraphQL resolvers:

- **Services** (`services/`): Handle business logic, data validation, and database operations
- **Resolvers** (`resolvers/`): Thin layer that coordinates between GraphQL requests and services
- **Types** (`types/`): Centralized type definitions for consistency across the application

### Key Services

#### AuthService (`services/auth.service.ts`)
Handles all authentication-related operations:
- JWT token generation and verification
- Password hashing and comparison
- Session management for refresh tokens
- User authentication and authorization

#### UserService (`services/user.service.ts`)
Manages user-related business logic:
- User CRUD operations
- User data validation
- Safe user object transformations (removing passwords)
- User lookup and management

### GraphQL Organization

#### Schema (`schema/index.ts`)
Contains all GraphQL type definitions with comprehensive documentation using GraphQL schema description language.

#### Resolvers (`resolvers/`)
Organized into separate files:
- `query.resolvers.ts`: All Query type resolvers
- `mutation.resolvers.ts`: All Mutation type resolvers
- `index.ts`: Combines resolvers and provides initialization

### Middleware (`middleware/`)
Express middleware functions including:
- Authentication context creation for GraphQL
- JWT token verification
- Request logging and error handling

### Utilities (`utils/`)
Helper functions and utilities:
- Database management utilities
- Validation helpers
- Common utility functions

## Migration from Legacy Code

Legacy modules are maintained for backward compatibility but marked as deprecated:
- `auth.ts` - Use `services/auth.service.ts` instead
- `db.ts` - Use `utils/database.utils.ts` instead  
- `schema.ts` - Use `schema/` and `resolvers/` directories instead

## Best Practices Implemented

1. **Separation of Concerns**: Clear separation between GraphQL layer, business logic, and data access
2. **Type Safety**: Comprehensive TypeScript types for all data structures
3. **Documentation**: JSDoc comments on all functions and modules
4. **Error Handling**: Proper error handling with meaningful error messages
5. **Security**: Secure password hashing, JWT token management, and authentication
6. **Testability**: Service layer design makes unit testing easier
7. **Maintainability**: Modular structure makes code easier to maintain and extend

## Development Guidelines

### Adding New Features
1. Define types in `types/index.ts`
2. Implement business logic in appropriate service
3. Add GraphQL schema definitions in `schema/index.ts`
4. Create resolvers that use the service layer
5. Add middleware if needed for request processing

### Code Organization
- Keep resolvers thin - delegate to services
- Use TypeScript interfaces for all data structures
- Add comprehensive JSDoc documentation
- Follow existing naming conventions
- Maintain backward compatibility when possible

### Testing
- Test business logic in service layer
- Test GraphQL operations via integration tests
- Mock services in resolver tests
- Use existing test patterns and utilities