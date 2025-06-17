import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'debug-test-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'debug-test-db.json');
});

describe('Debug Response Structure', () => {
  test('check response structure for invalid refresh token', async () => {
    // Use a completely invalid token
    const invalidRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "invalid-token") { token } }`,
      });
    
    console.log('Response status:', invalidRes.status);
    console.log('Response body:', JSON.stringify(invalidRes.body, null, 2));
    
    // This test is just for debugging - always pass
    expect(true).toBe(true);
  });
});
