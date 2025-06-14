import { UserService } from '../src/services/user.service';
import { createDatabase } from '../src/utils/database.utils';
import type { Database } from '../src/types';
import fs from 'fs';
import path from 'path';

describe('User UUID Integration Test', () => {
  let db: Database;
  let userService: UserService;
  const testDbFile = path.join(__dirname, 'uuid-test-db.json');

  beforeEach(async () => {
    // Clean up any existing test file
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }

    // Create fresh database
    db = await createDatabase(testDbFile);
    userService = new UserService(db);
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
  });

  test('should create users with UUID format', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      note: 'Test note',
    };

    const user = await userService.createUser(userData);

    // Verify the ID is a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(user.id)).toBe(true);

    // Verify other fields are preserved
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.note).toBe(userData.note);

    // Verify user can be found by the new UUID
    const foundUser = userService.findById(user.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(user.id);
  });

  test('should create multiple users with different UUIDs', async () => {
    const user1 = await userService.createUser({
      email: 'user1@example.com',
      password: 'password123',
    });

    const user2 = await userService.createUser({
      email: 'user2@example.com',
      password: 'password123',
    });

    // Verify both have UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(user1.id)).toBe(true);
    expect(uuidRegex.test(user2.id)).toBe(true);

    // Verify they have different IDs
    expect(user1.id).not.toBe(user2.id);
  });
});
