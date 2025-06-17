# Multiple Database System

## Overview

The Fulcrum backend now supports multiple databases to enable data isolation between different environments and use cases. The system separates authentication data from application data and allows switching between different tagged datasets.

## Architecture

### Database Separation

The system uses two types of databases:

1. **Authentication Database** (`auth.json`)
   - Contains user authentication data (users, sessions)
   - Shared across all environments
   - Ensures consistent user access regardless of active tag

2. **Application Data Databases** (`db-{tag}.json`)
   - Contains business data (organizations, projects, tasks, etc.)
   - Tagged for environment isolation
   - Switched dynamically via GraphQL mutation

### Default Configuration

- **Default Tag**: `default`
- **Default Data File**: `db-default.json`
- **Authentication File**: `auth.json`
- **Directory**: Based on `DB_FILE` environment variable directory

## API Reference

### GraphQL Mutation

```graphql
mutation SwitchDatabaseTag($tag: String!) {
  dbtag(tag: $tag)
}
```

**Parameters:**
- `tag`: Database tag identifier (alphanumeric characters and hyphens only)

**Returns:**
- `Boolean`: `true` if switch was successful

**Authentication:** Required

### Tag Validation Rules

1. **Format**: Only alphanumeric characters and hyphens (`/^[a-zA-Z0-9-]+$/`)
2. **Length**: Minimum 2 characters, maximum 50 characters
3. **Reserved Names**: Cannot use `auth`, `sessions`, or `system`
4. **Case Sensitivity**: Tags are case-sensitive

## Frontend Integration

### User Interface

The database switching functionality is accessible through:
1. Click the triple-dot menu (⋮) in the top-right corner
2. Select "Switch Database" (requires authentication)
3. Enter the desired tag name
4. Confirm the switch

### Component Location

`fe/src/components/auth/DatabaseTagSwitchCard.vue`

## Usage Examples

### Backend Development

```typescript
import { createDatabaseService } from './services/database.service';

// Initialize with custom tag
const dbService = await createDatabaseService(
  './data/auth.json',
  './data/db.json',
  'development'
);

// Switch to production data
await dbService.switchToTag('production');
```

### Frontend Usage

```vue
<template>
  <DatabaseTagSwitchCard 
    @cancel="closeDialog" 
    @switch="handleTagSwitch" 
  />
</template>
```

## Environment Examples

### Common Tag Patterns

- `default` - Default development environment
- `production` - Production data
- `staging` - Staging environment data  
- `testing` - Test data isolation
- `feature-branch-name` - Feature-specific data
- `user-demo` - Demo/training data

### File Structure

```
data/
├── auth.json                 # Shared authentication data
├── db-default.json          # Default application data
├── db-production.json       # Production data
├── db-staging.json          # Staging data
└── db-testing.json          # Test data
```

## Migration Guide

### From Single Database

The system maintains backward compatibility through a unified database interface:

```typescript
// Old way (still works)
const db = await createDatabase('./data/db.json');

// New way (recommended)
const dbService = await createDatabaseService('./data/auth.json', './data/db.json');
const db = dbService.getUnifiedDatabase();
```

### Migrating Existing Data

1. **Backup existing database**: Copy `db.json` to `db.json.backup`
2. **Split authentication data**: Move users and sessions to `auth.json`
3. **Rename application data**: Move remaining data to `db-default.json`
4. **Update configuration**: Ensure `DB_FILE` points to the base path

## Testing

### Test Utilities

Use the provided test utilities for proper cleanup:

```typescript
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'my-test-db.json');
  // ... setup
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'my-test-db.json');
});
```

### Database Tag Tests

Run the database tag functionality tests:

```bash
cd be
pnpm test tests/dbtag.test.ts
```

## Security Considerations

### Access Control

- Database switching requires authentication
- All tag operations are logged with user context
- Invalid tags are rejected with clear error messages

### Tag Validation

- Prevents path traversal attacks through strict validation
- Reserved tag names protect system integrity
- Length limits prevent abuse

### Data Isolation

- Authentication data remains separate and shared
- Application data is completely isolated by tag
- No cross-tag data leakage

## Configuration

### Environment Variables

- `DB_FILE`: Base path for database files (default: `../data/db.json`)
- `JWT_SECRET`: Required for authentication (used for tag switching access)

### Service Configuration

```typescript
// Custom paths
const dbService = await createDatabaseService(
  '/custom/path/auth.json',
  '/custom/path/data.json',
  'custom-tag'
);
```

## Troubleshooting

### Common Issues

1. **Tag Switch Fails**
   - Check authentication token validity
   - Verify tag name format (alphanumeric + hyphens only)
   - Ensure tag is not reserved

2. **Database Files Not Created**
   - Check directory permissions
   - Verify `DB_FILE` configuration
   - Ensure parent directory exists

3. **Authentication Data Missing**
   - Verify `auth.json` exists and is readable
   - Check file permissions
   - Ensure authentication database structure is valid

### Logging

Database operations are logged with structured data:

```typescript
// Switch attempts
logInfo('Switching database tag', { oldTag, newTag, userId });

// Errors
logError('Failed to switch database tag', { tag, error });
```

## Performance Considerations

- Database files are loaded into memory
- File I/O is atomic (writes to temp file, then renames)
- Consider database size for production deployments
- Multiple tags don't affect memory usage (only active tag is loaded)

## Future Enhancements

- Database tag metadata and descriptions
- Tag-based access control and permissions
- Database tag versioning and snapshots
- Automated tag cleanup and archival
- Multi-tenant tag isolation
- Database tag templates