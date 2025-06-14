/**
 * @fileoverview Authentication service module
 *
 * This module provides authentication-related functionality including
 * JWT token generation and verification, password hashing and comparison,
 * and session management for refresh tokens.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../utils/config';
import logger from '../utils/logger';
import type { Database, AuthPayload, LoginInput, SafeUser } from '../types';

/**
 * Service class for authentication operations
 */
export class AuthService {
  private db: Database;

  /**
   * Initialize the auth service with a database instance
   * @param database - The database instance to use for session management
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Generate JWT access token for a user
   * @param userId - User identifier to encode in the token
   * @returns Signed JWT access token
   */
  public signToken(userId: string): string {
    logger.debug({ operation: 'signToken', userId }, 'Generating access token');
    const token = jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.accessTokenExpiresIn,
    });
    logger.info({ operation: 'signToken', userId }, 'Access token generated successfully');
    return token;
  }

  /**
   * Generate long-lived refresh token and store in database
   * @param userId - User identifier to encode in the token
   * @returns Promise resolving to signed refresh JWT
   */
  public async signRefreshToken(userId: string): Promise<string> {
    logger.debug({ operation: 'signRefreshToken', userId }, 'Generating refresh token');
    
    const token = jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.refreshTokenExpiresIn,
    });

    // Store session in database for tracking
    this.db.data.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
    });
    await this.db.write();

    logger.info({ operation: 'signRefreshToken', userId }, 'Refresh token generated and stored successfully');
    return token;
  }

  /**
   * Verify JWT token and return payload
   * @param token - JWT string to verify
   * @returns Decoded JWT payload
   * @throws Error if token is invalid or expired
   */
  public verifyToken(token: string): jwt.JwtPayload {
    logger.debug({ operation: 'verifyToken' }, 'Verifying access token');
    
    try {
      const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
      logger.debug({ operation: 'verifyToken', userId: payload.id }, 'Access token verified successfully');
      return payload;
    } catch (error) {
      logger.warn({ operation: 'verifyToken', error: error instanceof Error ? error.message : String(error) }, 'Access token verification failed');
      throw error;
    }
  }

  /**
   * Validate refresh token existence in database and verify signature
   * @param token - Refresh JWT string to validate
   * @returns Decoded JWT payload
   * @throws Error if token is invalid, expired, or not found in database
   */
  public verifyRefreshToken(token: string): jwt.JwtPayload {
    logger.debug({ operation: 'verifyRefreshToken' }, 'Verifying refresh token');
    
    // Check if token exists in our session store
    const session = this.db.data.sessions.find((s) => s.token === token);
    if (!session) {
      logger.warn({ operation: 'verifyRefreshToken' }, 'Refresh token not found in session store');
      throw new Error('Invalid refresh token');
    }

    try {
      // Verify the token signature and expiration
      const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
      logger.debug({ operation: 'verifyRefreshToken', userId: payload.id }, 'Refresh token verified successfully');
      return payload;
    } catch (error) {
      logger.warn({ operation: 'verifyRefreshToken', error: error instanceof Error ? error.message : String(error) }, 'Refresh token verification failed');
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise resolving to authentication payload
   * @throws Error if credentials are invalid
   */
  public async authenticateUser(credentials: LoginInput): Promise<AuthPayload> {
    logger.debug({ operation: 'authenticateUser', email: credentials.email }, 'Authenticating user');
    
    // Find user by email
    const user = this.db.data.users.find((u) => u.email === credentials.email);
    if (!user) {
      logger.warn({ operation: 'authenticateUser', email: credentials.email }, 'User not found during authentication');
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(
      credentials.password,
      user.password,
    );
    if (!isValidPassword) {
      logger.warn({ operation: 'authenticateUser', email: credentials.email, userId: user.id }, 'Invalid password during authentication');
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.signToken(user.id);
    const refreshToken = await this.signRefreshToken(user.id);

    // Return auth payload without password
    const { password, ...safeUser } = user;
    
    logger.info({ operation: 'authenticateUser', email: credentials.email, userId: user.id }, 'User authenticated successfully');
    
    return {
      token: accessToken,
      refreshToken,
      user: safeUser as SafeUser,
    };
  }

  /**
   * Refresh an access token using a valid refresh token
   * @param refreshToken - Valid refresh token
   * @returns Promise resolving to new authentication payload
   * @throws Error if refresh token is invalid
   */
  public async refreshAccessToken(refreshToken: string): Promise<AuthPayload> {
    // Verify and get user ID from refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Invalidate the old refresh token
    await this.invalidateRefreshToken(refreshToken);

    // Find the user
    const user = this.db.data.users.find((u) => u.id === payload.id);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = this.signToken(user.id);
    const newRefreshToken = await this.signRefreshToken(user.id);

    // Return new auth payload
    const { password, ...safeUser } = user;
    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: safeUser as SafeUser,
    };
  }

  /**
   * Remove a specific refresh token from the active session store
   * @param token - Refresh token to invalidate
   * @returns Promise that resolves when token is removed
   */
  public async invalidateRefreshToken(token: string): Promise<void> {
    const index = this.db.data.sessions.findIndex((s) => s.token === token);
    if (index !== -1) {
      this.db.data.sessions.splice(index, 1);
      await this.db.write();
    }
  }

  /**
   * Remove all refresh tokens for a specific user (logout from all devices)
   * @param userId - User identifier whose tokens should be invalidated
   * @returns Promise that resolves when all user tokens are removed
   */
  public async invalidateAllUserTokens(userId: string): Promise<void> {
    const initialLength = this.db.data.sessions.length;
    this.db.data.sessions = this.db.data.sessions.filter(
      (s) => s.userId !== userId,
    );

    // Only write to database if sessions were actually removed
    if (this.db.data.sessions.length !== initialLength) {
      await this.db.write();
    }
  }

  /**
   * Logout user by invalidating their refresh token
   * @param refreshToken - Refresh token to invalidate
   * @returns Promise resolving to true when logout is complete
   */
  public async logout(refreshToken: string): Promise<boolean> {
    // Verify token to get user ID, then invalidate all user tokens
    const payload = this.verifyRefreshToken(refreshToken);
    await this.invalidateAllUserTokens(payload.id);
    return true;
  }
}

/**
 * Hash a password using bcrypt with salt
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hash
 * @param password - Plain text password to check
 * @param hash - Stored password hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
