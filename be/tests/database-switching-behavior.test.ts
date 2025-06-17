/**
 * @fileoverview Database switching behavior test
 *
 * Tests to verify that database switching properly flushes in-memory data
 * and loads fresh data from the new database file.
 */

import type { Application } from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;
let authToken: string;
let testDataDir: string;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'db-switch-test.json');
  testDataDir = path.dirname(dbFile);
  
  // Clean up any existing tagged database files
  const taggedDbFiles = [
    'db-production.json',
    'db-testing.json', 
    'db-default.json',
    'auth.json'
  ];
  
  for (const fileName of taggedDbFiles) {
    const filePath = path.join(testDataDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());

  // Register and authenticate a user to get auth token
  const registerRes = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation {
          register(email: "test@example.com", password: "password123") {
            token
          }
        }
      `,
    });
  authToken = registerRes.body.data.register.token;
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'db-switch-test.json');
  
  // Clean up tagged database files created during tests
  const taggedDbFiles = [
    'db-production.json',
    'db-testing.json', 
    'db-default.json',
    'auth.json'
  ];
  
  for (const fileName of taggedDbFiles) {
    const filePath = path.join(testDataDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

describe('Database Switching Data Isolation', () => {
  test('data from previous database disappears after switching', async () => {
    // Step 1: Create organization in default database
    const orgRes1 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createOrganization(name: "Default DB Organization") {
              id
              name
            }
          }
        `,
      });

    expect(orgRes1.body.data.createOrganization.name).toBe('Default DB Organization');
    const orgId = orgRes1.body.data.createOrganization.id;

    // Step 2: Verify organization exists in default database
    const queryRes1 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            organizations {
              id
              name
            }
          }
        `,
      });

    expect(queryRes1.body.data.organizations).toHaveLength(1);
    expect(queryRes1.body.data.organizations[0].name).toBe('Default DB Organization');

    // Step 3: Switch to production database
    const switchRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "production") }`,
      });

    expect(switchRes.body.data.dbtag).toBe(true);

    // Step 4: Verify organizations list is empty in production database
    const queryRes2 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            organizations {
              id
              name
            }
          }
        `,
      });

    expect(queryRes2.body.data.organizations).toHaveLength(0);

    // Step 5: Create different organization in production database
    const orgRes2 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createOrganization(name: "Production DB Organization") {
              id
              name
            }
          }
        `,
      });

    expect(orgRes2.body.data.createOrganization.name).toBe('Production DB Organization');

    // Step 6: Verify production database has only new organization
    const queryRes3 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            organizations {
              id
              name
            }
          }
        `,
      });

    expect(queryRes3.body.data.organizations).toHaveLength(1);
    expect(queryRes3.body.data.organizations[0].name).toBe('Production DB Organization');

    // Step 7: Switch back to default database
    const switchBackRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "default") }`,
      });

    expect(switchBackRes.body.data.dbtag).toBe(true);

    // Step 8: Verify default database still has original organization
    const queryRes4 = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            organizations {
              id
              name
            }
          }
        `,
      });

    expect(queryRes4.body.data.organizations).toHaveLength(1);
    expect(queryRes4.body.data.organizations[0].name).toBe('Default DB Organization');
    expect(queryRes4.body.data.organizations[0].id).toBe(orgId);
  });

  test('departments also switch correctly between databases', async () => {
    // Start in default database and create an organization with department
    const orgRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createOrganization(name: "Default Org for Dept Test") {
              id
              name
            }
          }
        `,
      });

    const orgId = orgRes.body.data.createOrganization.id;

    const deptRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createDepartment(name: "Default Department", organizationId: "${orgId}") {
              id
              name
            }
          }
        `,
      });

    expect(deptRes.body.data.createDepartment.name).toBe('Default Department');

    // Switch to testing database
    await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "testing") }`,
      });

    // Verify departments are empty in testing database
    const queryRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            departments {
              id
              name
            }
          }
        `,
      });

    expect(queryRes.body.data.departments).toHaveLength(0);
  });
});
