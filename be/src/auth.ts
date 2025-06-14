import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config';
import { Database } from './db';

let db: Database; // assigned during initialization

/**
 * Assign the active database instance used by auth functions.
 */
export function setDb(database: Database) {
  db = database;
}

/**
 * Generate JWT token for a user id.
 * @param id - User identifier
 * @returns Signed JWT
 */
export function signToken(id: string): string {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiresIn,
  });
}

/**
 * Generate long-lived refresh token and track it in database.
 * @param id - User identifier
 * @returns Signed refresh JWT
 */
export async function signRefreshToken(id: string): Promise<string> {
  const token = jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });

  // Store session in database
  db.data.sessions.push({
    token,
    userId: id,
    createdAt: new Date().toISOString(),
  });
  await db.write();

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
  // Check if token exists in database
  const session = db.data.sessions.find((s) => s.token === token);
  if (!session) {
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
export async function invalidateRefreshToken(token: string): Promise<void> {
  const index = db.data.sessions.findIndex((s) => s.token === token);
  if (index !== -1) {
    db.data.sessions.splice(index, 1);
    await db.write();
  }
}

/**
 * Remove all refresh tokens for a specific user.
 * @param userId - User identifier
 */
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  const initialLength = db.data.sessions.length;
  db.data.sessions = db.data.sessions.filter((s) => s.userId !== userId);

  // Only write to database if sessions were actually removed
  if (db.data.sessions.length !== initialLength) {
    await db.write();
  }
}
