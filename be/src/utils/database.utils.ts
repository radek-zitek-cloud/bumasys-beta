/**
 * @fileoverview Database utilities
 *
 * This module provides utility functions for database operations
 * and database-related helper functions.
 */

import fs from 'fs';
import path from 'path';
import logger from './logger';
import type { Database } from '../types';

/**
 * Create and initialize a JSON file-based database
 *
 * @param filePath - Path to the JSON database file
 * @returns Promise resolving to Database instance
 */
export async function createDatabase(filePath: string): Promise<Database> {
  const dbPath = path.resolve(filePath);
  logger.debug({ operation: 'createDatabase', dbPath }, 'Creating database instance');

  // Create database file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    logger.info({ operation: 'createDatabase', dbPath }, 'Database file does not exist, creating new one');
    
    const initialData = {
      users: [],
      sessions: [],
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
    };

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      logger.debug({ operation: 'createDatabase', dir }, 'Creating database directory');
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    logger.info({ operation: 'createDatabase', dbPath }, 'New database file created successfully');
  } else {
    logger.debug({ operation: 'createDatabase', dbPath }, 'Using existing database file');
  }

  // Load existing data
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(rawData);

  // Ensure sessions array exists for backward compatibility
  if (!data.sessions) {
    data.sessions = [];
  }

  // Ensure organization arrays exist for backward compatibility
  if (!data.organizations) {
    data.organizations = [];
  }
  if (!data.departments) {
    data.departments = [];
  }
  if (!data.staff) {
    data.staff = [];
  }

  // Ensure project and task arrays exist for backward compatibility
  if (!data.statuses) {
    data.statuses = [];
  }
  if (!data.priorities) {
    data.priorities = [];
  }
  if (!data.complexities) {
    data.complexities = [];
  }
  if (!data.projects) {
    data.projects = [];
  }
  if (!data.tasks) {
    data.tasks = [];
  }
  if (!data.taskAssignees) {
    data.taskAssignees = [];
  }
  if (!data.taskPredecessors) {
    data.taskPredecessors = [];
  }
  if (!data.taskProgress) {
    data.taskProgress = [];
  }
  if (!data.taskEvaluations) {
    data.taskEvaluations = [];
  }
  if (!data.taskStatusReports) {
    data.taskStatusReports = [];
  }
  if (!data.projectStatusReports) {
    data.projectStatusReports = [];
  }

  // Return database interface
  logger.info({ operation: 'createDatabase', dbPath }, 'Database instance created successfully');
  return {
    get data() {
      return data;
    },
    async write() {
      logger.debug({ operation: 'databaseWrite', dbPath }, 'Writing database to disk');
      // Write data atomically by writing to temp file first
      const tempPath = `${dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, dbPath);
      logger.debug({ operation: 'databaseWrite', dbPath }, 'Database write completed successfully');
    },
  };
}

/**
 * Validate database structure and repair if necessary
 *
 * @param database - Database instance to validate
 * @returns Promise resolving when validation is complete
 */
export async function validateDatabase(database: Database): Promise<void> {
  const data = database.data;

  // Ensure required arrays exist
  if (!Array.isArray(data.users)) {
    data.users = [];
  }

  if (!Array.isArray(data.sessions)) {
    data.sessions = [];
  }

  if (!Array.isArray(data.organizations)) {
    data.organizations = [];
  }

  if (!Array.isArray(data.departments)) {
    data.departments = [];
  }

  if (!Array.isArray(data.staff)) {
    data.staff = [];
  }

  if (!Array.isArray(data.statuses)) {
    data.statuses = [];
  }

  if (!Array.isArray(data.priorities)) {
    data.priorities = [];
  }

  if (!Array.isArray(data.complexities)) {
    data.complexities = [];
  }

  if (!Array.isArray(data.projects)) {
    data.projects = [];
  }

  if (!Array.isArray(data.tasks)) {
    data.tasks = [];
  }

  if (!Array.isArray(data.taskAssignees)) {
    data.taskAssignees = [];
  }

  if (!Array.isArray(data.taskPredecessors)) {
    data.taskPredecessors = [];
  }

  if (!Array.isArray(data.taskProgress)) {
    data.taskProgress = [];
  }

  if (!Array.isArray(data.taskEvaluations)) {
    data.taskEvaluations = [];
  }

  if (!Array.isArray(data.taskStatusReports)) {
    data.taskStatusReports = [];
  }

  if (!Array.isArray(data.projectStatusReports)) {
    data.projectStatusReports = [];
  }

  // Clean up expired sessions (sessions older than refresh token expiry)
  const now = new Date();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  const validSessions = data.sessions.filter((session) => {
    const sessionDate = new Date(session.createdAt);
    return now.getTime() - sessionDate.getTime() < maxAge;
  });

  // Update sessions if any were removed
  if (validSessions.length !== data.sessions.length) {
    data.sessions = validSessions;
    await database.write();
  }
}

/**
 * Get database statistics
 *
 * @param database - Database instance
 * @returns Object containing database statistics
 */
export function getDatabaseStats(database: Database) {
  const data = database.data;

  return {
    userCount: data.users.length,
    sessionCount: data.sessions.length,
    organizationCount: data.organizations.length,
    departmentCount: data.departments.length,
    staffCount: data.staff.length,
    statusCount: data.statuses.length,
    priorityCount: data.priorities.length,
    complexityCount: data.complexities.length,
    projectCount: data.projects.length,
    taskCount: data.tasks.length,
    taskAssigneeCount: data.taskAssignees.length,
    taskPredecessorCount: data.taskPredecessors.length,
    taskProgressCount: data.taskProgress.length,
    taskEvaluationCount: data.taskEvaluations.length,
    taskStatusReportCount: data.taskStatusReports.length,
    projectStatusReportCount: data.projectStatusReports.length,
    activeSessions: data.sessions.filter((session) => {
      const sessionDate = new Date(session.createdAt);
      const now = new Date();
      const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
      return sessionDate.getTime() > oneDayAgo;
    }).length,
  };
}
