/**
 * @fileoverview Unit tests for AuthService
 * 
 * Tests authentication service functionality including token generation,
 * password hashing, user authentication, and session management.
 */

import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service';
import type { Database, User } from '../../../src/types';

// Mock dependencies
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation((plain, hashed) => {
    // Mock successful comparison for the specific test password
    return Promise.resolve(plain === 'password123' && hashed === '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LPTPMmNbbFfiFXr9K');
  }),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('../../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock dependencies first
jest.mock('../../../src/utils/config', () => ({
  __esModule: true,
  default: {
    jwtSecret: 'test-secret-key-for-testing',
    accessTokenExpiresIn: '60m',
    refreshTokenExpiresIn: '7d',
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
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

    authService = new AuthService(mockDatabase);
  });

  describe('signToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const token = authService.signToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token payload
      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;
      expect(decoded.id).toBe(userId);
    });

    it('should include expiration in token', () => {
      const userId = 'user123';
      const token = authService.signToken(userId);

      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('signRefreshToken', () => {
    it('should generate a refresh token and store it in database', async () => {
      const userId = 'user123';
      const refreshToken = await authService.signRefreshToken(userId);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      // Verify token is stored in database
      expect(mockDatabase.data.sessions).toHaveLength(1);
      expect(mockDatabase.data.sessions[0].token).toBe(refreshToken);
      expect(mockDatabase.data.sessions[0].userId).toBe(userId);
      expect(mockDatabase.write).toHaveBeenCalled();
    });

    it('should generate tokens with same content but different timing', async () => {
      const userId = 'user123';
      const token1 = await authService.signRefreshToken(userId);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const token2 = await authService.signRefreshToken(userId);

      // Both tokens should be valid but may have different timestamps
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(mockDatabase.data.sessions).toHaveLength(2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid tokens', () => {
      const userId = 'user123';
      const token = authService.signToken(userId);

      const payload = authService.verifyToken(token);
      expect(payload.id).toBe(userId);
    });

    it('should throw error for invalid tokens', () => {
      const invalidToken = 'invalid-token';

      expect(() => authService.verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired tokens', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: 'user123' },
        'test-secret-key-for-testing',
        { expiresIn: '-1s' }
      );

      expect(() => authService.verifyToken(expiredToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh tokens', async () => {
      const userId = 'user123';
      const refreshToken = await authService.signRefreshToken(userId);

      const payload = authService.verifyRefreshToken(refreshToken);
      expect(payload.id).toBe(userId);
    });

    it('should throw error for tokens not in session store', () => {
      // Create a valid JWT but not in session store
      const validJWT = jwt.sign(
        { id: 'user123' },
        'test-secret-key-for-testing',
        { expiresIn: '7d' }
      );

      expect(() => authService.verifyRefreshToken(validJWT)).toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should remove refresh token from session store', async () => {
      const userId = 'user123';
      const refreshToken = await authService.signRefreshToken(userId);

      expect(mockDatabase.data.sessions).toHaveLength(1);

      await authService.invalidateRefreshToken(refreshToken);

      expect(mockDatabase.data.sessions).toHaveLength(0);
      expect(mockDatabase.write).toHaveBeenCalledTimes(2); // Once for creation, once for deletion
    });

    it('should not throw error if token not found', async () => {
      const nonExistentToken = 'non-existent-token';

      await expect(
        authService.invalidateRefreshToken(nonExistentToken)
      ).resolves.not.toThrow();
    });
  });

  describe('invalidateAllUserTokens', () => {
    it('should remove all tokens for a specific user', async () => {
      const userId1 = 'user1';
      const userId2 = 'user2';

      await authService.signRefreshToken(userId1);
      await authService.signRefreshToken(userId1);
      await authService.signRefreshToken(userId2);

      expect(mockDatabase.data.sessions).toHaveLength(3);

      await authService.invalidateAllUserTokens(userId1);

      expect(mockDatabase.data.sessions).toHaveLength(1);
      expect(mockDatabase.data.sessions[0].userId).toBe(userId2);
    });
  });

  describe('authenticateUser', () => {
    beforeEach(() => {
      // Add a test user to the database
      mockDatabase.data.users.push({
        id: 'user123',
        email: 'test@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LPTPMmNbbFfiFXr9K', // "password123"
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should authenticate user with correct credentials', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.authenticateUser(loginInput);

      expect(result).toBeDefined();
      expect(result.user.id).toBe('user123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.authenticateUser(loginInput)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error for incorrect password', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.authenticateUser(loginInput)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const userId = 'user123';
      
      // Add user to database so refresh token validation works
      mockDatabase.data.users.push({
        id: userId,
        email: 'test@example.com',
        password: 'hashed-password',
      });
      
      const refreshToken = await authService.signRefreshToken(userId);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBe(refreshToken); // Same refresh token

      // Verify new access token contains correct user ID
      const decoded = jwt.verify(result.token, 'test-secret-key-for-testing') as any;
      expect(decoded.id).toBe(userId);
    });

    it('should throw error for invalid refresh token', async () => {
      const invalidToken = 'invalid-token';

      await expect(authService.refreshAccessToken(invalidToken)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token on logout', async () => {
      const userId = 'user123';
      const refreshToken = await authService.signRefreshToken(userId);

      expect(mockDatabase.data.sessions).toHaveLength(1);

      await authService.logout(refreshToken);

      expect(mockDatabase.data.sessions).toHaveLength(0);
    });

    it('should throw error if token is invalid during logout', async () => {
      const invalidToken = 'invalid-token';

      await expect(authService.logout(invalidToken)).rejects.toThrow();
    });
  });
});