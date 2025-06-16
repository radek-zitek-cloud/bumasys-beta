/**
 * @fileoverview Unit tests for UserService
 *
 * Tests user management functionality including user creation, updates,
 * deletion, retrieval, and password management.
 */

import { UserService } from '../../../src/services/user.service';
import type { Database, User, RegisterInput } from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/auth.service', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest
    .fn()
    .mockImplementation((plain, hashed) =>
      Promise.resolve(
        plain === 'correct-password' && hashed === 'hashed-password',
      ),
    ),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockDatabase: Database;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDatabase = {
      data: {
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
        teams: [],
        teamMembers: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    userService = new UserService(mockDatabase);
  });

  describe('findByEmail', () => {
    beforeEach(() => {
      mockDatabase.data.users.push({
        id: 'user1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should find user by email', () => {
      const user = userService.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.id).toBe('user1');
    });

    it('should return undefined for non-existent email', () => {
      const user = userService.findByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
    });

    it('should be case-sensitive by default (no case-insensitive search)', () => {
      const user = userService.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeUndefined(); // Should not find due to case mismatch
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockDatabase.data.users.push({
        id: 'user1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should find user by ID', () => {
      const user = userService.findById('user1');

      expect(user).toBeDefined();
      expect(user?.id).toBe('user1');
      expect(user?.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent ID', () => {
      const user = userService.findById('nonexistent-id');

      expect(user).toBeUndefined();
    });
  });

  describe('getAllUsers', () => {
    beforeEach(() => {
      mockDatabase.data.users.push(
        {
          id: 'user1',
          email: 'user1@example.com',
          password: 'hashed-password',
          firstName: 'User',
          lastName: 'One',
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          password: 'hashed-password',
          firstName: 'User',
          lastName: 'Two',
        },
      );
    });

    it('should return all users without passwords', async () => {
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty('password');
      expect(users[1]).not.toHaveProperty('password');
      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
    });

    it('should return empty array when no users exist', async () => {
      mockDatabase.data.users = [];
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(0);
    });
  });

  describe('createUser', () => {
    it('should create a new user with all fields', async () => {
      const registerInput: RegisterInput = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        note: 'Test user',
      };

      const user = await userService.createUser(registerInput);

      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.firstName).toBe('New');
      expect(user.lastName).toBe('User');
      expect(user.note).toBe('Test user');
      expect(user).not.toHaveProperty('password'); // Safe user returned

      // Verify user was added to database
      expect(mockDatabase.data.users).toHaveLength(1);
      expect(mockDatabase.data.users[0].password).toBe('hashed-password');
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should create user with minimal fields', async () => {
      const registerInput: RegisterInput = {
        email: 'minimal@example.com',
        password: 'password123',
      };

      const user = await userService.createUser(registerInput);

      expect(user).toBeDefined();
      expect(user.email).toBe('minimal@example.com');
      expect(user.firstName).toBeUndefined();
      expect(user.lastName).toBeUndefined();
      expect(user.note).toBeUndefined();
    });

    it('should throw error if email already exists', async () => {
      // Add existing user
      mockDatabase.data.users.push({
        id: 'existing-user',
        email: 'existing@example.com',
        password: 'hashed-password',
      });

      const registerInput: RegisterInput = {
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(userService.createUser(registerInput)).rejects.toThrow(
        'Email in use',
      );
    });

    it('should allow case-sensitive email creation (no case-insensitive uniqueness)', async () => {
      // Add existing user with lowercase email
      mockDatabase.data.users.push({
        id: 'existing-user',
        email: 'existing@example.com',
        password: 'hashed-password',
      });

      const registerInput: RegisterInput = {
        email: 'EXISTING@EXAMPLE.COM',
        password: 'password123',
      };

      // Should succeed since email matching is case-sensitive
      const user = await userService.createUser(registerInput);
      expect(user).toBeDefined();
      expect(user.email).toBe('EXISTING@EXAMPLE.COM');
    });

    it('should generate unique user ID', async () => {
      const registerInput1: RegisterInput = {
        email: 'user1@example.com',
        password: 'password123',
      };

      const registerInput2: RegisterInput = {
        email: 'user2@example.com',
        password: 'password123',
      };

      const user1 = await userService.createUser(registerInput1);
      const user2 = await userService.createUser(registerInput2);

      expect(user1.id).not.toBe(user2.id);
      expect(mockDatabase.data.users).toHaveLength(2);
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      mockDatabase.data.users.push({
        id: 'user1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Original',
        lastName: 'User',
        note: 'Original note',
      });
    });

    it('should update user fields', async () => {
      const updateData = {
        id: 'user1',
        firstName: 'Updated',
        lastName: 'Name',
        note: 'Updated note',
      };

      const updatedUser = await userService.updateUser(updateData);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.note).toBe('Updated note');
      expect(updatedUser.email).toBe('test@example.com'); // Unchanged
      expect(updatedUser).not.toHaveProperty('password'); // Safe user returned

      // Verify database was updated
      const dbUser = mockDatabase.data.users[0];
      expect(dbUser.firstName).toBe('Updated');
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should update partial fields', async () => {
      const updateData = {
        id: 'user1',
        firstName: 'OnlyFirstName',
      };

      const updatedUser = await userService.updateUser(updateData);

      expect(updatedUser.firstName).toBe('OnlyFirstName');
      expect(updatedUser.lastName).toBe('User'); // Unchanged
      expect(updatedUser.note).toBe('Original note'); // Unchanged
    });

    it('should throw error if user not found', async () => {
      const updateData = {
        id: 'nonexistent-user',
        firstName: 'Updated',
      };

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'User not found',
      );
    });

    it('should ignore email changes for security', async () => {
      const updateData = {
        id: 'user1',
        email: 'new@example.com',
        firstName: 'Updated',
      };

      const updatedUser = await userService.updateUser(updateData);

      // Email should remain unchanged
      expect(updatedUser.email).toBe('test@example.com');
      // Other fields should be updated
      expect(updatedUser.firstName).toBe('Updated');

      // Verify database shows original email
      const dbUser = mockDatabase.data.users[0];
      expect(dbUser.email).toBe('test@example.com');
      expect(dbUser.firstName).toBe('Updated');
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      mockDatabase.data.users.push(
        {
          id: 'user1',
          email: 'user1@example.com',
          password: 'hashed-password',
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          password: 'hashed-password',
        },
      );

      // Add related sessions
      mockDatabase.data.sessions.push(
        { token: 'token1', userId: 'user1', createdAt: '2024-01-01' },
        { token: 'token2', userId: 'user2', createdAt: '2024-01-01' },
      );
    });

    it('should delete user (but not sessions in current implementation)', async () => {
      const result = await userService.deleteUser('user1');

      expect(result).toBe(true);
      expect(mockDatabase.data.users).toHaveLength(1);
      expect(mockDatabase.data.users[0].id).toBe('user2');

      // Note: Current implementation doesn't remove related sessions
      expect(mockDatabase.data.sessions).toHaveLength(2);
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should return false if user not found', async () => {
      const result = await userService.deleteUser('nonexistent-user');
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      mockDatabase.data.users.push({
        id: 'user1',
        email: 'test@example.com',
        password: 'hashed-password',
      });
    });

    it('should change password with correct old password', async () => {
      const result = await userService.changePassword(
        'user1',
        'correct-password',
        'new-password',
      );

      expect(result).toBe(true);
      expect(mockDatabase.data.users[0].password).toBe('hashed-password'); // Updated by mock
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should throw error for incorrect old password', async () => {
      await expect(
        userService.changePassword('user1', 'wrong-password', 'new-password'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      await expect(
        userService.changePassword(
          'nonexistent-user',
          'old-password',
          'new-password',
        ),
      ).rejects.toThrow('User not found');
    });
  });
});
