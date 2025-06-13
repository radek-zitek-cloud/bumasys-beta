const request = require('supertest');
const { createApp } = require('../src/index');
const fs = require('fs');
const path = require('path');

let app;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  process.chdir(path.join(__dirname, '..', 'src'));
  const config = require('./../src/config');
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
