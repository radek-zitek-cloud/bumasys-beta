/**
 * @fileoverview Database backup integration test
 * 
 * Tests the database backup functionality implemented for the admin page.
 */

import fs from 'fs';
import path from 'path';
import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

describe('Database Backup', () => {
  let app: Application;
  let authToken: string;

  beforeAll(async () => {
    const dbFile = setupTestDatabase(__dirname, 'backup-test-db.json');
    const config = require('../src/utils/config').default;
    config.dbFile = dbFile;
    ({ app } = await createApp());
    
    // Register and login to get auth token
    const registerRes = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(email: "backup-test@example.com", password: "backup-password") {
              token
              user {
                id
                email
              }
            }
          }
        `
      });

    expect(registerRes.body.data.register.token).toBeTruthy();
    authToken = registerRes.body.data.register.token;
  });

  afterAll(async () => {
    // Clean up test files
    await cleanupTestDatabases(__dirname, 'backup-test-db.json');
  });

  it('creates a database backup when authenticated', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            backupDatabase
          }
        `
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.backupDatabase).toBeTruthy();
    
    const backupPath = res.body.data.backupDatabase;
    expect(backupPath).toMatch(/^backups\/backup-default-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/);
    
    // Verify backup file exists in the test data directory
    const testDataDir = path.dirname(require('../src/utils/config').default.dbFile);
    const fullBackupPath = path.join(testDataDir, backupPath);
    expect(fs.existsSync(fullBackupPath)).toBe(true);
    
    // Verify backup file contains expected structure
    const backupContent = JSON.parse(fs.readFileSync(fullBackupPath, 'utf-8'));
    expect(backupContent.timestamp).toBeTruthy();
    expect(backupContent.version).toBe('1.0');
    expect(backupContent.tag).toBe('default');
    expect(backupContent.auth).toBeDefined();
    expect(backupContent.data).toBeDefined();
    expect(backupContent.auth.users).toBeDefined();
    expect(backupContent.auth.sessions).toBeDefined();
  });

  it('requires authentication for backup', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            backupDatabase
          }
        `
      });

    expect(res.body.errors).toBeTruthy();
    expect(res.body.errors[0].message).toBe('Unauthenticated');
  });
});