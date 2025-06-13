import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config';

/** In-memory set of active refresh tokens */
const refreshTokens = new Set<string>();

/**
 * Generate JWT token for a user id.
 * @param id - User identifier
 * @returns Signed JWT
 */
export function signToken(id: string): string {
  return jwt.sign({ id }, config.jwtSecret as string, { expiresIn: config.expiresIn as string});
}

/**
 * Generate long-lived refresh token and track it in memory.
 * @param id - User identifier
 * @returns Signed refresh JWT
 */
export function signRefreshToken(id: string): string {
  const token = jwt.sign({ id }, config.jwtSecret as string, { expiresIn: config.refreshExpiresIn as string });
  refreshTokens.add(token);
  return token;
}

/**
 * Verify JWT token and return payload.
 * @param token - JWT string
 */
export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
}

/**
 * Validate refresh token existence and signature.
 * @param token - Refresh JWT string
 */
export function verifyRefreshToken(token: string): jwt.JwtPayload {
  if (!refreshTokens.has(token)) {
    throw new Error('Invalid refresh token');
  }
  return jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
}

/**
 * Hash password using bcrypt.
 * @param password - Plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password to hash.
 * @param password - Plain text password
 * @param hash - Stored password hash
 */
export function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Remove a refresh token from the active set.
 * @param token - Refresh token to invalidate
 */
export function invalidateRefreshToken(token: string): void {
  refreshTokens.delete(token);
}
