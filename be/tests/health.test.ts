import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'health-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  // cleanup
});

describe('Health query', () => {
  test('returns true when server is ready', async () => {
    const res = await request(app).post('/graphql').send({
      query: `query { health }`,
    });
    expect(res.body.data.health).toBe(true);
  });
});
