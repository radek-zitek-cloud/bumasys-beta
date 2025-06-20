/**
 * @fileoverview Database manager for handling multiple databases
 *
 * This module provides functionality to manage both authentication database
 * (auth.json) and tagged application data databases (db-{tag}.json).
 * It implements the multiple database system as required.
 */

import fs from 'fs';
import path from 'path';
import logger from './logger';
import type { AuthDatabase, DataDatabase } from '../types';

/**
 * Database manager class that handles both auth and data databases
 */
export class DatabaseManager {
  private authDb!: AuthDatabase;
  private dataDb!: DataDatabase;
  private authDbPath: string;
  private dataDbBasePath: string;
  private currentTag: string;

  constructor(
    authDbPath: string,
    dataDbBasePath: string,
    initialTag: string = 'default',
  ) {
    this.authDbPath = path.resolve(authDbPath);
    this.dataDbBasePath = path.resolve(dataDbBasePath);
    this.currentTag = initialTag;

    logger.info(
      {
        authDbPath: this.authDbPath,
        dataDbBasePath: this.dataDbBasePath,
        initialTag,
      },
      'Initializing database manager',
    );
  }

  /**
   * Initialize both authentication and data databases
   */
  async initialize(): Promise<void> {
    logger.info('Initializing database manager...');

    // Initialize auth database
    this.authDb = await this.createAuthDatabase(this.authDbPath);

    // Initialize data database with current tag
    this.dataDb = await this.createDataDatabase(this.currentTag);

    logger.info(
      { tag: this.currentTag },
      'Database manager initialized successfully',
    );
  }

  /**
   * Get the authentication database instance
   */
  getAuthDatabase(): AuthDatabase {
    return this.authDb;
  }

  /**
   * Get the current data database instance
   */
  getDataDatabase(): DataDatabase {
    return this.dataDb;
  }

  /**
   * Get the current database tag
   */
  getCurrentTag(): string {
    return this.currentTag;
  }

  /**
   * Switch to a different database tag
   * @param tag - The tag to switch to
   */
  async switchToTag(tag: string): Promise<void> {
    logger.info(
      { oldTag: this.currentTag, newTag: tag },
      'Switching database tag',
    );

    // Log some data from the old database for debugging
    const oldDataCount = this.dataDb.data.organizations?.length || 0;
    logger.debug(
      { oldTag: this.currentTag, organizationCount: oldDataCount },
      'Old database data count before switch',
    );

    this.currentTag = tag;
    this.dataDb = await this.createDataDatabase(tag);

    // Log some data from the new database for debugging
    const newDataCount = this.dataDb.data.organizations?.length || 0;
    logger.info(
      {
        tag,
        oldOrganizationCount: oldDataCount,
        newOrganizationCount: newDataCount,
        dataDbPath: `db-${tag}.json`,
      },
      'Database tag switched successfully with data verification',
    );
  }

  /**
   * Create a backup of the current database
   * @returns Promise resolving to the backup file path relative to the data directory
   */
  async createBackup(): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    
    logger.info(
      { currentTag: this.currentTag },
      'Creating database backup',
    );

    // Create timestamp for backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${this.currentTag}-${timestamp}.json`;
    
    // Get the data directory from the base path
    const dataDir = path.dirname(this.dataDbBasePath);
    const backupPath = path.join(dataDir, 'backups', backupFileName);
    
    // Ensure backup directory exists
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      logger.debug(
        { operation: 'createBackup', backupDir },
        'Creating backup directory',
      );
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      // Create backup data containing both auth and current data database
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tag: this.currentTag,
        auth: this.authDb.data,
        data: this.dataDb.data,
      };

      // Write backup file atomically
      const tempBackupPath = `${backupPath}.tmp`;
      fs.writeFileSync(tempBackupPath, JSON.stringify(backupData, null, 2));
      fs.renameSync(tempBackupPath, backupPath);

      // Return relative path from data directory
      const relativePath = path.relative(dataDir, backupPath);
      
      logger.info(
        { operation: 'createBackup', backupPath: relativePath, tag: this.currentTag },
        'Database backup created successfully',
      );

      return relativePath;
    } catch (error) {
      logger.error(
        { operation: 'createBackup', backupPath, tag: this.currentTag, error },
        'Failed to create database backup',
      );
      throw new Error(`Failed to create database backup: ${(error as Error).message}`);
    }
  }

  /**
   * Create and initialize authentication database
   */
  private async createAuthDatabase(filePath: string): Promise<AuthDatabase> {
    const dbPath = path.resolve(filePath);
    logger.debug(
      { operation: 'createAuthDatabase', dbPath },
      'Creating auth database instance',
    );

    // Create database file if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      logger.info(
        { operation: 'createAuthDatabase', dbPath },
        'Auth database file does not exist, creating new one',
      );

      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        logger.debug(
          { operation: 'createAuthDatabase', dir },
          'Creating auth database directory',
        );
        fs.mkdirSync(dir, { recursive: true });
      }

      const initialData = {
        users: [],
        sessions: [],
      };

      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      logger.info(
        { operation: 'createAuthDatabase', dbPath },
        'New auth database file created successfully',
      );
    } else {
      logger.debug(
        { operation: 'createAuthDatabase', dbPath },
        'Using existing auth database file',
      );
    }

    // Load existing data
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Ensure required arrays exist for backward compatibility
    if (!data.users) {
      data.users = [];
    }
    if (!data.sessions) {
      data.sessions = [];
    }

    // Return auth database interface
    logger.info(
      { operation: 'createAuthDatabase', dbPath },
      'Auth database instance created successfully',
    );
    return {
      get data() {
        return data;
      },
      async write() {
        logger.debug(
          { operation: 'authDatabaseWrite', dbPath },
          'Writing auth database to disk',
        );
        // Write data atomically by writing to temp file first
        const tempPath = `${dbPath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
        fs.renameSync(tempPath, dbPath);
        logger.debug(
          { operation: 'authDatabaseWrite', dbPath },
          'Auth database write completed successfully',
        );
      },
    };
  }

  /**
   * Create and initialize data database for a specific tag
   */
  private async createDataDatabase(tag: string): Promise<DataDatabase> {
    const fileName = `db-${tag}.json`;
    const dbPath = path.resolve(path.dirname(this.dataDbBasePath), fileName);
    logger.debug(
      { operation: 'createDataDatabase', dbPath, tag },
      'Creating data database instance',
    );

    // Create database file if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      logger.info(
        { operation: 'createDataDatabase', dbPath, tag },
        'Data database file does not exist, creating new one',
      );

      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        logger.debug(
          { operation: 'createDataDatabase', dir },
          'Creating data database directory',
        );
        fs.mkdirSync(dir, { recursive: true });
      }

      const initialData = {
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
      };

      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      logger.info(
        { operation: 'createDataDatabase', dbPath, tag },
        'New data database file created successfully',
      );
    } else {
      logger.debug(
        { operation: 'createDataDatabase', dbPath, tag },
        'Using existing data database file',
      );
    }

    // Load existing data
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Ensure all required arrays exist for backward compatibility
    const defaultArrays = [
      'organizations',
      'departments',
      'staff',
      'statuses',
      'priorities',
      'complexities',
      'projects',
      'tasks',
      'taskAssignees',
      'taskPredecessors',
      'taskProgress',
      'taskEvaluations',
      'taskStatusReports',
      'projectStatusReports',
      'teams',
      'teamMembers',
    ];

    for (const arrayName of defaultArrays) {
      if (!data[arrayName]) {
        data[arrayName] = [];
      }
    }

    // Return data database interface
    logger.info(
      { operation: 'createDataDatabase', dbPath, tag },
      'Data database instance created successfully',
    );
    return {
      get data() {
        return data;
      },
      get tag() {
        return tag;
      },
      async write() {
        logger.debug(
          { operation: 'dataDatabaseWrite', dbPath, tag },
          'Writing data database to disk',
        );
        // Write data atomically by writing to temp file first
        const tempPath = `${dbPath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
        fs.renameSync(tempPath, dbPath);
        logger.debug(
          { operation: 'dataDatabaseWrite', dbPath, tag },
          'Data database write completed successfully',
        );
      },
    };
  }
}

/**
 * Create and initialize a database manager instance
 *
 * @param authDbPath - Path to the authentication database file
 * @param dataDbBasePath - Base path for data database files (used to determine directory)
 * @param initialTag - Initial tag for data database (default: 'default')
 * @returns Promise resolving to DatabaseManager instance
 */
export async function createDatabaseManager(
  authDbPath: string,
  dataDbBasePath: string,
  initialTag: string = 'default',
): Promise<DatabaseManager> {
  const manager = new DatabaseManager(authDbPath, dataDbBasePath, initialTag);
  await manager.initialize();
  return manager;
}
