/**
 * @fileoverview Database utilities
 *
 * This module provides utility functions for database operations
 * and database-related helper functions.
 */

import fs from 'fs';
import path from 'path';
import type { Database } from '../types';

/**
 * Create and initialize a JSON file-based database
 *
 * @param filePath - Path to the JSON database file
 * @returns Promise resolving to Database instance
 */
export async function createDatabase(filePath: string): Promise<Database> {
  const dbPath = path.resolve(filePath);

  // Create database file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [],
      sessions: [],
      organizations: [],
      departments: [],
      staff: [],
    };

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
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

  // Return database interface
  return {
    get data() {
      return data;
    },
    async write() {
      // Write data atomically by writing to temp file first
      const tempPath = `${dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, dbPath);
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
    activeSessions: data.sessions.filter((session) => {
      const sessionDate = new Date(session.createdAt);
      const now = new Date();
      const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
      return sessionDate.getTime() > oneDayAgo;
    }).length,
  };
}
