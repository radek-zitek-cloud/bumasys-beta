import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config';

/**
 * Generate JWT token for a user id.
 * @param id - User identifier
 * @returns Signed JWT
 */
export function signToken(id: string): string {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '15m' });
}

/**
 * Verify JWT token and return payload.
 * @param token - JWT string
 */
export function verifyToken(token: string): jwt.JwtPayload {
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
