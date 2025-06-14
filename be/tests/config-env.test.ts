import path from 'path';

delete process.env.PORT;
delete process.env.JWT_SECRET;
delete process.env.DB_FILE;

test('env overrides config values', () => {
  process.env.PORT = '5005';
  process.env.JWT_SECRET = 'envsecret123';
  process.env.DB_FILE = path.join(__dirname, 'env-db.json');
  jest.resetModules();
  const config = require('../src/utils/config').default;
  expect(config.port).toBe(5005);
  expect(config.jwtSecret).toBe('envsecret123');
  expect(config.dbFile).toBe(process.env.DB_FILE);
  delete process.env.PORT;
  delete process.env.JWT_SECRET;
  delete process.env.DB_FILE;
});
