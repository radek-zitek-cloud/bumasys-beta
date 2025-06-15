/**
 * @fileoverview Tests for dynamic configuration system
 */

import path from 'path';

// Clean environment before each test
function cleanEnv() {
  delete process.env.FCRM_PORT;
  delete process.env.FCRM_JWT_SECRET;
  delete process.env.FCRM_DB_FILE;
  delete process.env.FCRM_BETTER_STACK_ENABLED;
  delete process.env.FCRM_BETTER_STACK_SOURCE_TOKEN;
}

describe('Dynamic Configuration', () => {
  beforeEach(() => {
    cleanEnv();
    jest.resetModules();
  });

  afterEach(() => {
    cleanEnv();
  });

  test('can access logging.level field from JSON config', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    const config = require('../src/utils/config').default;

    // The default.json has logging.level: "debug"
    // In test environment, test.json doesn't override this, so we should get the default
    expect(config.logging).toBeDefined();
    expect(config.logging.level).toBe('debug');
  });

  test('demonstrates the core issue solution: adding config without code changes', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    const config = require('../src/utils/config').default;

    // These new fields were added to local.json without any code changes
    // This demonstrates the solution to the original issue
    expect(config.newFeature).toBeDefined();
    expect(config.newFeature.enabled).toBe(true);
    expect(config.newFeature.options.maxRetries).toBe(3);
    expect(config.newFeature.options.timeout).toBe(5000);
    expect(config.customSetting).toBe('dynamicValue');

    // Nested access also works
    expect(config.newFeature.options).toEqual({
      maxRetries: 3,
      timeout: 5000,
    });
  });

  test('can access any new field added to JSON without code changes', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    // This test demonstrates that any field in the JSON config can be accessed
    // Let's test with fields that might exist in default.json
    const config = require('../src/utils/config').default;

    // Test that we can access logging.level which exists in default.json but wasn't in the old schema
    expect(config.logging.level).toBe('debug');

    // Test that accessing non-existent fields returns undefined (dynamic behavior)
    expect(config.nonExistentField).toBeUndefined();
  });

  test('maintains critical field validation', () => {
    process.env.FCRM_JWT_SECRET = 'short'; // Too short, should fail validation
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    expect(() => {
      require('../src/utils/config').default;
    }).toThrow(/Invalid critical configuration/);
  });

  test('supports assignment for test purposes', () => {
    process.env.FCRM_JWT_SECRET = 'testsecret1234567890';
    process.env.FCRM_DB_FILE = path.join(__dirname, 'test-db.json');

    const config = require('../src/utils/config').default;

    // This should work for test overrides
    config.dbFile = 'custom-test-db.json';
    expect(config.dbFile).toBe('custom-test-db.json');
  });
});
