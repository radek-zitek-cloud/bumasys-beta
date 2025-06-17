/**
 * @fileoverview Database service for unified access to auth and data databases
 *
 * This service provides a unified interface that combines both authentication
 * and data databases while maintaining backward compatibility with existing
 * services that expect a single Database interface.
 */

import logger from '../utils/logger';
import type { Database, AuthDatabase, DataDatabase } from '../types';
import { DatabaseManager } from '../utils/database-manager.utils';

/**
 * Database service that provides unified access to auth and data databases
 * while maintaining backward compatibility with the legacy Database interface
 */
export class DatabaseService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Get the database manager instance
   */
  getManager(): DatabaseManager {
    return this.dbManager;
  }

  /**
   * Get the authentication database
   */
  getAuthDatabase(): AuthDatabase {
    return this.dbManager.getAuthDatabase();
  }

  /**
   * Get the current data database
   */
  getDataDatabase(): DataDatabase {
    return this.dbManager.getDataDatabase();
  }

  /**
   * Get current database tag
   */
  getCurrentTag(): string {
    return this.dbManager.getCurrentTag();
  }

  /**
   * Switch to a different database tag
   * @param tag - The tag to switch to
   */
  async switchToTag(tag: string): Promise<void> {
    logger.info(
      { oldTag: this.getCurrentTag(), newTag: tag },
      'Switching database tag via service',
    );
    await this.dbManager.switchToTag(tag);
    logger.info({ tag }, 'Database tag switched successfully via service');
  }

  /**
   * Get a unified database interface for backward compatibility
   * This combines auth and data databases into a single interface
   */
  getUnifiedDatabase(): Database {
    const authDb = this.dbManager.getAuthDatabase();
    const dataDb = this.dbManager.getDataDatabase();

    return {
      get data() {
        return {
          // Auth data
          users: authDb.data.users,
          sessions: authDb.data.sessions,
          // Application data
          organizations: dataDb.data.organizations,
          departments: dataDb.data.departments,
          staff: dataDb.data.staff,
          statuses: dataDb.data.statuses,
          priorities: dataDb.data.priorities,
          complexities: dataDb.data.complexities,
          projects: dataDb.data.projects,
          tasks: dataDb.data.tasks,
          taskAssignees: dataDb.data.taskAssignees,
          taskPredecessors: dataDb.data.taskPredecessors,
          taskProgress: dataDb.data.taskProgress,
          taskEvaluations: dataDb.data.taskEvaluations,
          taskStatusReports: dataDb.data.taskStatusReports,
          projectStatusReports: dataDb.data.projectStatusReports,
          teams: dataDb.data.teams,
          teamMembers: dataDb.data.teamMembers,
        };
      },
      async write() {
        logger.debug(
          'Writing unified database - saving both auth and data databases',
        );
        await Promise.all([authDb.write(), dataDb.write()]);
        logger.debug('Unified database write completed successfully');
      },
    };
  }
}

/**
 * Create and initialize a database service instance
 *
 * @param authDbPath - Path to the authentication database file
 * @param dataDbBasePath - Base path for data database files
 * @param initialTag - Initial tag for data database (default: 'default')
 * @returns Promise resolving to DatabaseService instance
 */
export async function createDatabaseService(
  authDbPath: string,
  dataDbBasePath: string,
  initialTag: string = 'default',
): Promise<DatabaseService> {
  const { createDatabaseManager } = await import(
    '../utils/database-manager.utils'
  );
  const dbManager = await createDatabaseManager(
    authDbPath,
    dataDbBasePath,
    initialTag,
  );
  return new DatabaseService(dbManager);
}
