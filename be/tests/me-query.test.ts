import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;
let token: string;
let userId: string;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'me-query-test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());

  // Register a user with full data
  const registerRes = await request(app)
    .post('/graphql')
    .send({
      query: `mutation { 
      register(
        email: "me-test@example.com", 
        password: "password123", 
        firstName: "John", 
        lastName: "Doe", 
        note: "Test user for me query"
      ) { 
        token 
        user { id email firstName lastName note } 
      } 
    }`,
    });

  token = registerRes.body.data.register.token;
  userId = registerRes.body.data.register.user.id;

  // Verify user was created with full data
  expect(registerRes.body.data.register.user.firstName).toBe('John');
  expect(registerRes.body.data.register.user.lastName).toBe('Doe');
  expect(registerRes.body.data.register.user.note).toBe(
    'Test user for me query',
  );
});

afterAll(() => {
  const dbFile = path.join(__dirname, 'me-query-test-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe('Me Query Bug', () => {
  test('me query should return full user data like user query', async () => {
    // Test the user query (this should work correctly)
    const userQueryRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `query { 
          user(id: "${userId}") { 
            id 
            email 
            firstName 
            lastName 
            note 
          } 
        }`,
      });

    expect(userQueryRes.body.data.user).toEqual({
      id: userId,
      email: 'me-test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      note: 'Test user for me query',
    });

    // Test the me query (this is currently broken)
    const meQueryRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `query { 
          me { 
            id 
            email 
            firstName 
            lastName 
            note 
          } 
        }`,
      });

    // This test will currently fail because me query returns null for firstName, lastName, note
    // After the fix, this should pass
    expect(meQueryRes.body.data.me).toEqual({
      id: userId,
      email: 'me-test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      note: 'Test user for me query',
    });
  });

  test('me query should return null when not authenticated', async () => {
    const meQueryRes = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
          me { 
            id 
            email 
            firstName 
            lastName 
            note 
          } 
        }`,
      });

    expect(meQueryRes.body.data.me).toBeNull();
  });
});
