#!/usr/bin/env ts-node
/**
 * @fileoverview Migration script to convert user IDs from timestamp-based strings to UUIDs
 *
 * This script should be run once to migrate existing users in the database.
 * It will:
 * 1. Create a backup of the current database
 * 2. Convert all user IDs from timestamp strings to UUIDs
 * 3. Update all references to user IDs in the sessions table
 * 4. Preserve all other user data
 *
 * Usage: npx ts-node scripts/migrate-user-ids-to-uuid.ts
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import config from '../src/utils/config';

interface UserIdMapping {
  oldId: string;
  newId: string;
}

async function migrateUserIds(): Promise<void> {
  const dbFilePath = path.resolve(config.dbFile);

  console.log('Starting user ID migration to UUID...');
  console.log(`Database file: ${dbFilePath}`);

  // Check if database file exists
  if (!fs.existsSync(dbFilePath)) {
    console.log('Database file does not exist. No migration needed.');
    return;
  }

  // Create backup
  const backupPath = `${dbFilePath}.backup.${Date.now()}`;
  console.log(`Creating backup at: ${backupPath}`);
  fs.copyFileSync(dbFilePath, backupPath);

  // Read current database
  const dbContent = fs.readFileSync(dbFilePath, 'utf8');
  const db = JSON.parse(dbContent);

  // Track ID mappings
  const userIdMappings: UserIdMapping[] = [];

  // Convert user IDs
  console.log(`Found ${db.users ? db.users.length : 0} users to migrate`);

  if (db.users && db.users.length > 0) {
    db.users.forEach((user: any, index: number) => {
      const oldId = user.id;
      const newId = uuidv4();

      // Check if ID is already a UUID (skip if already migrated)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(oldId)) {
        console.log(
          `User ${index + 1}: ID ${oldId} is already a UUID, skipping`,
        );
        return;
      }

      user.id = newId;
      userIdMappings.push({ oldId, newId });

      console.log(`User ${index + 1}: ${oldId} -> ${newId} (${user.email})`);
    });
  }

  // Update session userIds
  console.log(
    `Found ${db.sessions ? db.sessions.length : 0} sessions to update`,
  );

  if (db.sessions && db.sessions.length > 0) {
    db.sessions.forEach((session: any, index: number) => {
      const mapping = userIdMappings.find((m) => m.oldId === session.userId);
      if (mapping) {
        console.log(
          `Session ${index + 1}: userId ${mapping.oldId} -> ${mapping.newId}`,
        );
        session.userId = mapping.newId;
      }
    });
  }

  // Write updated database
  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

  console.log('Migration completed successfully!');
  console.log(`Migrated ${userIdMappings.length} user IDs`);
  console.log(`Backup saved at: ${backupPath}`);

  if (userIdMappings.length > 0) {
    // Save ID mappings for reference
    const mappingPath = `${dbFilePath}.id-mapping.${Date.now()}.json`;
    fs.writeFileSync(mappingPath, JSON.stringify(userIdMappings, null, 2));
    console.log(`ID mappings saved at: ${mappingPath}`);
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateUserIds()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateUserIds };
