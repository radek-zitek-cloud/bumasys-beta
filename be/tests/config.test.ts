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
          config
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
          config
        }
      `,
      });

    // The response should not contain any sensitive fields
    const configStr = JSON.stringify(res.body.data.config);
    expect(configStr).not.toContain('jwtSecret');
    expect(configStr).not.toContain('sourceToken');
  });

  test('returns all dynamic configuration fields without code changes', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
        query {
          config
        }
      `,
      });

    expect(res.body.data.config).toBeTruthy();
    
    // Check that all required fields from problem statement are present
    const config = res.body.data.config;
    
    // Original fields should be present
    expect(config.port).toBe(4000);
    expect(config.accessTokenExpiresIn).toBe('60m');
    expect(config.refreshTokenExpiresIn).toBe('7d');
    expect(config.dbFile).toBe('config-db.json');
    
    // Complete logging structure should be present (was partially missing before)
    expect(config.logging).toBeTruthy();
    expect(config.logging.level).toBe('debug'); // This was missing before
    expect(config.logging.betterStack).toBeTruthy();
    expect(typeof config.logging.betterStack.enabled).toBe('boolean');
    
    // Dynamic fields should be present (were completely missing before)
    expect(config.newFeature).toBeTruthy();
    expect(config.newFeature.enabled).toBe(true);
    expect(config.newFeature.options).toBeTruthy();
    expect(config.newFeature.options.maxRetries).toBe(3);
    expect(config.newFeature.options.timeout).toBe(5000);
    
    expect(config.customSetting).toBe('dynamicValue');
    
    // Sensitive fields should be completely excluded
    expect(config.jwtSecret).toBeUndefined();
    expect(config.logging.betterStack.sourceToken).toBeUndefined();
  });
});
