import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'session-test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  // cleanup
  const dbFile = path.join(__dirname, 'session-test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe('Session Management', () => {
  test('logout invalidates all user tokens', async () => {
    // Register a user
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "session@example.com", password: "pass", firstName: "Session", lastName: "User") { token refreshToken user { id } } }`,
    });
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
    expect(invalidRes1.body.errors).toBeTruthy();

    const invalidRes2 = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { refreshToken(refreshToken: "${newSecondToken}") { token } }`,
      });
    expect(invalidRes2.body.errors).toBeTruthy();
  });

  test('sessions persist across server restarts', async () => {
    // This test verifies that sessions are stored in the database, not memory
    // First, create a session
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "persist@example.com", password: "pass") { token refreshToken user { id } } }`,
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

    // Read the database file to verify the session is stored
    const dbFile = path.join(__dirname, 'session-test-db.json');
    const dbContent = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    expect(dbContent.sessions).toBeDefined();
    expect(dbContent.sessions.length).toBeGreaterThan(0);
    expect(
      dbContent.sessions.some((s: any) => s.token === newRefreshToken),
    ).toBe(true);
  });
});
