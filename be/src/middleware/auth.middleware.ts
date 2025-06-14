/**
 * @fileoverview Authentication middleware
 *
 * This module provides Express middleware functions for handling authentication
 * in GraphQL context and other authentication-related middleware.
 */

import type { Request } from 'express';
import type { GraphQLContext } from '../types';
import { AuthService, UserService } from '../services';
import logger from '../utils/logger';

/**
 * Service instances for authentication operations
 */
let authService: AuthService;
let userService: UserService;

/**
 * Initialize middleware with service instances
 * @param auth - AuthService instance
 * @param user - UserService instance
 */
export function initializeAuthMiddleware(
  auth: AuthService,
  user: UserService,
): void {
  authService = auth;
  userService = user;
}

/**
 * GraphQL context factory for Apollo Server
 * Extracts and verifies JWT tokens from Authorization header
 *
 * @param request - Express request object containing headers
 * @returns GraphQL context object with user information if authenticated
 */
export async function createGraphQLContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
  const authHeader = req.headers.authorization || '';
  logger.debug(
    { operation: 'createGraphQLContext', hasAuthHeader: !!authHeader },
    'Creating GraphQL context',
  );

  // Check if Authorization header contains a Bearer token
  if (authHeader.startsWith('Bearer ')) {
    try {
      // Extract token from "Bearer <token>" format
      const token = authHeader.slice(7);
      logger.debug(
        { operation: 'createGraphQLContext' },
        'Extracted Bearer token from header',
      );

      // Verify the token and extract user ID
      const payload = authService.verifyToken(token);

      // Find the user in the database
      const user = userService.findById(payload.id);

      if (user) {
        logger.debug(
          { operation: 'createGraphQLContext', userId: user.id },
          'User authenticated successfully',
        );
        // Return context with user information (without password)
        return {
          user: {
            id: user.id,
            email: user.email,
          },
        };
      } else {
        logger.warn(
          { operation: 'createGraphQLContext', userId: payload.id },
          'Token valid but user not found in database',
        );
      }
    } catch (error) {
      // Log invalid token attempts for security monitoring
      logger.warn('Invalid token in Authorization header', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    }
  }

  // Return empty context if no valid authentication
  logger.debug(
    { operation: 'createGraphQLContext' },
    'No valid authentication found, returning empty context',
  );
  return {};
}

/**
 * Express middleware for protecting routes (optional utility)
 * Can be used for REST endpoints that require authentication
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requireAuth(req: Request, res: any, next: any): void {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  try {
    const token = authHeader.slice(7);
    const payload = authService.verifyToken(token);
    const user = userService.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object for downstream handlers
    (req as any).user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    return res.status(401).json({ error: 'Invalid token' });
  }
}
