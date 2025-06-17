import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;
let authToken: string;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'dbtag-test-db.json');
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
  cleanupTestDatabases(__dirname, 'dbtag-test-db.json');
});

describe('Database Tag Management', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/graphql').send({
      query: `mutation { dbtag(tag: "test") }`,
    });
    expect(res.body.errors[0].message).toBe('Unauthenticated');
  });

  test('switches database tag successfully', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "production") }`,
      });

    expect(res.body.data.dbtag).toBe(true);
  });

  test('rejects invalid tag format', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "invalid tag with spaces") }`,
      });

    expect(res.body.errors).toBeTruthy();
    expect(res.body.errors[0].message).toContain('Invalid tag format');
  });

  test('rejects reserved tag names', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "auth") }`,
      });

    expect(res.body.errors).toBeTruthy();
    expect(res.body.errors[0].message).toContain('reserved');
  });

  test('creates new database file for new tag', async () => {
    const newTag = 'testing-environment';
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `mutation { dbtag(tag: "${newTag}") }`,
      });

    expect(res.body.data.dbtag).toBe(true);

    // Verify we can create data in the new database
    const orgRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createOrganization(name: "Test Org in New DB") {
              id
              name
            }
          }
        `,
      });

    expect(orgRes.body.data.createOrganization.name).toBe('Test Org in New DB');
  });
});
