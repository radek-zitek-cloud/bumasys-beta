import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'test-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'test-db.json');
});

describe('Auth', () => {
  test('register, login, refresh and logout', async () => {
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "test@example.com", password: "pass", firstName: "Test", lastName: "User", note: "N") { token refreshToken user { id email firstName lastName note } } }`,
    });
    const { refreshToken } = registerRes.body.data.register;
    expect(registerRes.body.data.register.user.firstName).toBe('Test');
    expect(refreshToken).toBeTruthy();

    const loginRes = await request(app).post('/graphql').send({
      query: `mutation { login(email: "test@example.com", password: "pass") { token refreshToken user { id } } }`,
    });
    expect(loginRes.body.data.login.refreshToken).toBeTruthy();
    const refTok = loginRes.body.data.login.refreshToken;

    const refreshRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${refTok}") { token refreshToken } }`,
      });
    expect(refreshRes.body.data.refreshToken.token).toBeTruthy();
    const newRefresh = refreshRes.body.data.refreshToken.refreshToken;

    const logoutRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { logout(refreshToken: "${newRefresh}") }`,
      });
    expect(logoutRes.body.data.logout).toBe(true);

    const invalidRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${newRefresh}") { token } }`,
      });
    
    // After logout, the refresh token should be invalid and cause an error
    // GraphQL errors can be returned in different ways - check for error response
    const hasErrors = invalidRes.body.errors && invalidRes.body.errors.length > 0;
    const hasNullData = invalidRes.body.data === null;
    
    // Either there should be GraphQL errors, or the data should be null
    expect(hasErrors || hasNullData).toBe(true);
    
    // If there are errors, they should be properly formatted
    if (invalidRes.body.errors) {
      expect(Array.isArray(invalidRes.body.errors)).toBe(true);
      expect(invalidRes.body.errors.length).toBeGreaterThan(0);
    }
  });
});
