/**
 * @fileoverview Database tag management resolvers
 *
 * This module contains GraphQL resolvers for database tag operations,
 * including switching between different data sets.
 */

import logger from '../utils/logger';
import type { GraphQLContext } from '../types';
import type { DatabaseService } from '../services/database.service';

// Service instances (will be set during initialization)
let databaseService: DatabaseService;

/**
 * Set service instances for database resolvers
 * @param dbService - DatabaseService instance
 */
export function setDatabaseServices(dbService: DatabaseService): void {
  databaseService = dbService;
}

/**
 * Database mutation resolvers
 */
export const databaseMutationResolvers = {
  /**
   * Switch to a different database tag
   * Creates a new database if the tag doesn't exist
   */
  dbtag: async (
    parent: unknown,
    args: { tag: string },
    context: GraphQLContext,
  ): Promise<boolean> => {
    if (!context.user) {
      throw new Error('Unauthenticated');
    }

    logger.info(
      { operation: 'dbtag', userId: context.user.id, tag: args.tag },
      'Switching database tag',
    );

    try {
      // Validate tag format (only allow alphanumeric and hyphens for security)
      const tagRegex = /^[a-zA-Z0-9-]+$/;
      if (!tagRegex.test(args.tag)) {
        throw new Error(
          'Invalid tag format. Only alphanumeric characters and hyphens are allowed.',
        );
      }

      // Prevent certain reserved tags
      const reservedTags = ['auth', 'sessions', 'system'];
      if (reservedTags.includes(args.tag.toLowerCase())) {
        throw new Error('Tag name is reserved and cannot be used.');
      }

      await databaseService.switchToTag(args.tag);

      logger.info(
        { operation: 'dbtag', userId: context.user.id, tag: args.tag },
        'Database tag switched successfully',
      );

      return true;
    } catch (error) {
      logger.error(
        { operation: 'dbtag', userId: context.user.id, tag: args.tag, error },
        'Failed to switch database tag',
      );
      throw error;
    }
  },

  /**
   * Create a backup of the current database
   * Returns the backup file path relative to the data directory
   */
  backupDatabase: async (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext,
  ): Promise<string> => {
    if (!context.user) {
      throw new Error('Unauthenticated');
    }

    logger.info(
      { operation: 'backupDatabase', userId: context.user.id },
      'Creating database backup',
    );

    try {
      const backupPath = await databaseService.createBackup();

      logger.info(
        { operation: 'backupDatabase', userId: context.user.id, backupPath },
        'Database backup created successfully',
      );

      return backupPath;
    } catch (error) {
      logger.error(
        { operation: 'backupDatabase', userId: context.user.id, error },
        'Failed to create database backup',
      );
      throw error;
    }
  },
};
