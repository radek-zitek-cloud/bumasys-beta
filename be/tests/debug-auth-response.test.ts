import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

describe('Debug Auth Response', () => {
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

  test('check refresh token response after logout', async () => {
    // Register user
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "test@example.com", password: "pass", firstName: "Test", lastName: "User", note: "N") { token refreshToken user { id email firstName lastName note } } }`,
    });

    const { refreshToken } = registerRes.body.data.register;

    // Logout to invalidate tokens
    const logoutRes = await request(app).post('/graphql').send({
      query: `mutation { logout(refreshToken: "${refreshToken}") }`,
    });

    // Try to use the invalidated refresh token
    const invalidRes = await request(app).post('/graphql').send({
      query: `mutation { refreshToken(refreshToken: "${refreshToken}") { token refreshToken } }`,
    });

    console.log('Invalid refresh token response:', JSON.stringify(invalidRes.body, null, 2));
    
    // Print response status and other details
    console.log('Response status:', invalidRes.status);
  });
});
