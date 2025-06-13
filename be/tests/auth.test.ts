import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  const config = require('../src/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  // cleanup
});

describe('Auth', () => {
  test('register and login', async () => {
    const registerRes = await request(app).post('/graphql').send({
      query: `mutation { register(email: "test@example.com", password: "pass") { token user { id email } } }`,
    });
    expect(registerRes.body.data.register.user.email).toBe('test@example.com');

    const loginRes = await request(app).post('/graphql').send({
      query: `mutation { login(email: "test@example.com", password: "pass") { token user { id } } }`,
    });
    expect(loginRes.body.data.login.token).toBeTruthy();
  });
});
