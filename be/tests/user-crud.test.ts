import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'crud-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'crud-db.json');
});

describe('User CRUD', () => {
  test('requires auth', async () => {
    const res = await request(app).post('/graphql').send({
      query: `query { users { id } }`,
    });
    expect(res.body.errors[0].message).toBe('Unauthenticated');
  });

  test('create update delete', async () => {
    const reg = await request(app).post('/graphql').send({
      query: `mutation { register(email: "main@example.com", password: "p") { token } }`,
    });
    const token = reg.body.data.register.token;

    const auth = { Authorization: `Bearer ${token}` };

    const create = await request(app).post('/graphql').set(auth).send({
      query: `mutation { createUser(email: "u@example.com", password: "pass", firstName: "F", lastName: "L", note: "N") { id firstName lastName note } }`,
    });
    const id = create.body.data.createUser.id;
    expect(create.body.data.createUser.firstName).toBe('F');

    const update = await request(app)
      .post('/graphql')
      .set(auth)
      .send({
        query: `mutation { updateUser(id: "${id}", note: "Updated") { note } }`,
      });
    expect(update.body.data.updateUser.note).toBe('Updated');

    const list = await request(app)
      .post('/graphql')
      .set(auth)
      .send({ query: `query { users { id } }` });
    expect(list.body.data.users.length).toBe(2);

    const del = await request(app)
      .post('/graphql')
      .set(auth)
      .send({ query: `mutation { deleteUser(id: "${id}") }` });
    expect(del.body.data.deleteUser).toBe(true);

    const listAfter = await request(app)
      .post('/graphql')
      .set(auth)
      .send({ query: `query { users { id } }` });
    expect(listAfter.body.data.users.length).toBe(1);
  });
});
