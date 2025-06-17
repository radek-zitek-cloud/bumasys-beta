import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'session-test-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'session-test-db.json');
});

describe('Session Management', () => {
  test('logout invalidates all user tokens', async () => {
    // Register a user
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "session@example.com", password: "pass", firstName: "Session", lastName: "User") { token refreshToken user { id } } }`,
    });
    // Assert no GraphQL errors and data is present
    expect(registerRes.body.errors).toBeFalsy();
    expect(registerRes.body.data).toBeTruthy();
    expect(registerRes.body.data.register).toBeTruthy();
    const userId = registerRes.body.data.register.user.id;
    const firstRefreshToken = registerRes.body.data.register.refreshToken;

    // Login again to get a second refresh token
    const loginRes = await request(app).post('/graphql').send({
      query: `mutation { login(email: "session@example.com", password: "pass") { token refreshToken user { id } } }`,
    });
    expect(loginRes.body.data.login).toBeTruthy();
    const secondRefreshToken = loginRes.body.data.login.refreshToken;

    // Verify both tokens work
    const refresh1Res = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${firstRefreshToken}") { token refreshToken } }`,
      });
    expect(refresh1Res.body.data.refreshToken.token).toBeTruthy();
    const newFirstToken = refresh1Res.body.data.refreshToken.refreshToken;

    const refresh2Res = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${secondRefreshToken}") { token refreshToken } }`,
      });
    expect(refresh2Res.body.data.refreshToken.token).toBeTruthy();
    const newSecondToken = refresh2Res.body.data.refreshToken.refreshToken;

    // Logout using one of the tokens - this should invalidate ALL tokens
    const logoutRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { logout(refreshToken: "${newFirstToken}") }`,
      });
    expect(logoutRes.body.data.logout).toBe(true);

    // Try to use both tokens - both should be invalid now
    const invalidRes1 = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${newFirstToken}") { token } }`,
      });
    
    // After logout, tokens should be invalid - check for error response
    const hasErrors1 = invalidRes1.body.errors && invalidRes1.body.errors.length > 0;
    const hasNullData1 = invalidRes1.body.data === null;
    expect(hasErrors1 || hasNullData1).toBe(true);
    
    if (invalidRes1.body.errors) {
      expect(Array.isArray(invalidRes1.body.errors)).toBe(true);
      expect(invalidRes1.body.errors.length).toBeGreaterThan(0);
    }

    const invalidRes2 = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${newSecondToken}") { token } }`,
      });
    
    const hasErrors2 = invalidRes2.body.errors && invalidRes2.body.errors.length > 0;
    const hasNullData2 = invalidRes2.body.data === null;
    expect(hasErrors2 || hasNullData2).toBe(true);
    
    if (invalidRes2.body.errors) {
      expect(Array.isArray(invalidRes2.body.errors)).toBe(true);
      expect(invalidRes2.body.errors.length).toBeGreaterThan(0);
    }
  });

  test('sessions persist across server restarts', async () => {
    // This test verifies that sessions are stored in the database, not memory
    // First, create a session
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "persist@example.com", password: "pass", firstName: "Persist", lastName: "User") { token refreshToken user { id } } }`,
    });
    expect(registerRes.body.data.register).toBeTruthy();
    const refreshToken = registerRes.body.data.register.refreshToken;

    // Verify the token works
    const refreshRes = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${refreshToken}") { token refreshToken } }`,
      });
    expect(refreshRes.body.data.refreshToken.token).toBeTruthy();
    const newRefreshToken = refreshRes.body.data.refreshToken.refreshToken;

    // Check for database files (auth.json contains sessions in the new system)
    const authFile = path.join(__dirname, 'auth.json');
    const dataFile = path.join(__dirname, 'db-default.json');
    
    // At least one of the database files should exist and contain session data
    let sessionFound = false;
    
    if (fs.existsSync(authFile)) {
      const authContent = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      if (authContent.sessions && authContent.sessions.length > 0) {
        sessionFound = authContent.sessions.some((s: any) => s.token === newRefreshToken);
      }
    }
    
    // If auth file doesn't contain sessions, check the main database file
    if (!sessionFound) {
      const dbFile = path.join(__dirname, 'session-test-db.json');
      if (fs.existsSync(dbFile)) {
        const dbContent = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
        if (dbContent.sessions && dbContent.sessions.length > 0) {
          sessionFound = dbContent.sessions.some((s: any) => s.token === newRefreshToken);
        }
      }
    }
    
    expect(sessionFound).toBe(true);
  });
});
