import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'test-db.json');
  const authFile = path.join(__dirname, 'auth.json');
  const dataFile = path.join(__dirname, 'db-default.json');
  
  // Clean up any existing test database files
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  // cleanup test database files
  const dbFile = path.join(__dirname, 'test-db.json');
  const authFile = path.join(__dirname, 'auth.json');
  const dataFile = path.join(__dirname, 'db-default.json');
  
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
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
    expect(invalidRes.body.errors).toBeTruthy();
  });
});
