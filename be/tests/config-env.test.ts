import path from 'path';

delete process.env.FCRM_PORT;
delete process.env.FCRM_JWT_SECRET;
delete process.env.FCRM_DB_FILE;

test('env overrides config values', () => {
  process.env.FCRM_PORT = '5005';
  process.env.FCRM_JWT_SECRET = 'envsecret123';
  process.env.FCRM_DB_FILE = path.join(__dirname, 'env-db.json');
  jest.resetModules();
  const config = require('../src/utils/config').default;
  expect(config.port).toBe(5005);
  expect(config.jwtSecret).toBe('envsecret123');
  expect(config.dbFile).toBe(process.env.FCRM_DB_FILE);
  delete process.env.FCRM_PORT;
  delete process.env.FCRM_JWT_SECRET;
  delete process.env.FCRM_DB_FILE;
});
