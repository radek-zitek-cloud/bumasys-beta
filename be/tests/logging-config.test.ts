/**
 * @fileoverview Tests for logging configuration including BetterStack integration
 */

import path from 'path';

// Clean environment
delete process.env.FCRM_BETTER_STACK_ENABLED;
delete process.env.FCRM_BETTER_STACK_SOURCE_TOKEN;
delete process.env.FCRM_PORT;
delete process.env.FCRM_JWT_SECRET;
delete process.env.FCRM_DB_FILE;

describe('Logging Configuration', () => {
  beforeEach(() => {
    // Clean up environment and module cache
    delete process.env.FCRM_BETTER_STACK_ENABLED;
    delete process.env.FCRM_BETTER_STACK_SOURCE_TOKEN;
    delete process.env.FCRM_PORT;
    delete process.env.FCRM_JWT_SECRET;
    delete process.env.FCRM_DB_FILE;
    jest.resetModules();
  });

  afterEach(() => {
    // Clean up after each test
    delete process.env.FCRM_BETTER_STACK_ENABLED;
    delete process.env.FCRM_BETTER_STACK_SOURCE_TOKEN;
    delete process.env.FCRM_PORT;
    delete process.env.FCRM_JWT_SECRET;
    delete process.env.FCRM_DB_FILE;
  });

  test('default configuration has BetterStack disabled', () => {
    // Set required config values
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    const config = require('../src/utils/config').default;
    expect(config.logging.betterStack.enabled).toBe(false);
    expect(config.logging.betterStack.sourceToken).toBe('');
  });

  test('environment variables override BetterStack config', () => {
    // Set required config values
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    // Set BetterStack config
    process.env.FCRM_BETTER_STACK_ENABLED = 'true';
    process.env.FCRM_BETTER_STACK_SOURCE_TOKEN = 'test-token-123';

    const config = require('../src/utils/config').default;
    expect(config.logging.betterStack.enabled).toBe(true);
    expect(config.logging.betterStack.sourceToken).toBe('test-token-123');
  });

  test('logger can be imported without errors when BetterStack is disabled', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    expect(() => {
      const logger = require('../src/utils/logger').default;
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    }).not.toThrow();
  });

  test('logger can be imported when BetterStack is enabled but no token provided', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');
    process.env.FCRM_BETTER_STACK_ENABLED = 'true';
    // No token provided intentionally

    expect(() => {
      const logger = require('../src/utils/logger').default;
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    }).not.toThrow();
  });

  test('logger can be imported when BetterStack is enabled with token', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');
    process.env.FCRM_BETTER_STACK_ENABLED = 'true';
    process.env.FCRM_BETTER_STACK_SOURCE_TOKEN = 'test-token-123';

    expect(() => {
      const logger = require('../src/utils/logger').default;
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    }).not.toThrow();
  });
});
