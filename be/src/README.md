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
├── db.ts           # Legacy database module (deprecated)
├── index.ts        # Main application entry point
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
- Application configuration (`config.ts`)
- Logging configuration (`logger.ts`)
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

## Configuration

### Environment Variables

The application supports configuration via environment variables:

- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - JWT secret key for token signing
- `DB_FILE` - Path to database file
- `BETTER_STACK_ENABLED` - Enable BetterStack logging (default: false)
- `BETTER_STACK_SOURCE_TOKEN` - BetterStack source token for log ingestion

### Logging Configuration

The application uses [Pino](https://getpino.io/) for structured logging with conditional transport configuration:

#### Development Mode (default)

- Uses `pino-pretty` transport for human-readable colored output
- Logs to console only

#### Production Mode (with BetterStack)

- Uses multiple transports: console + BetterStack
- Set `BETTER_STACK_ENABLED=true` and provide `BETTER_STACK_SOURCE_TOKEN`
- Logs are sent to both console and BetterStack for centralized log management

**Example Usage:**

```bash
# Development (default)
npm run dev

# Production with BetterStack
BETTER_STACK_ENABLED=true BETTER_STACK_SOURCE_TOKEN=your-token npm start
```

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
