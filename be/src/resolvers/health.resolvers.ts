/**
 * @fileoverview Health check and system configuration resolvers
 *
 * This module contains GraphQL resolvers for system monitoring including
 * health checks and configuration access with sensitive data redaction.
 */

import logger from '../utils/logger';
import config from '../utils/config';

/**
 * User service instance - will be set during application initialization
 * Used as a health indicator to verify service initialization
 */
let userService: any;

/**
 * Set the service instances for health check resolvers to use
 * @param user - UserService instance used for health verification
 */
export function setServices(user: any): void {
  userService = user;
}

/**
 * Health check and system monitoring query resolvers
 * Contains resolvers for health monitoring, server status verification, and configuration access
 */
export const healthResolvers = {
  /**
   * Health check resolver to verify server readiness
   * @returns true when database connection is available and services are initialized
   */
  health: (): boolean => {
    logger.debug({ operation: 'health' }, 'Processing health check');
    const isHealthy = Boolean(userService);
    logger.info({ operation: 'health', isHealthy }, 'Health check completed');
    return isHealthy;
  },

  /**
   * Get backend configuration with sensitive values excluded
   * @returns Configuration object without sensitive information
   */
  config: () => {
    // Return a shallow copy of config with sensitive keys completely removed
    const redactKeys = ['sourcetoken', 'password', 'jwtsecret'];
    function redact(obj: any, key?: string): any {
      if (Array.isArray(obj)) {
        return obj.map((item) => redact(item));
      }
      if (obj && typeof obj === 'object') {
        const result: Record<string, any> = {};
        for (const objKey of Object.keys(obj)) {
          if (redactKeys.some((rk) => objKey.toLowerCase() === rk)) {
            // Completely exclude sensitive keys from result
            continue;
          } else {
            result[objKey] = redact(obj[objKey], objKey);
          }
        }
        return result;
      }
      // For dbFile, return only the filename for security
      if (key === 'dbFile' && typeof obj === 'string') {
        return obj.split(/[/\\]/).pop() || obj;
      }
      return obj;
    }
    // Return the entire loaded config object, with sensitive values redacted
    return redact({ ...config });
  },
};
