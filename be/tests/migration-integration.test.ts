import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UserIdMapping {
  oldId: string;
  newId: string;
}

// Simple function to migrate user IDs for testing
async function testMigrateUserIds(dbFilePath: string): Promise<void> {
  // ...removed debug logging...

  // Check if database file exists
  if (!fs.existsSync(dbFilePath)) {
    // ...removed debug logging...
    return;
  }

  // Create backup
  const backupPath = `${dbFilePath}.backup.${Date.now()}`;
  // ...removed debug logging...
  fs.copyFileSync(dbFilePath, backupPath);

  // Read current database
  const dbContent = fs.readFileSync(dbFilePath, 'utf8');
  const db = JSON.parse(dbContent);

  // Track ID mappings
  const userIdMappings: UserIdMapping[] = [];

  // Convert user IDs
  // ...removed debug logging...

  if (db.users && db.users.length > 0) {
    db.users.forEach((user: any, index: number) => {
      const oldId = user.id;
      const newId = uuidv4();

      // Check if ID is already a UUID (skip if already migrated)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(oldId)) {
        // ...removed debug logging...
        return;
      }

      user.id = newId;
      userIdMappings.push({ oldId, newId });

      // ...removed debug logging...
    });
  }

  // Update session userIds
  if (db.sessions && db.sessions.length > 0) {
    db.sessions.forEach((session: any) => {
      const mapping = userIdMappings.find((m) => m.oldId === session.userId);
      if (mapping) {
        session.userId = mapping.newId;
      }
    });
  }

  // Write updated database
  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

  // ...removed debug logging...

  if (userIdMappings.length > 0) {
    // Save ID mappings for reference
    const mappingPath = `${dbFilePath}.id-mapping.${Date.now()}.json`;
    fs.writeFileSync(mappingPath, JSON.stringify(userIdMappings, null, 2));
    // ...removed debug logging...
  }
}

describe('Migration Script Integration Test', () => {
  const testDbPath = path.join(__dirname, 'migration-test-db.json');

  beforeEach(() => {
    // Clean up any existing test files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Clean up any backup files
    const dir = path.dirname(testDbPath);
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (
        file.startsWith('migration-test-db.json.backup.') ||
        file.startsWith('migration-test-db.json.id-mapping.')
      ) {
        fs.unlinkSync(path.join(dir, file));
      }
    });
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Clean up any backup files
    const dir = path.dirname(testDbPath);
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (
        file.startsWith('migration-test-db.json.backup.') ||
        file.startsWith('migration-test-db.json.id-mapping.')
      ) {
        fs.unlinkSync(path.join(dir, file));
      }
    });
  });

  test('should migrate timestamp user IDs to UUIDs and update sessions', async () => {
    // Create test database with timestamp user IDs
    const testData = {
      users: [
        {
          id: '1700000000001',
          email: 'user1@test.com',
          password: '$2b$10$hashedpassword1',
          firstName: 'Test',
          lastName: 'User1',
        },
        {
          id: '1700000000002',
          email: 'user2@test.com',
          password: '$2b$10$hashedpassword2',
          firstName: 'Test',
          lastName: 'User2',
        },
      ],
      sessions: [
        {
          token: 'refresh_token_1',
          userId: '1700000000001',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          token: 'refresh_token_2',
          userId: '1700000000002',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      organizations: [],
      departments: [],
      staff: [],
      statuses: [],
      priorities: [],
      complexities: [],
      projects: [],
      tasks: [],
      taskAssignees: [],
      taskPredecessors: [],
      taskProgress: [],
      taskEvaluations: [],
      taskStatusReports: [],
      projectStatusReports: [],
    };

    fs.writeFileSync(testDbPath, JSON.stringify(testData, null, 2));

    // Run migration
    await testMigrateUserIds(testDbPath);

    // Read the migrated database
    const migratedData = JSON.parse(fs.readFileSync(testDbPath, 'utf8'));

    // Verify user IDs are now UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(migratedData.users).toHaveLength(2);
    expect(uuidRegex.test(migratedData.users[0].id)).toBe(true);
    expect(uuidRegex.test(migratedData.users[1].id)).toBe(true);

    // Verify user IDs are different
    expect(migratedData.users[0].id).not.toBe(migratedData.users[1].id);

    // Verify other user data is preserved
    expect(migratedData.users[0].email).toBe('user1@test.com');
    expect(migratedData.users[0].firstName).toBe('Test');
    expect(migratedData.users[1].email).toBe('user2@test.com');
    expect(migratedData.users[1].firstName).toBe('Test');

    // Verify session userIds are updated to match new user UUIDs
    expect(migratedData.sessions).toHaveLength(2);
    expect(migratedData.sessions[0].userId).toBe(migratedData.users[0].id);
    expect(migratedData.sessions[1].userId).toBe(migratedData.users[1].id);

    // Verify other session data is preserved
    expect(migratedData.sessions[0].token).toBe('refresh_token_1');
    expect(migratedData.sessions[1].token).toBe('refresh_token_2');

    // Verify backup file was created
    const dir = path.dirname(testDbPath);
    const files = fs.readdirSync(dir);
    const backupFiles = files.filter((file) =>
      file.startsWith('migration-test-db.json.backup.'),
    );
    expect(backupFiles).toHaveLength(1);

    // Verify ID mapping file was created
    const mappingFiles = files.filter((file) =>
      file.startsWith('migration-test-db.json.id-mapping.'),
    );
    expect(mappingFiles).toHaveLength(1);

    // Verify mapping file content
    const mappingContent = JSON.parse(
      fs.readFileSync(path.join(dir, mappingFiles[0]), 'utf8'),
    );
    expect(mappingContent).toHaveLength(2);
    expect(mappingContent[0].oldId).toBe('1700000000001');
    expect(mappingContent[1].oldId).toBe('1700000000002');
    expect(uuidRegex.test(mappingContent[0].newId)).toBe(true);
    expect(uuidRegex.test(mappingContent[1].newId)).toBe(true);
  });

  test('should handle empty database gracefully', async () => {
    // Create empty test database
    const emptyData = {
      users: [],
      sessions: [],
      organizations: [],
      departments: [],
      staff: [],
      statuses: [],
      priorities: [],
      complexities: [],
      projects: [],
      tasks: [],
      taskAssignees: [],
      taskPredecessors: [],
      taskProgress: [],
      taskEvaluations: [],
      taskStatusReports: [],
      projectStatusReports: [],
    };

    fs.writeFileSync(testDbPath, JSON.stringify(emptyData, null, 2));

    // Run migration - should not throw
    await expect(testMigrateUserIds(testDbPath)).resolves.not.toThrow();

    // Verify backup was still created
    const dir = path.dirname(testDbPath);
    const files = fs.readdirSync(dir);
    const backupFiles = files.filter((file) =>
      file.startsWith('migration-test-db.json.backup.'),
    );
    expect(backupFiles).toHaveLength(1);
  });
});
