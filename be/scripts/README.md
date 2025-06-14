# User ID Migration to UUID

This directory contains scripts for migrating user IDs from timestamp-based strings to UUID format.

## Migration Script

### `migrate-user-ids-to-uuid.ts`

This script converts existing user IDs from timestamp-based strings (e.g., "1700000000001") to UUID format (e.g., "550e8400-e29b-41d4-a716-446655440000").

#### What it does:

1. **Backup**: Creates a backup of the current database file
2. **Migrate Users**: Converts all user IDs from timestamp strings to UUIDs
3. **Update Sessions**: Updates all session `userId` references to use the new UUIDs
4. **Skip Existing UUIDs**: Safely skips users that already have UUID format IDs
5. **Logging**: Provides detailed logging of all changes made
6. **ID Mapping**: Saves a mapping file showing old ID -> new ID conversions

#### Usage:

```bash
# Run the migration
npm run migrate-user-ids

# Or run directly with ts-node
npx ts-node scripts/migrate-user-ids-to-uuid.ts
```

#### Safety Features:

- **Automatic Backup**: Creates timestamped backup before any changes
- **Idempotent**: Can be run multiple times safely (skips already migrated UUIDs)
- **Validation**: Validates UUID format before skipping
- **Mapping**: Preserves old ID -> new ID mapping for reference

#### Output Files:

- `db.json.backup.{timestamp}` - Backup of original database
- `db.json.id-mapping.{timestamp}.json` - Mapping of old IDs to new UUIDs

#### Example Output:

```
Starting user ID migration to UUID...
Database file: /path/to/db.json
Creating backup at: /path/to/db.json.backup.1700000000000
Found 2 users to migrate
User 1: 1700000000001 -> 550e8400-e29b-41d4-a716-446655440000 (user1@example.com)
User 2: 1700000000002 -> 6ba7b810-9dad-11d1-80b4-00c04fd430c8 (user2@example.com)
Found 2 sessions to update
Session 1: userId 1700000000001 -> 550e8400-e29b-41d4-a716-446655440000
Session 2: userId 1700000000002 -> 6ba7b810-9dad-11d1-80b4-00c04fd430c8
Migration completed successfully!
Migrated 2 user IDs
```

#### When to Run:

- **One-time**: After updating the UserService to use UUIDs for new users
- **Before Production**: Run on staging/development environments first
- **Backup First**: Always ensure you have a current backup before running

#### Rollback:

If needed, you can restore from the backup file created by the script:

```bash
cp db.json.backup.{timestamp} db.json
```
