/**
 * @fileoverview Database tag health query test
 *
 * Tests to verify that the health query includes the current database tag.
 */

import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;
let authToken: string;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'health-db-tag-test.json');
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
  cleanupTestDatabases(__dirname, 'health-db-tag-test.json');
});

describe('Health Query with Database Tag', () => {
  test('returns current database tag in health query', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          query {
            health
            databaseTag
          }
        `,
      });

    expect(res.body.data.health).toBe(true);
    expect(res.body.data.databaseTag).toBe('default');
  });

  test('database tag changes when switching databases', async () => {
    // First, verify current tag is default
    const res1 = await request(app)
      .post('/graphql')
      .send({
        query: `
          query {
            databaseTag
          }
        `,
      });

    expect(res1.body.data.databaseTag).toBe('default');

    // Switch to production database
    const switchRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "staging") }`,
      });

    expect(switchRes.body.data.dbtag).toBe(true);

    // Verify the tag has changed
    const res2 = await request(app)
      .post('/graphql')
      .send({
        query: `
          query {
            databaseTag
          }
        `,
      });

    expect(res2.body.data.databaseTag).toBe('staging');
  });

  test('database tag is accessible without authentication', async () => {
    // The databaseTag should be accessible even without authentication
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          query {
            databaseTag
          }
        `,
      });

    expect(res.body.data.databaseTag).toBeDefined();
    expect(typeof res.body.data.databaseTag).toBe('string');
  });
});
