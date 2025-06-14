import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';
import path from 'path';

let app: Application;

beforeAll(async () => {
  const dbFile = path.join(__dirname, 'config-db.json');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

afterAll(() => {
  // cleanup
});

describe('Config query', () => {
  test('returns configuration without sensitive values', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
        query {
          config {
            port
            accessTokenExpiresIn
            refreshTokenExpiresIn
            dbFile
            logging {
              betterStack {
                enabled
              }
            }
          }
        }
      `,
      });

    expect(res.body.data.config).toBeTruthy();
    expect(res.body.data.config.port).toBe(4000);
    expect(res.body.data.config.accessTokenExpiresIn).toBe('60m');
    expect(res.body.data.config.refreshTokenExpiresIn).toBe('7d');
    expect(res.body.data.config.dbFile).toBe('config-db.json'); // Only filename, not full path
    expect(typeof res.body.data.config.logging.betterStack.enabled).toBe(
      'boolean',
    );
  });

  test('does not expose sensitive configuration values', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
        query {
          config {
            port
            accessTokenExpiresIn
            refreshTokenExpiresIn
            dbFile
            logging {
              betterStack {
                enabled
              }
            }
          }
        }
      `,
      });

    // The response should not contain any sensitive fields
    const configStr = JSON.stringify(res.body.data.config);
    expect(configStr).not.toContain('jwtSecret');
    expect(configStr).not.toContain('sourceToken');
  });
});
