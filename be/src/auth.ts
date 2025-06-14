/**
 * @fileoverview Authentication module
 *
 * This module provides authentication functionality and is kept for
 * backward compatibility with existing code. New code should use
 * the AuthService class from services/auth.service.ts
 *
 * @deprecated This module is kept for backward compatibility.
 * New code should use AuthService from services/auth.service.ts
 */

import type { Database } from './types';

// Re-export functions from the new service for backward compatibility
export { hashPassword, comparePassword } from './services';

/**
 * Legacy authentication utilities - kept for backward compatibility
 */

let authService: import('./services').AuthService;

/**
 * Assign the active database instance used by auth functions.
 * @deprecated Use AuthService constructor instead
 * @param database - Database instance
 */
export function setDb(database: Database): void {
  const { AuthService } = require('./services');
  authService = new AuthService(database);
}

/**
 * Generate JWT token for a user id.
 * @deprecated Use AuthService.signToken instead
 * @param id - User identifier
 * @returns Signed JWT
 */
export function signToken(id: string): string {
  return authService.signToken(id);
}

/**
 * Generate long-lived refresh token and track it in database.
 * @deprecated Use AuthService.signRefreshToken instead
 * @param id - User identifier
 * @returns Promise resolving to signed refresh JWT
 */
export async function signRefreshToken(id: string): Promise<string> {
  return authService.signRefreshToken(id);
}

/**
 * Verify JWT token and return payload.
 * @deprecated Use AuthService.verifyToken instead
 * @param token - JWT string
 */
export function verifyToken(token: string): import('jsonwebtoken').JwtPayload {
  return authService.verifyToken(token);
}

/**
 * Validate refresh token existence and signature.
 * @deprecated Use AuthService.verifyRefreshToken instead
 * @param token - Refresh JWT string
 */
export function verifyRefreshToken(
  token: string,
): import('jsonwebtoken').JwtPayload {
  return authService.verifyRefreshToken(token);
}

/**
 * Remove a refresh token from the active set.
 * @deprecated Use AuthService.invalidateRefreshToken instead
 * @param token - Refresh token to invalidate
 */
export async function invalidateRefreshToken(token: string): Promise<void> {
  return authService.invalidateRefreshToken(token);
}

/**
 * Remove all refresh tokens for a specific user.
 * @deprecated Use AuthService.invalidateAllUserTokens instead
 * @param userId - User identifier
 */
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  return authService.invalidateAllUserTokens(userId);
}
